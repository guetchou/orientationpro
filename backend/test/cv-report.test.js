'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const pdfParse = require('pdf-parse');

const {
  MAX_REPORT_BYTES,
  REPORT_VERSION,
  buildCvReportFileName,
  generateCvReportPdf,
  normalizeCvReportData,
} = require('../src/cv/report');

const createAnalysis = () => ({
  id: '11111111-1111-4111-8111-111111111111',
  algorithmVersion: 'makoki-cv-rules-v1',
  targetTitle: 'Conseiller clientèle',
  createdAt: '2026-07-27T20:15:33.000Z',
  document: {
    fileName: 'Mon CV.pdf',
    mimeType: 'application/pdf',
    fileSize: 4096,
    pageCount: 2,
    detectedLanguage: 'fr',
  },
  snapshot: {
    status: 'completed',
    document: {
      fileName: 'Mon CV.pdf',
      mimeType: 'application/pdf',
      fileSize: 4096,
      pageCount: 2,
      detectedLanguage: 'fr',
      textLength: 1500,
      wordCount: 240,
    },
    scores: {
      generalReadiness: 76,
      structure: 20,
      contentClarity: 19,
      impact: 18,
      technicalUsability: 19,
      targetRelevance: 64,
    },
    contactPresence: {
      hasEmail: true,
      hasPhone: true,
    },
    sections: [
      { key: 'contact', present: true },
      { key: 'summary', present: true },
      { key: 'experience', present: true },
      { key: 'education', present: true },
      { key: 'skills', present: true },
      { key: 'languages', present: true },
    ],
    skills: [
      { canonical: 'Excel', domain: 'telecom-informatique' },
      { canonical: 'Service client', domain: 'communication-relation-client' },
      { canonical: 'Négociation', domain: 'commerce-vente' },
    ],
    strengths: [
      { code: 'CONTACT_COMPLETE', title: 'Coordonnées complètes' },
      { code: 'STRUCTURE_CLEAR', title: 'Structure claire et complète' },
    ],
    issues: [
      {
        code: 'EXPERIENCE_NO_MEASURABLE_OUTCOME',
        severity: 'important',
        title: 'Résultats peu quantifiés',
        observation: 'Aucun résultat mesurable détecté.',
        recommendation: 'Ajoutez uniquement des résultats réels et vérifiables.',
      },
    ],
    recommendations: [],
    targetMatch: {
      targetRelevance: 64,
      jobTitle: 'Conseiller clientèle',
      presentSkills: ['Service client'],
      missingSkills: ['Gestion CRM'],
      requiredSkills: ['Service client', 'Gestion CRM'],
      keywordOverlapPercent: 58,
    },
    methodology: {
      version: 'makoki-cv-rules-v1',
      type: 'deterministic_rules',
      limitations: [
        'Aucune reconnaissance OCR.',
        'Aucune probabilité de recrutement.',
      ],
    },
  },
});

test('normalise uniquement le snapshot déterministe et humanise les domaines', () => {
  const analysis = createAnalysis();
  analysis.secretRawCv = 'CONTENU BRUT PRIVE HORS SNAPSHOT';

  const normalized = normalizeCvReportData(analysis);

  assert.equal(normalized.analysisId, analysis.id);
  assert.equal(normalized.reportVersion, 'makoki-cv-report-v2');
  assert.equal(normalized.scores.generalReadiness, 76);
  assert.equal(normalized.target.title, 'Conseiller clientèle');
  assert.equal(normalized.skills[0].domain, 'Télécoms & informatique');
  assert.equal(normalized.skills[1].domain, 'Communication & relation client');
  assert.equal(normalized.skills[2].domain, 'Commerce & vente');
  assert.equal(
    JSON.stringify(normalized).includes('CONTENU BRUT PRIVE HORS SNAPSHOT'),
    false,
  );
  assert.equal(
    buildCvReportFileName('../identifiant dangereux'),
    'mon-rapport-cv-makoki.pdf',
  );
});

