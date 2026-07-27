'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { analyzeCv, ALGORITHM_VERSION } = require('../src/cv/analyzer');
const { normalizeText } = require('../src/cv/normalizer');
const { CvInputError } = require('../src/cv/errors');

const COMPLETE_CV = [
  'Jean Makaya', 'Comptable senior',
  'Contact', 'Email : jean.makaya@example.test', 'Telephone : +242 06 123 45 67',
  'Profil', "Comptable rigoureux avec huit ans d'experience en cabinet et en entreprise au Congo.",
  'Experience',
  '2018 - 2024 : Comptable senior, Societe X, Brazzaville',
  'Gerer la comptabilite generale et analytique selon le referentiel SYSCOHADA.',
  'Coordonner la paie de 45 personnes et reduire les delais de cloture de 30%.',
  'Developper des tableaux de bord fiscaux et former deux comptables juniors.',
  '2014 - 2018 : Comptable, Cabinet Y, Pointe-Noire',
  'Assurer la fiscalite et la relation client de 20 clients avec rigueur et methode.',
  'Formation', '2014 : Licence en comptabilite, Universite Marien Ngouabi a Brazzaville.',
  'Competences', 'Comptabilite, SYSCOHADA, fiscalite, paie, analyse financiere, Excel et bureautique.',
  'Langues', 'Francais, Anglais',
].join('\n');

const WEAK_CV = ('texte libre sans structure claire qui parle un peu de tout et de rien mais '
  + 'contient suffisamment de mots pour depasser le seuil minimal impose par le moteur afin '
  + 'que le systeme puisse analyser le contenu et proposer des ameliorations utiles au candidat concerne ici.').trim();

const ENGLISH_CV = [
  'John Smith', 'Contact', 'Email john.smith@example.test',
  'Summary', 'Experienced accountant with a strong background in finance and reporting for companies.',
  'Experience', 'Managed the general ledger and coordinated the payroll of forty people every month.',
  'Developed dashboards and improved the closing process with clear and measurable results and outcomes.',
  'Education', 'Bachelor of accounting at the national university with honors and distinction awarded.',
  'Skills', 'Accounting, tax, payroll, financial analysis and office tools including spreadsheets daily.',
].join('\n');

const UND_TEXT = ('comptabilite fiscalite paie logistique transport agronomie hotellerie restauration '
  + 'electricite maintenance chantier forage soudure menuiserie plomberie couture coiffure mecanique '
  + 'peinture carrelage climatisation informatique reseau serveur imprimante scanner clavier souris '
  + 'ecran cable batterie moteur pompe filtre capteur vanne tuyau revision balance mesure pression '
  + 'debit niveau tension courant resistance condensateur transformateur disjoncteur relais bobine').trim();

test('resultat reproductible et version stable', () => {
  const a = analyzeCv({ text: COMPLETE_CV });
  const b = analyzeCv({ text: COMPLETE_CV });
  assert.deepEqual(a, b);
  assert.equal(a.methodology.version, ALGORITHM_VERSION);
  assert.equal(a.methodology.type, 'deterministic_rules');
});

test('les scores exposes sont exactement le contrat attendu', () => {
  const s = analyzeCv({ text: COMPLETE_CV }).scores;
  assert.deepEqual(Object.keys(s).sort(),
    ['contentClarity', 'generalReadiness', 'impact', 'structure', 'targetRelevance', 'technicalUsability']);
});

test('generalReadiness = structure + contentClarity + impact + technicalUsability', () => {
  for (const cv of [COMPLETE_CV, WEAK_CV, ENGLISH_CV]) {
    const s = analyzeCv({ text: cv }).scores;
    assert.equal(s.generalReadiness, s.structure + s.contentClarity + s.impact + s.technicalUsability);
    assert.ok(s.generalReadiness >= 0 && s.generalReadiness <= 100);
  }
});

test('technicalUsability present et numerique', () => {
  const s = analyzeCv({ text: COMPLETE_CV }).scores;
  assert.equal(typeof s.technicalUsability, 'number');
  assert.ok(s.technicalUsability >= 0 && s.technicalUsability <= 20);
});

test('sections detectees sur un CV complet', () => {
  const present = new Set(analyzeCv({ text: COMPLETE_CV }).sections.filter((x) => x.present).map((x) => x.key));
  for (const key of ['contact', 'experience', 'education', 'skills', 'languages']) assert.ok(present.has(key), key);
});

test('contactPresence expose email et telephone', () => {
  const c = analyzeCv({ text: COMPLETE_CV }).contactPresence;
  assert.equal(c.hasEmail, true);
  assert.equal(c.hasPhone, true);
});

