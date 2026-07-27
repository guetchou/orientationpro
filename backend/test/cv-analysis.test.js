'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { analyzeCv, ALGORITHM_VERSION } = require('../src/cv/analyzer');

const COMPLETE_CV = [
  'Jean Makaya',
  'Comptable senior',
  'Contact',
  'Email : jean.makaya@example.test',
  'Téléphone : +242 06 123 45 67',
  'Profil',
  'Comptable rigoureux avec 8 ans d’expérience en cabinet et en entreprise au Congo.',
  'Expérience',
  '2018 - 2024 : Comptable senior, Société X, Brazzaville',
  'Gérer la comptabilité générale et analytique selon le référentiel SYSCOHADA.',
  'Coordonner la paie de 45 personnes et réduire les délais de clôture de 30%.',
  'Développer des tableaux de bord fiscaux et former deux comptables juniors.',
  '2014 - 2018 : Comptable, Cabinet Y, Pointe-Noire',
  'Assurer la fiscalité et la relation client de 20 clients.',
  'Formation',
  '2014 : Licence en comptabilité, Université Marien Ngouabi',
  'Compétences',
  'Comptabilité, SYSCOHADA, fiscalité, paie, analyse financière, Excel.',
  'Langues',
  'Français, Anglais',
].join('\n');

const MINIMAL_CV = [
  'Marie',
  'Quelques lignes sans structure claire ni coordonnées.',
  'Travail effectué chez un employeur.',
].join('\n');

test('résultat reproductible pour un même texte et une même version', () => {
  const a = analyzeCv({ text: COMPLETE_CV });
  const b = analyzeCv({ text: COMPLETE_CV });
  assert.deepEqual(a, b);
  assert.equal(a.methodology.version, ALGORITHM_VERSION);
  assert.equal(a.methodology.type, 'deterministic_rules');
});

test('sections détectées sur un CV complet', () => {
  const result = analyzeCv({ text: COMPLETE_CV });
  const present = new Set(result.sections.filter((s) => s.present).map((s) => s.key));
  for (const key of ['contact', 'experience', 'education', 'skills', 'languages']) {
    assert.ok(present.has(key), `section ${key} attendue`);
  }
});

test('compétences multi-domaines détectées, pas seulement informatique', () => {
  const result = analyzeCv({ text: COMPLETE_CV });
  const canon = result.skills.map((s) => s.canonical);
  assert.ok(canon.includes('comptabilité'));
  assert.ok(canon.includes('SYSCOHADA'));
  assert.ok(canon.includes('fiscalité'));
});

test('score général 0-100 sans point de départ arbitraire (CV faible < CV complet)', () => {
  const strong = analyzeCv({ text: COMPLETE_CV }).scores.generalReadiness;
  const weak = analyzeCv({ text: MINIMAL_CV }).scores.generalReadiness;
  assert.ok(strong > weak);
  assert.ok(strong <= 100 && weak >= 0);
  // un CV quasi vide ne doit pas recevoir 30/40/50 points automatiques
  assert.ok(weak < 30, `CV minimal ne doit pas partir haut, obtenu ${weak}`);
  assert.equal(strong, analyzeCv({ text: COMPLETE_CV }).scores.generalReadiness);
});

test('targetRelevance est null sans offre, calculé avec une offre', () => {
  const general = analyzeCv({ text: COMPLETE_CV });
  assert.equal(general.scores.targetRelevance, null);
  assert.equal(general.targetMatch, null);

  const targeted = analyzeCv({
    text: COMPLETE_CV,
    jobTitle: 'Comptable',
    jobDescription: 'Poste de comptable maîtrisant la comptabilité SYSCOHADA, la paie et l’analyse financière. Anglais souhaité.',
  });
  assert.equal(typeof targeted.scores.targetRelevance, 'number');
  assert.ok(targeted.scores.targetRelevance >= 0 && targeted.scores.targetRelevance <= 100);
  assert.ok(Array.isArray(targeted.targetMatch.presentSkills));
});

test('constats explicables avec code, sévérité et impact ; aucun conseil d’inventer des chiffres', () => {
  const result = analyzeCv({ text: MINIMAL_CV });
  assert.ok(result.issues.length > 0);
  for (const issue of result.issues) {
    assert.ok(issue.code && issue.title && issue.recommendation);
    assert.ok(['critique', 'important', 'suggestion'].includes(issue.severity));
    assert.equal(typeof issue.scoreImpact, 'number');
    assert.ok(!/invent|falsifi|exagér/i.test(issue.recommendation));
  }
  const quant = result.issues.find((i) => i.code === 'EXPERIENCE_NO_MEASURABLE_OUTCOME');
  if (quant) assert.match(quant.recommendation, /réels et vérifiables/);
});

test('aucun champ de probabilité d’entretien ni de fausse confiance dans les scores', () => {
  const result = analyzeCv({ text: COMPLETE_CV });
  // Les scores exposés sont strictement ceux autorisés : pas de probabilité, pas de confiance.
  assert.deepEqual(
    Object.keys(result.scores).sort(),
    ['contentClarity', 'generalReadiness', 'impact', 'structure', 'targetRelevance'],
  );
  const forbiddenKeys = ['interviewProbability', 'probability', 'confidence', 'atsGuarantee'];
  const walk = (node) => {
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        assert.ok(!forbiddenKeys.includes(key), `champ interdit: ${key}`);
        walk(node[key]);
      }
    }
  };
  walk(result);
  // Le disclaimer a le droit d'employer ces mots pour les NIER.
  assert.ok(result.methodology.limitations.some((l) => /probabilit/i.test(l)));
});

test('le moteur n’utilise ni Math.random ni Date dans le calcul (usage réel, pas mention)', () => {
  const dir = path.join(__dirname, '..', 'src', 'cv');
  for (const file of fs.readdirSync(dir)) {
    // Retire les commentaires de ligne pour ne détecter que du code exécuté.
    const code = fs.readFileSync(path.join(dir, file), 'utf8')
      .split('\n').map((line) => line.replace(/\/\/.*$/, '')).join('\n');
    assert.ok(!/Math\.random\s*\(/.test(code), `${file} appelle Math.random`);
    assert.ok(!/\bnew Date\s*\(|\bDate\.now\s*\(/.test(code), `${file} utilise une date`);
  }
});
