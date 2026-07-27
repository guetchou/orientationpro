'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { CvInputError } =
  require('../src/cv/errors');

const {
  createCvService,
  normalizeTargetInput,
} = require('../src/cv/service');

const createSnapshot = () => ({
  status: 'completed',
  document: {
    fileName: 'cv.pdf',
    mimeType: 'application/pdf',
    fileSize: 2048,
    pageCount: null,
    detectedLanguage: 'fr',
    textLength: 500,
    wordCount: 80,
  },
  scores: {
    generalReadiness: 76,
    structure: 20,
    contentClarity: 19,
    impact: 18,
    technicalUsability: 19,
    targetRelevance: 63,
  },
  sections: [],
  skills: [],
  strengths: [],
  issues: [],
  recommendations: [],
  targetMatch: {
    targetRelevance: 63,
    jobTitle: 'Conseiller clientele',
    presentSkills: [],
    missingSkills: [],
    requiredSkills: ['Excel'],
    keywordOverlapPercent: 50,
  },
  methodology: {
    version: 'makoki-cv-rules-v1',
    type: 'deterministic_rules',
    limitations: [],
  },
});

test(
  'le service extrait, analyse et persiste sans texte brut',
  async () => {
    let analyzerInput;
    let storedInput;

    const store = {
      createAnalysis: async (input) => {
        storedInput = input;

        return {
          id: input.id,
          snapshot: input.snapshot,
        };
      },
      listAnalyses: async () => ({}),
      getAnalysis: async () => null,
      deleteAnalysis: async () => false,
    };

    const service = createCvService({
      store,
      createId: () =>
        '11111111-1111-4111-8111-111111111111',
      extractor: async () => ({
        text:
          'CONTENU BRUT PRIVE DU CV A NE PAS STOCKER',
        document: {
          fileName: 'cv.pdf',
          mimeType: 'application/pdf',
          fileSize: 2048,
          pageCount: 3,
          sha256: 'a'.repeat(64),
        },
      }),
      analyzer: (input) => {
        analyzerInput = input;
        return createSnapshot();
      },
    });

    const result = await service.createAnalysis({
      accountId:
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      file: { path: '/tmp/cv.pdf' },
      body: {
        jobTitle:
          'Conseiller clientele',
        jobDescription:
          'DESCRIPTION PRIVEE DE L OFFRE',
        requiredSkills:
          'Excel, Communication, excel',
      },
    });

    assert.equal(
      analyzerInput.text,
      'CONTENU BRUT PRIVE DU CV A NE PAS STOCKER',
    );

    assert.equal(
      analyzerInput.jobDescription,
      'DESCRIPTION PRIVEE DE L OFFRE',
    );

    assert.deepEqual(
      analyzerInput.requiredSkills,
      ['Excel', 'Communication'],
    );

    assert.equal(
      storedInput.snapshot.document.pageCount,
      3,
    );

    assert.equal(
      storedInput.sourceSha256,
      'a'.repeat(64),
    );

    const persisted =
      JSON.stringify(storedInput);

    assert.equal(
      persisted.includes(
        'CONTENU BRUT PRIVE DU CV A NE PAS STOCKER',
      ),
      false,
    );

    assert.equal(
      persisted.includes(
        'DESCRIPTION PRIVEE DE L OFFRE',
      ),
      false,
    );

    assert.equal(
      Object.hasOwn(storedInput, 'text'),
      false,
    );

    assert.equal(
      Object.hasOwn(
        storedInput,
        'jobDescription',
      ),
      false,
    );

    assert.equal(
      result.snapshot.document.pageCount,
      3,
    );
  },
);

test(
  'les competences requises sont bornees et dedupliquees',
  () => {
    assert.deepEqual(
      normalizeTargetInput({
        requiredSkills:
          '["Excel", "Communication", "excel"]',
      }),
      {
        jobTitle: null,
        jobDescription: null,
        requiredSkills: [
          'Excel',
          'Communication',
        ],
      },
    );

    assert.throws(
      () => normalizeTargetInput({
        requiredSkills: '{invalide}',
      }),
      (error) =>
        error instanceof CvInputError
        && error.code
          === 'CV_TARGET_INVALID',
    );
  },
);

test(
  'les champs de ciblage trop longs sont refuses',
  () => {
    assert.throws(
      () => normalizeTargetInput({
        jobTitle: 'a'.repeat(256),
      }),
      (error) =>
        error instanceof CvInputError
        && error.code
          === 'CV_TARGET_INVALID',
    );
  },
);