test('experienceSignals et educationSignals exposes', () => {
  const r = analyzeCv({ text: COMPLETE_CV });
  assert.equal(r.experienceSignals.present, true);
  assert.equal(r.experienceSignals.quantified, true);
  assert.ok(r.experienceSignals.actionVerbs >= 3);
  assert.equal(r.educationSignals.present, true);
});

test('document expose les metadonnees', () => {
  const doc = analyzeCv({ text: COMPLETE_CV, fileName: 'cv.pdf', mimeType: 'application/pdf', fileSize: 1234 }).document;
  assert.equal(doc.fileName, 'cv.pdf');
  assert.equal(doc.mimeType, 'application/pdf');
  assert.equal(doc.fileSize, 1234);
  assert.equal(doc.detectedLanguage, 'fr');
  assert.ok(doc.textLength > 0 && doc.wordCount > 0);
});

test('competences multi-domaines, pas seulement informatique', () => {
  const skills = analyzeCv({ text: COMPLETE_CV }).skills;
  assert.ok(skills.some((s) => /comptabilite|comptabilité/i.test(s.canonical)));
  assert.ok(skills.some((s) => /syscohada/i.test(s.canonical)));
  assert.ok(new Set(skills.map((s) => s.domain)).has('comptabilite-finance'));
});

test('deduplication des competences', () => {
  const canon = analyzeCv({ text: COMPLETE_CV }).skills.map((s) => s.canonical);
  assert.equal(canon.length, new Set(canon).size);
});

test('plusieurs domaines Congo sur un CV mixte', () => {
  const mixed = COMPLETE_CV + '\nAutres : soins infirmiers, enseignement, genie civil, vente et logistique.';
  const domains = new Set(analyzeCv({ text: mixed }).skills.map((s) => s.domain));
  assert.ok(domains.size >= 3, [...domains].join(','));
});

test('faux positif evite : sql dans postgresql ne compte pas', () => {
  const text = ('Profil technique utilisant postgresql exclusivement pour la persistance des donnees '
    + 'sans jamais nommer explicitement le langage seul dans une phrase suffisamment longue pour '
    + 'passer le seuil minimal de mots requis par le moteur deterministe teste ici maintenant. Ce '
    + 'texte est volontairement allonge afin de depasser confortablement la limite de quarante mots '
    + 'imposee par la validation stricte du moteur avant toute analyse serieuse du contenu fourni.');
  const canon = analyzeCv({ text }).skills.map((s) => s.canonical);
  assert.ok(!canon.some((c) => /bases de don/i.test(c)));
});

test('CV faible < CV complet, et faible reste valide', () => {
  const strong = analyzeCv({ text: COMPLETE_CV }).scores.generalReadiness;
  const weak = analyzeCv({ text: WEAK_CV }).scores.generalReadiness;
  assert.ok(strong > weak);
  assert.ok(weak < 40);
});

test('targetRelevance null sans offre', () => {
  const r = analyzeCv({ text: COMPLETE_CV });
  assert.equal(r.scores.targetRelevance, null);
  assert.equal(r.targetMatch, null);
});

test('targetRelevance calcule et deterministe avec offre', () => {
  const args = { text: COMPLETE_CV, jobTitle: 'Comptable', jobDescription: 'Comptable maitrisant la comptabilite SYSCOHADA, la paie et l analyse financiere. Anglais souhaite.' };
  const a = analyzeCv(args); const b = analyzeCv(args);
  assert.equal(typeof a.scores.targetRelevance, 'number');
  assert.ok(a.scores.targetRelevance >= 0 && a.scores.targetRelevance <= 100);
  assert.equal(a.scores.targetRelevance, b.scores.targetRelevance);
  assert.ok(Array.isArray(a.targetMatch.presentSkills));
});

test('constats explicables, jamais inventer de chiffres', () => {
  const r = analyzeCv({ text: WEAK_CV });
  assert.ok(r.issues.length > 0);
  for (const i of r.issues) {
    assert.ok(i.code && i.title && i.recommendation);
    assert.ok(['critique', 'important', 'suggestion'].includes(i.severity));
    assert.equal(typeof i.scoreImpact, 'number');
    assert.ok(!/invent|falsifi|exager/i.test(i.recommendation));
  }
});

test('aucun champ probabilite ni confiance', () => {
  const forbidden = ['interviewProbability', 'probability', 'confidence', 'atsGuarantee'];
  const walk = (n) => { if (n && typeof n === 'object') for (const k of Object.keys(n)) { assert.ok(!forbidden.includes(k), k); walk(n[k]); } };
  walk(analyzeCv({ text: COMPLETE_CV }));
});

test('aucune ancienne marque OrientationPro dans la sortie', () => {
  const s = JSON.stringify(analyzeCv({ text: COMPLETE_CV })).toLowerCase();
  assert.ok(!s.includes('orientationpro'));
});