test('génère exactement quatre pages selon la maquette premium', async () => {
  const buffer = await generateCvReportPdf(createAnalysis(), {
    beneficiary: {
      firstName: 'Gess',
      lastName: 'Nguie',
      currentSituation: 'entrepreneur',
      primaryGoal: 'improve_skills',
    },
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.ok(buffer.length > 1000);
  assert.ok(buffer.length < MAX_REPORT_BYTES);

  const parsed = await pdfParse(buffer);

  assert.equal(parsed.numpages, 4);

  const footerTotals = [
    ...parsed.text.matchAll(/Page \d+\s*\/\s*(\d+)/gu),
  ].map((match) => Number(match[1]));
  assert.ok(footerTotals.length >= 4);
  assert.ok(
    footerTotals.every((total) => total === 4),
    'chaque pagination visible doit annoncer quatre pages',
  );

  assert.match(parsed.text, /MAKOKI/u);
  assert.match(parsed.text, /Rapport d'analyse de CV/u);
  assert.match(parsed.text, /Gess Nguie/u);
  assert.match(parsed.text, /Synthèse exécutive/u);
  assert.match(parsed.text, /Plan d'action prioritaire/u);
  assert.match(parsed.text, /Lecture des indicateurs/u);
  assert.match(parsed.text, /Diagnostic du document/u);
  assert.match(parsed.text, /Cartographie des compétences/u);
  assert.match(parsed.text, /Compétences clés détectées/u);
  assert.match(parsed.text, /Recommandations et plan d'action/u);
  assert.match(parsed.text, /Bonnes pratiques rapides/u);
  assert.match(parsed.text, /Adéquation au poste ciblé/u);
  assert.match(parsed.text, /Méthodologie et limites/u);
  assert.match(parsed.text, /Ton CV a un fort potentiel/u);

  assert.match(parsed.text, /76\s*\/\s*100/u);
  assert.match(parsed.text, /20\s*\/\s*30/u);
  assert.match(parsed.text, /19\s*\/\s*25/u);
  assert.match(parsed.text, /18\s*\/\s*25/u);
  assert.match(parsed.text, /19\s*\/\s*20/u);
  assert.match(parsed.text, /64\s*\/\s*100/u);

  assert.match(parsed.text, /Télécoms & informatique/u);
  assert.match(parsed.text, /Communication & relation client/u);
  assert.equal(parsed.text.includes('telecom-informatique'), false);
  assert.equal(parsed.text.includes('communication-relation-client'), false);
  assert.equal(parsed.text.includes('commerce-vente'), false);

  assert.match(parsed.text, /Résultats peu quantifiés/u);
  assert.match(parsed.text, /Avant/u);
  assert.match(parsed.text, /Après/u);

  assert.equal(/OrientationPro/u.test(parsed.text), false);
  assert.equal(/confiance.*%/iu.test(parsed.text), false);
});

test('sans offre, affiche Non évaluée et jamais 0 / 100 pour la pertinence', async () => {
  const analysis = createAnalysis();
  analysis.targetTitle = null;
  analysis.snapshot.targetMatch = null;
  analysis.snapshot.scores.targetRelevance = 0;

  const normalized = normalizeCvReportData(analysis);
  assert.equal(normalized.target, null);
  assert.equal(normalized.scores.targetRelevance, null);

  const buffer = await generateCvReportPdf(analysis);
  const parsed = await pdfParse(buffer);

  assert.equal(parsed.numpages, 4);
  assert.match(parsed.text, /Aucune offre de poste fournie/u);
  assert.match(parsed.text, /Non évaluée/u);
  assert.equal(/Pertinence pour le poste ciblé[\s\S]{0,120}0\s*\/\s*100/u.test(parsed.text), false);
});

test('refuse tout snapshot contenant du texte brut', async () => {
  const analysis = createAnalysis();
  analysis.snapshot.text = 'CONTENU BRUT INTERDIT';

  await assert.rejects(
    generateCvReportPdf(analysis),
    /forbidden raw content/u,
  );
});

test('version publique du rapport est bien la v2', () => {
  assert.equal(REPORT_VERSION, 'makoki-cv-report-v2');
});
