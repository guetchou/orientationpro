'use strict';

// Génère la banque d'oracles RIASEC versionnée pour la campagne de tests IA
// (issue #216). Les scores attendus ne sont JAMAIS calculés à la main : ce
// script appelle le moteur canonique réel (scoreRiasec + instrument.js) et
// capture sa sortie exacte comme référence. Usage : node generate-riasec-oracles.js
const fs = require('node:fs');
const path = require('node:path');
const { instrument } = require('../src/orientation/riasec/instrument');
const { scoreRiasec } = require('../src/orientation/riasec/scoring');

const DIMENSIONS = ['R', 'I', 'A', 'S', 'E', 'C'];
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'tests', 'life-project', 'oracles', 'riasec-profiles.v1.json');
// L'ordre d'affichage des items est mélangé côté serveur à chaque tentative
// (backend/src/orientation/riasec/router.js) : un test navigateur ne peut
// donc pas répondre "l'item N" mais doit retrouver chaque affirmation par
// son texte affiché. Ce fichier compagnon fournit id -> {prompt, dimension}.
const ITEMS_OUTPUT_PATH = path.join(__dirname, '..', '..', 'tests', 'life-project', 'oracles', 'riasec-items.v1.json');

// Construit les 60 réponses {itemId, value} à partir d'une règle
// item -> valeur brute (1-5, telle qu'un utilisateur cliquerait — l'inversion
// des items reverseScored est gérée en interne par scoreRiasec, jamais ici).
const buildResponses = (valueForItem) => instrument.items.map((item) => ({
  itemId: item.id,
  value: valueForItem(item),
}));

const byDimension = (values) => (item) => values[item.dimension];

// Profils R/I/A/S/E/C dominants : rotation déterministe sur l'ordre canonique
// pour garantir un primaryCode net (pas d'ambiguïté sur les 3 premières
// places), avec les 3 dernières places sciemment à égalité (ne perturbe pas
// le primaryCode, qui ne dépend que du trio de tête).
const dominantProfile = (dominantDimension) => {
  const startIndex = DIMENSIONS.indexOf(dominantDimension);
  const rotated = DIMENSIONS.map((_, offset) => DIMENSIONS[(startIndex + offset) % DIMENSIONS.length]);
  const values = {};
  values[rotated[0]] = 5;
  values[rotated[1]] = 4;
  values[rotated[2]] = 3;
  values[rotated[3]] = 2;
  values[rotated[4]] = 2;
  values[rotated[5]] = 2;
  return { id: `dominant-${dominantDimension.toLowerCase()}`, label: `${dominantDimension} dominant`, values };
};

const PROFILES = [
  ...DIMENSIONS.map((dimension) => dominantProfile(dimension)),
  {
    id: 'mixed',
    label: 'Profil mixte (aucune dimension extrême, trio de tête net sans égalité)',
    values: { R: 1, I: 4, A: 1, S: 3, E: 1, C: 2 },
  },
  {
    id: 'tie-top',
    label: 'Égalité en tête (A et S strictement à égalité)',
    values: { R: 2, I: 3, A: 5, S: 5, E: 2, C: 2 },
  },
  {
    id: 'all-identical-mid',
    label: 'Toutes réponses identiques (valeur médiane 3)',
    values: { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 },
  },
  {
    id: 'all-minimum',
    label: 'Réponses minimales (toujours 1 — "pas du tout d\'accord")',
    values: { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 },
  },
  {
    id: 'all-maximum',
    label: 'Réponses maximales (toujours 5 — "tout à fait d\'accord")',
    values: { R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 },
  },
];

const buildProfileResult = (profile) => {
  const responses = buildResponses(byDimension(profile.values));
  const result = scoreRiasec({ items: instrument.items, responses });
  return {
    id: profile.id,
    label: profile.label,
    instrumentId: instrument.id,
    instrumentVersion: instrument.version,
    responses,
    expected: result,
  };
};

const profiles = PROFILES.map(buildProfileResult);

// Variation d'une seule réponse : part du profil "R dominant" et modifie un
// seul item R (position 1, non inversé) de 5 à 4 — vérifie que seule la
// dimension R change, et exactement de la valeur attendue.
const baseline = PROFILES[0]; // dominant-r
const baseResponses = buildResponses(byDimension(baseline.values));
const variedResponses = baseResponses.map((response) => (
  response.itemId === instrument.items.find((item) => item.dimension === 'R' && !item.reverseScored).id
    ? { ...response, value: 4 }
    : response
));
const singleVariation = {
  id: 'single-item-variation',
  label: 'Variation d\'une seule réponse par rapport à "R dominant" (un item R : 5 -> 4)',
  instrumentId: instrument.id,
  instrumentVersion: instrument.version,
  baselineProfileId: 'dominant-r',
  changedItemId: variedResponses.find((response, index) => response.value !== baseResponses[index].value)?.itemId,
  responses: variedResponses,
  expected: scoreRiasec({ items: instrument.items, responses: variedResponses }),
};

const bank = {
  schemaVersion: 'life-project-riasec-oracles-v1',
  generatedAt: null, // horodatage volontairement absent : le contenu doit être stable/diffable, régénéré explicitement si l'instrument change.
  instrumentId: instrument.id,
  instrumentVersion: instrument.version,
  algorithmVersion: profiles[0].expected.algorithmVersion,
  profiles: [...profiles, singleVariation],
};

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(bank, null, 2)}\n`);
process.stdout.write(`Banque d'oracles écrite : ${OUTPUT_PATH} (${bank.profiles.length} profils)\n`);

const items = {
  schemaVersion: 'life-project-riasec-items-v1',
  instrumentId: instrument.id,
  instrumentVersion: instrument.version,
  items: Object.fromEntries(instrument.items.map((item) => [
    item.id,
    { prompt: item.prompt, dimension: item.dimension, reverseScored: Boolean(item.reverseScored) },
  ])),
};

fs.writeFileSync(ITEMS_OUTPUT_PATH, `${JSON.stringify(items, null, 2)}\n`);
process.stdout.write(`Table des affirmations écrite : ${ITEMS_OUTPUT_PATH} (${instrument.items.length} items)\n`);
