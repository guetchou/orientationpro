'use strict';

// Recette non destructive du parcours RIASEC invité en production (#216.10).
// Portée volontairement bornée à l'invité (aucun compte réel créé, aucune
// donnée personnelle) : vérifie le SHA servi, le registre de capacités
// public, l'instrument RIASEC public, puis exécute une vraie passation
// invité (gestion manuelle du cookie de session, sans bibliothèque) et
// compare le score retourné par la production à la valeur exacte attendue
// (banque d'oracles calculée par le vrai moteur, pas devinée). L'artefact
// créé (session invité + tentative + résultat) expirera automatiquement
// sous 7 jours via la purge déjà existante côté backend — aucune suppression
// manuelle nécessaire.
//
// Usage : node scripts/release/life-project-production-recette.cjs
// Variables : LIFE_PROJECT_RECETTE_WEB_URL (défaut https://makoki.org)

const fs = require('node:fs');
const path = require('node:path');

const webUrl = (process.env.LIFE_PROJECT_RECETTE_WEB_URL || 'https://makoki.org').replace(/\/$/, '');
const apiRoot = `${webUrl}/api`;
const outputPath = process.env.LIFE_PROJECT_RECETTE_OUTPUT
  || path.join(__dirname, '..', '..', 'docs', 'testing', 'life-project-production-recette-last-run.json');

const ORACLE_PROFILE_ID = 'dominant-r';
const oracleBank = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', '..', 'tests', 'life-project', 'oracles', 'riasec-profiles.v1.json'),
  'utf8',
));
const oracleItems = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', '..', 'tests', 'life-project', 'oracles', 'riasec-items.v1.json'),
  'utf8',
));
const profile = oracleBank.profiles.find((entry) => entry.id === ORACLE_PROFILE_ID);
if (!profile) throw new Error(`Oracle profile "${ORACLE_PROFILE_ID}" not found in the versioned bank.`);
const valueByItemId = new Map(profile.responses.map((entry) => [entry.itemId, entry.value]));

let cookieJar = '';
const captureCookies = (response) => {
  const setCookie = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : []);
  for (const raw of setCookie) {
    const pair = raw.split(';')[0];
    const [name] = pair.split('=');
    const existing = cookieJar.split('; ').filter(Boolean).filter((entry) => !entry.startsWith(`${name}=`));
    cookieJar = [...existing, pair].join('; ');
  }
};

const request = async (requestPath, { expected, ...options } = {}) => {
  const response = await fetch(`${apiRoot}${requestPath}`, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(cookieJar ? { cookie: cookieJar } : {}),
      ...(options.headers || {}),
    },
  });
  captureCookies(response);
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 400) }; }
  }
  if (expected && response.status !== expected) {
    throw new Error(`${options.method || 'GET'} ${requestPath}: expected HTTP ${expected}, received ${response.status}: ${JSON.stringify(body)}`);
  }
  return { response, body };
};

const evidence = { webUrl, apiRoot, oracleProfileId: ORACLE_PROFILE_ID, steps: [] };
const record = (name, data) => { evidence.steps.push({ name, ...data }); };