test('le moteur n utilise ni Math.random ni Date', () => {
  const dir = path.join(__dirname, '..', 'src', 'cv');
  for (const file of fs.readdirSync(dir)) {
    const code = fs.readFileSync(path.join(dir, file), 'utf8').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
    assert.ok(!/Math\.random\s*\(/.test(code), `${file} Math.random`);
    assert.ok(!/\bnew Date\s*\(|\bDate\.now\s*\(/.test(code), `${file} Date`);
  }
});

test('CV_INPUT_REQUIRED pour entree absente ou non-objet', () => {
  for (const bad of [null, undefined, 'x', 42, []]) {
    assert.throws(() => analyzeCv(bad), (e) => e instanceof CvInputError && e.code === 'CV_INPUT_REQUIRED');
  }
});

test('CV_TEXT_INVALID_TYPE si text n est pas une chaine', () => {
  assert.throws(() => analyzeCv({ text: 123 }), (e) => e.code === 'CV_TEXT_INVALID_TYPE');
  assert.throws(() => analyzeCv({ text: {} }), (e) => e.code === 'CV_TEXT_INVALID_TYPE');
});

test('CV_TEXT_INVALID_TYPE si jobTitle/jobDescription mal types', () => {
  assert.throws(() => analyzeCv({ text: COMPLETE_CV, jobTitle: 5 }), (e) => e.code === 'CV_TEXT_INVALID_TYPE');
  assert.throws(() => analyzeCv({ text: COMPLETE_CV, jobDescription: {} }), (e) => e.code === 'CV_TEXT_INVALID_TYPE');
});

test('CV_TEXT_EMPTY pour texte vide ou blancs', () => {
  assert.throws(() => analyzeCv({ text: '' }), (e) => e.code === 'CV_TEXT_EMPTY');
  assert.throws(() => analyzeCv({ text: '     \n\t  ' }), (e) => e.code === 'CV_TEXT_EMPTY');
});

test('CV_TEXT_TOO_SHORT sous le seuil de mots', () => {
  assert.throws(() => analyzeCv({ text: 'Marie Dupont comptable a Brazzaville' }), (e) => e.code === 'CV_TEXT_TOO_SHORT');
});

test('CV_TEXT_TOO_LARGE au-dela de la limite', () => {
  assert.throws(() => analyzeCv({ text: 'a '.repeat(120000) }), (e) => e.code === 'CV_TEXT_TOO_LARGE');
});

test('CV_TEXT_UNREADABLE pour contenu non lisible', () => {
  const garbage = '▓'.repeat(200);
  assert.throws(() => analyzeCv({ text: garbage }), (e) => e.code === 'CV_TEXT_UNREADABLE');
});

test('NFKC : caracteres pleine largeur ramenes en ASCII', () => {
  const n = normalizeText('ＣＶ comptable generale analytique referentiel');
  assert.ok(/cv/.test(n.lowered));
});

test('caracteres de controle supprimes', () => {
  const raw = 'alpha' + String.fromCharCode(0) + 'beta' + String.fromCharCode(7) + 'gamma delta epsilon';
  const n = normalizeText(raw);
  assert.ok(!n.text.includes(String.fromCharCode(0)));
  assert.ok(!n.text.includes(String.fromCharCode(7)));
});

test('langue fr', () => { assert.equal(analyzeCv({ text: COMPLETE_CV }).document.detectedLanguage, 'fr'); });
test('langue en', () => { assert.equal(analyzeCv({ text: ENGLISH_CV }).document.detectedLanguage, 'en'); });
test('langue und quand indeterminee', () => { assert.equal(analyzeCv({ text: UND_TEXT }).document.detectedLanguage, 'und'); });

test('XSS : contenu traite comme texte, jamais execute ni rendu HTML', () => {
  const xss = COMPLETE_CV + '\n<script>alert(1)</script><img src=x onerror=alert(2)>';
  const r = analyzeCv({ text: xss });
  assert.equal(r.status, 'completed');
  assert.doesNotThrow(() => JSON.stringify(r));
  assert.ok(!Object.prototype.hasOwnProperty.call(r, 'html'));
});

test('PII absente des erreurs', () => {
  const pii = 'secret.person@pii.test';
  try {
    analyzeCv({ text: `Marie ${pii}` });
    assert.fail('devrait lever CV_TEXT_TOO_SHORT');
  } catch (e) {
    assert.equal(e.code, 'CV_TEXT_TOO_SHORT');
    assert.ok(!String(e.message).includes(pii));
    assert.ok(!JSON.stringify({ code: e.code, detail: e.detail }).includes(pii));
  }
});

test('injection SQL dans le texte : inerte', () => {
  const sqli = COMPLETE_CV + "\nNote: '; DROP TABLE cv_analyses; --";
  assert.equal(analyzeCv({ text: sqli }).status, 'completed');
});