test(
  'lecture et suppression conservent toujours accountId',
  async () => {
    const calls = [];

    const store = {
      createAnalysis: async () => null,
      listAnalyses: async (input) => {
        calls.push(['list', input]);
        return {};
      },
      getAnalysis: async (input) => {
        calls.push(['get', input]);
        return null;
      },
      deleteAnalysis: async (input) => {
        calls.push(['delete', input]);
        return false;
      },
    };

    const service = createCvService({ store });

    await service.listAnalyses({
      accountId: 'account-1',
      limit: '10',
      offset: '5',
    });

    await service.getAnalysis({
      accountId: 'account-1',
      analysisId: 'analysis-1',
    });

    await service.deleteAnalysis({
      accountId: 'account-1',
      analysisId: 'analysis-1',
    });

    assert.deepEqual(calls, [
      [
        'list',
        {
          accountId: 'account-1',
          limit: '10',
          offset: '5',
        },
      ],
      [
        'get',
        {
          accountId: 'account-1',
          analysisId: 'analysis-1',
        },
      ],
      [
        'delete',
        {
          accountId: 'account-1',
          analysisId: 'analysis-1',
        },
      ],
    ]);
  },
);


test(
  'le moteur reel produit un snapshot sans contenu brut',
  async () => {
    let storedInput;

    const store = {
      createAnalysis: async (input) => {
        storedInput = input;
        return input;
      },
      listAnalyses: async () => ({}),
      getAnalysis: async () => null,
      deleteAnalysis: async () => false,
    };

    const rawCvText = [
      'Profil professionnel',
      'Conseiller clientele avec plusieurs annees experience dans la relation client et la gestion administrative.',
      'Contact email exemple@example.test telephone +242 06 000 00 00.',
      'Experience professionnelle',
      'Accueil des clients traitement des demandes suivi des dossiers resolution des reclamations et production des rapports mensuels.',
      'Formation',
      'Licence professionnelle en gestion et formation complementaire en bureautique communication et organisation.',
      'Competences',
      'Service client communication Excel Word gestion administrative organisation travail equipe suivi qualite et redaction professionnelle.',
      'Langues',
      'Francais courant anglais professionnel.',
    ].join('\n');

    const privateJobDescription =
      'DESCRIPTION CONFIDENTIELLE A NE JAMAIS PERSISTER';

    const service = createCvService({
      store,
      createId: () =>
        '33333333-3333-4333-8333-333333333333',
      extractor: async () => ({
        text: rawCvText,
        document: {
          fileName: 'cv-reel.pdf',
          mimeType: 'application/pdf',
          fileSize: 4096,
          pageCount: 2,
          sha256: 'c'.repeat(64),
        },
      }),
    });

    await service.createAnalysis({
      accountId:
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      file: {
        path: '/tmp/cv-reel.pdf',
      },
      body: {
        jobTitle:
          'Conseiller clientele',
        jobDescription:
          privateJobDescription,
        requiredSkills:
          'Communication, Excel',
      },
    });

    const persisted =
      JSON.stringify(storedInput);

    assert.equal(
      persisted.includes(rawCvText),
      false,
    );

    assert.equal(
      persisted.includes(
        privateJobDescription,
      ),
      false,
    );

    assert.equal(
      Object.hasOwn(
        storedInput.snapshot,
        'text',
      ),
      false,
    );

    assert.equal(
      storedInput.snapshot
        .methodology.version,
      'makoki-cv-rules-v1',
    );
  },
);

test(
  'le titre cible est conserve meme sans description offre',
  async () => {
    let storedInput;

    const store = {
      createAnalysis: async (input) => {
        storedInput = input;
        return input;
      },
      listAnalyses: async () => ({}),
      getAnalysis: async () => null,
      deleteAnalysis: async () => false,
    };

    const service = createCvService({
      store,
      createId: () =>
        '44444444-4444-4444-8444-444444444444',
      extractor: async () => ({
        text:
          'Texte fictif suffisamment long pour le test un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf vingt vingt-et-un vingt-deux vingt-trois vingt-quatre vingt-cinq vingt-six vingt-sept vingt-huit vingt-neuf trente trente-et-un trente-deux trente-trois trente-quatre trente-cinq trente-six trente-sept trente-huit trente-neuf quarante.',
        document: {
          fileName: 'cv.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          pageCount: 1,
          sha256: 'd'.repeat(64),
        },
      }),
      analyzer: () => ({
        ...createSnapshot(),
        scores: {
          ...createSnapshot().scores,
          targetRelevance: null,
        },
        targetMatch: null,
      }),
    });

    await service.createAnalysis({
      accountId:
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      file: {
        path: '/tmp/cv.pdf',
      },
      body: {
        jobTitle:
          'Comptable',
      },
    });

    assert.equal(
      storedInput.targetTitle,
      'Comptable',
    );
  },
);
