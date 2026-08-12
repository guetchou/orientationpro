'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const pdfParse = require('pdf-parse');

const {
  MAX_REPORT_BYTES,
  buildCvReportFileName,
  generateCvReportPdf,
  normalizeCvReportData,
} = require('../src/cv/report');

const createAnalysis = () => ({
  id:
    '11111111-1111-4111-8111-111111111111',
  algorithmVersion:
    'makoki-cv-rules-v1',
  targetTitle:
    'Conseiller clientèle',
  createdAt:
    '2026-07-27T20:15:33.000Z',
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
      {
        key: 'contact',
        present: true,
      },
      {
        key: 'experience',
        present: true,
      },
      {
        key: 'education',
        present: true,
      },
      {
        key: 'skills',
        present: true,
      },
    ],
    skills: [
      {
        canonical: 'Excel',
        domain: 'Bureautique',
      },
      {
        canonical:
          'Service client',
        domain:
          'Relation client',
      },
    ],
    strengths: [
      {
        code: 'CONTACT_COMPLETE',
        title:
          'Coordonnées complètes',
      },
    ],
    issues: [
      {
        code:
          'EXPERIENCE_NO_MEASURABLE_OUTCOME',
        severity: 'important',
        title:
          'Résultats peu quantifiés',
        observation:
          'Aucun résultat mesurable détecté.',
        recommendation:
          'Ajoutez uniquement des résultats réels et vérifiables.',
      },
    ],
    recommendations: [],
    targetMatch: {
      targetRelevance: 64,
      jobTitle:
        'Conseiller clientèle',
      presentSkills: [
        'Service client',
      ],
      missingSkills: [
        'Gestion CRM',
      ],
      requiredSkills: [
        'Service client',
        'Gestion CRM',
      ],
      keywordOverlapPercent: 58,
    },
    methodology: {
      version:
        'makoki-cv-rules-v1',
      type:
        'deterministic_rules',
      limitations: [
        'Aucune reconnaissance OCR.',
        'Aucune probabilité de recrutement.',
      ],
    },
  },
});

test(
  'normalise uniquement le snapshot déterministe',
  () => {
    const analysis = createAnalysis();

    analysis.secretRawCv =
      'CONTENU BRUT PRIVE HORS SNAPSHOT';

    const normalized =
      normalizeCvReportData(analysis);

    assert.equal(
      normalized.analysisId,
      analysis.id,
    );

    assert.equal(
      normalized.scores
        .generalReadiness,
      76,
    );

    assert.equal(
      normalized.target.title,
      'Conseiller clientèle',
    );

    assert.equal(
      JSON.stringify(normalized)
        .includes(
          'CONTENU BRUT PRIVE HORS SNAPSHOT',
        ),
      false,
    );

    assert.equal(
      buildCvReportFileName(
        '../identifiant dangereux',
      ),
      'mon-rapport-cv-makoki.pdf',
    );
  },
);

test(
  'génère un PDF MAKOKI lisible depuis le snapshot',
  async () => {
    const analysis = createAnalysis();

    const buffer =
      await generateCvReportPdf(
        analysis,
        {
          beneficiary: {
            firstName: 'Gess',
            lastName: 'Nguie',
            currentSituation: 'entrepreneur',
            primaryGoal: 'improve_skills',
          },
        },
      );

    assert.ok(
      Buffer.isBuffer(buffer),
    );

    assert.equal(
      buffer
        .subarray(0, 5)
        .toString('ascii'),
      '%PDF-',
    );

    assert.ok(
      buffer.length > 1000,
    );

    assert.ok(
      buffer.length
      < MAX_REPORT_BYTES,
    );

    const parsed =
      await pdfParse(buffer);

    assert.ok(parsed.numpages >= 2 && parsed.numpages <= 6);

    const footerTotals = [
      ...parsed.text.matchAll(/Page \d+\/(\d+)/gu),
    ].map((match) => Number(match[1]));

    assert.equal(footerTotals.length, parsed.numpages);
    assert.ok(
      footerTotals.every((total) => total === parsed.numpages),
      'chaque pied de page doit annoncer le nombre reel de pages',
    );

    assert.match(
      parsed.text,
      /MAKOKI/u,
    );

    assert.match(
      parsed.text,
      /Rapport d'analyse de CV/u,
    );

    assert.match(parsed.text, /Gess Nguie/u);
    assert.match(parsed.text, /Synthèse exécutive/u);
    assert.match(parsed.text, /Plan d'action prioritaire/u);
    assert.match(parsed.text, /Lecture des indicateurs/u);
    assert.match(parsed.text, /Cartographie des compétences/u);
    assert.match(parsed.text, /mesure l'organisation des rubriques/iu);
    assert.match(parsed.text, /Excel - Bureautique/u);

    assert.match(
      parsed.text,
      /76 \/ 100/u,
    );

    // Chaque composante doit s'afficher avec son maximum reel, pas /100.
    assert.match(parsed.text, /20 \/ 30/u);
    assert.match(parsed.text, /19 \/ 25/u);
    assert.match(parsed.text, /18 \/ 25/u);
    assert.match(parsed.text, /19 \/ 20/u);
    assert.match(parsed.text, /64 \/ 100/u);
    assert.equal(parsed.text.includes('20 / 100'), false);

    assert.match(
      parsed.text,
      /Résultats peu quantifiés/u,
    );

    assert.equal(
      /OrientationPro/u.test(
        parsed.text,
      ),
      false,
    );

    assert.equal(
      /probabilité d'entretien/iu.test(
        parsed.text,
      ),
      false,
    );

    assert.equal(
      /confiance.*%/iu.test(
        parsed.text,
      ),
      false,
    );
  },
);

test(
  'refuse tout snapshot contenant du texte brut',
  async () => {
    const analysis = createAnalysis();

    analysis.snapshot.text =
      'CONTENU BRUT INTERDIT';

    await assert.rejects(
      generateCvReportPdf(
        analysis,
      ),
      /forbidden raw content/u,
    );
  },
);