const main = async () => {
  const { body: health } = await request('/test/health', { expected: 200 });
  record('served-sha', { gitSha: health.gitSha, uptime: health.uptime });
  console.log(`SHA servi en production : ${health.gitSha}`);

  const { body: registry } = await request('/v1/capabilities', { expected: 200 });
  const lifeProjectCapability = registry.capabilities?.find((entry) => entry.id === 'life-project.core-v1');
  if (!lifeProjectCapability?.configured) {
    throw new Error(`life-project.core-v1 n'est pas configurée en production : ${JSON.stringify(lifeProjectCapability)}`);
  }
  record('capability-registry', { lifeProjectCapability });
  console.log('Capacité life-project.core-v1 : configurée.');

  const { body: instrument } = await request('/v1/orientation/riasec/instrument', { expected: 200 });
  if (instrument.instrument.itemCount !== 60 || instrument.instrument.items.length !== 60) {
    throw new Error(`Instrument RIASEC public inattendu : ${instrument.instrument.itemCount} items (attendu 60).`);
  }
  record('public-instrument', { itemCount: instrument.instrument.itemCount, instrumentId: instrument.instrument.id });
  console.log(`Instrument RIASEC public : ${instrument.instrument.itemCount} items, id ${instrument.instrument.id}.`);

  await request('/v1/orientation/guest/claim', { method: 'POST', expected: 200 }).catch(() => {
    // Pas de compte : le claim invité renvoie normalement 401/400 sans
    // cookie invité existant ; on force simplement la création du cookie
    // de session invité via le premier appel réel ci-dessous.
  });

  const { body: created } = await request('/v1/orientation/riasec/attempts', { method: 'POST', expected: 201 });
  const attemptId = created.attempt.id;
  const shuffledItems = created.instrument.items;
  record('attempt-created', { attemptId, instrumentId: created.instrument.id });
  console.log(`Tentative créée : ${attemptId} (session invité, sans donnée personnelle).`);

  const promptToItemId = new Map(Object.entries(oracleItems.items).map(([id, item]) => [item.prompt, id]));
  const responses = shuffledItems.map((item) => {
    const canonicalId = promptToItemId.get(item.prompt);
    if (!canonicalId) throw new Error(`Affirmation servie en production introuvable dans la table de référence : "${item.prompt}"`);
    const value = valueByItemId.get(canonicalId);
    if (value === undefined) throw new Error(`Aucune réponse du profil "${ORACLE_PROFILE_ID}" pour l'item "${canonicalId}"`);
    return { itemId: item.id, value };
  });

  const { body: completion } = await request(`/v1/orientation/riasec/attempts/${attemptId}/submit`, {
    method: 'POST',
    expected: 201,
    body: JSON.stringify({ responses }),
  });

  const stored = completion.result;
  const expected = profile.expected;
  const mismatches = [];
  if (stored.primaryCode !== expected.ranking.primaryCode) {
    mismatches.push(`primaryCode: attendu ${expected.ranking.primaryCode}, reçu ${stored.primaryCode}`);
  }
  if (stored.displayCode !== expected.ranking.displayCode) {
    mismatches.push(`displayCode: attendu ${expected.ranking.displayCode}, reçu ${stored.displayCode}`);
  }
  for (const dimension of ['R', 'I', 'A', 'S', 'E', 'C']) {
    if (stored.scores[dimension].normalized !== expected.scores[dimension].normalized) {
      mismatches.push(`${dimension}.normalized: attendu ${expected.scores[dimension].normalized}, reçu ${stored.scores[dimension].normalized}`);
    }
  }

  record('scoring-match', {
    resultId: stored.id,
    primaryCode: stored.primaryCode,
    displayCode: stored.displayCode,
    scores: Object.fromEntries(['R', 'I', 'A', 'S', 'E', 'C'].map((d) => [d, stored.scores[d].normalized])),
    mismatches,
  });

  if (mismatches.length > 0) {
    throw new Error(`Score de production non conforme à la banque d'oracles :\n${mismatches.join('\n')}`);
  }
  console.log(`Score conforme à l'oracle "${ORACLE_PROFILE_ID}" : ${stored.displayCode} (${stored.primaryCode}).`);
  console.log(`Résultat ${stored.id} : expirera automatiquement sous 7 jours (purge de session invité déjà en place), aucune action de nettoyage manuelle nécessaire.`);

  evidence.success = true;
  evidence.completedAt = new Date().toISOString();
};

main()
  .then(() => {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`\nPreuve écrite : ${outputPath}`);
    console.log('\nRecette production : SUCCÈS.');
  })
  .catch((error) => {
    evidence.success = false;
    evidence.error = error.message;
    evidence.completedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.error(`\nRecette production : ÉCHEC — ${error.message}`);
    process.exitCode = 1;
  });
