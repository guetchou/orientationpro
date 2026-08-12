'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const express = require('express');

const { CvInputError } =
  require('../src/cv/errors');

const {
  DEFAULT_UPLOAD_DIRECTORY,
  createCvRouter,
  resolveUploadDirectory,
} = require('../src/cv/router');

const {
  CV_MAX_FILE_SIZE,
} = require('../src/security/cv-access');

const ACCOUNT_ID =
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const request = async (
  app,
  requestPath,
  options = {},
) => {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(
      0,
      '127.0.0.1',
      resolve,
    );
  });

  try {
    const address = server.address();

    return await fetch(
      `http://127.0.0.1:${
        address.port
      }${requestPath}`,
      options,
    );
  } finally {
    server.closeAllConnections();

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
};

const authenticated = (
  req,
  res,
  next,
) => {
  req.auth = {
    account: {
      id: ACCOUNT_ID,
      email: 'person@example.test',
      status: 'active',
      roles: ['user'],
    },
    sessionId: 'session-1',
  };

  next();
};

const createApp = (
  service,
  hasPermission = async () => true,
  authenticate = authenticated,
) => {
  const uploadDirectory =
    fsSync.mkdtempSync(
      path.join(
        os.tmpdir(),
        'makoki-cv-api-test-',
      ),
    );

  const app = express();

  app.use(
    '/api/v1/cv',
    createCvRouter({
      service,
      authenticate,
      hasPermission,
      uploadDirectory,
    }),
  );

  app.use((
    error,
    req,
    res,
    next,
  ) => {
    res.status(500).json({
      error: {
        code: 'UNEXPECTED',
        message: error.message,
      },
    });
  });

  return {
    app,
    uploadDirectory,
  };
};

const sampleAnalysis = {
  id:
    '11111111-1111-4111-8111-111111111111',
  algorithmVersion:
    'makoki-cv-rules-v1',
  document: {
    fileName: 'cv.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    pageCount: 1,
    detectedLanguage: 'fr',
  },
  scores: {
    generalReadiness: 75,
    targetRelevance: null,
  },
  targetTitle: null,
  createdAt:
    '2026-07-27T00:00:00.000Z',
};

test(
  'POST preview accepte un visiteur, renvoie seulement un apercu et nettoie le fichier',
  async (t) => {
    let received;
    let authenticateCalled = false;
    const service = {
      createPreview: async (input) => {
        received = input;
        await fs.access(input.file.path);
        return {
          kind: 'cv-preview-v1',
          score: 75,
          targetScore: null,
          sectionsPresent: 5,
          sectionsTotal: 6,
          highlights: ['Coordonnees detectees'],
          priorityAction: 'Preciser les resultats obtenus.',
          authenticationRequiredFor: ['full_report', 'export', 'save'],
        };
      },
    };
    const { app, uploadDirectory } = createApp(
      service,
      async () => { throw new Error('permission check must not run for a guest preview'); },
      (req, res) => {
        authenticateCalled = true;
        res.status(401).json({ error: { code: 'AUTHENTICATION_REQUIRED' } });
      },
    );
    t.after(() => fs.rm(uploadDirectory, { recursive: true, force: true }));
    const form = new FormData();
    form.set(
      'cv',
      new Blob([Buffer.from('%PDF-1.7\nCV synthetique suffisamment long pour le test public.')], { type: 'application/pdf' }),
      'cv-public.pdf',
    );
    const response = await request(app, '/api/v1/cv/preview', { method: 'POST', body: form });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(authenticateCalled, false);
    assert.equal(body.preview.kind, 'cv-preview-v1');
    assert.equal(received.accountId, undefined);
    assert.equal(received.file.originalname, 'cv-public.pdf');
    await assert.rejects(fs.access(received.file.path), (error) => error?.code === 'ENOENT');
  },
);

test(
  'POST analyses utilise le compte authentifie et nettoie le fichier',
  async (t) => {
    let received;

    const service = {
      createAnalysis: async (input) => {
        received = input;

        await fs.access(input.file.path);

        return sampleAnalysis;
      },
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const form = new FormData();

    form.set(
      'jobTitle',
      'Conseiller clientele',
    );

    form.set(
      'cv',
      new Blob(
        [
          Buffer.from(
            '%PDF-1.7\nCV fictif',
          ),
        ],
        {
          type: 'application/pdf',
        },
      ),
      'cv.pdf',
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses',
      {
        method: 'POST',
        body: form,
      },
    );

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(
      body.analysis.id,
      sampleAnalysis.id,
    );

    assert.equal(
      received.accountId,
      ACCOUNT_ID,
    );

    assert.equal(
      received.body.jobTitle,
      'Conseiller clientele',
    );

    assert.equal(
      received.file.originalname,
      'cv.pdf',
    );

    await assert.rejects(
      fs.access(received.file.path),
      (error) =>
        error?.code === 'ENOENT',
    );
  },
);

test(
  'la permission est verifiee avant le service',
  async (t) => {
    let called = false;

    const service = {
      listAnalyses: async () => {
        called = true;
        return {};
      },
    };

    const { app, uploadDirectory } =
      createApp(
        service,
        async () => false,
      );

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses',
    );

    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(
      body.error.code,
      'PERMISSION_DENIED',
    );

    assert.equal(called, false);
  },
);

test(
  'historique et detail utilisent toujours le proprietaire authentifie',
  async (t) => {
    const calls = [];

    const service = {
      listAnalyses: async (input) => {
        calls.push(['list', input]);

        return {
          analyses: [sampleAnalysis],
          pagination: {
            limit: 25,
            offset: 5,
            total: 1,
          },
        };
      },

      getAnalysis: async (input) => {
        calls.push(['get', input]);

        return {
          ...sampleAnalysis,
          snapshot: {
            status: 'completed',
          },
        };
      },
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const listResponse = await request(
      app,
      '/api/v1/cv/analyses?limit=25&offset=5&accountId=autre',
    );

    assert.equal(
      listResponse.status,
      200,
    );

    const detailResponse = await request(
      app,
      `/api/v1/cv/analyses/${
        sampleAnalysis.id
      }`,
    );

    assert.equal(
      detailResponse.status,
      200,
    );

    assert.deepEqual(calls, [
      [
        'list',
        {
          accountId: ACCOUNT_ID,
          limit: '25',
          offset: '5',
        },
      ],
      [
        'get',
        {
          accountId: ACCOUNT_ID,
          analysisId:
            sampleAnalysis.id,
        },
      ],
    ]);
  },
);

test(
  'detail et suppression inconnus retournent le meme 404 non enumerant',
  async (t) => {
    const service = {
      getAnalysis: async () => null,
      deleteAnalysis: async () => false,
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const detail = await request(
      app,
      '/api/v1/cv/analyses/inconnu',
    );

    const detailBody =
      await detail.json();

    const deletion = await request(
      app,
      '/api/v1/cv/analyses/inconnu',
      {
        method: 'DELETE',
      },
    );

    const deletionBody =
      await deletion.json();

    assert.equal(detail.status, 404);
    assert.equal(deletion.status, 404);

    assert.equal(
      detailBody.error.code,
      'CV_ANALYSIS_NOT_FOUND',
    );

    assert.equal(
      deletionBody.error.code,
      'CV_ANALYSIS_NOT_FOUND',
    );
  },
);

test(
  'les erreurs CV connues ne deviennent pas des erreurs 500',
  async (t) => {
    const service = {
      createAnalysis: async () => {
        throw new CvInputError(
          'CV_FILE_REQUIRED',
        );
      },
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses',
      {
        method: 'POST',
      },
    );

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(
      body.error.code,
      'CV_FILE_REQUIRED',
    );
  },
);


test(
  'un repertoire vide utilise le repertoire temporaire par defaut',
  () => {
    assert.equal(
      resolveUploadDirectory(''),
      DEFAULT_UPLOAD_DIRECTORY,
    );

    assert.equal(
      resolveUploadDirectory('   '),
      DEFAULT_UPLOAD_DIRECTORY,
    );

    assert.throws(
      () =>
        resolveUploadDirectory(
          'uploads/cv',
        ),
      /absolute path/u,
    );
  },
);

test(
  'une session est requise avant tout appel du service',
  async (t) => {
    let called = false;

    const service = {
      listAnalyses: async () => {
        called = true;
        return {};
      },
    };

    const rejectAuthentication = (
      req,
      res,
    ) => res.status(401).json({
      error: {
        code: 'SESSION_REQUIRED',
        message:
          'An access token is required.',
      },
    });

    const { app, uploadDirectory } =
      createApp(
        service,
        async () => true,
        rejectAuthentication,
      );

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses',
    );

    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(
      body.error.code,
      'SESSION_REQUIRED',
    );
    assert.equal(called, false);
  },
);

test(
  'un fichier trop volumineux retourne 413 sans fichier residuel',
  async (t) => {
    let called = false;

    const service = {
      createAnalysis: async () => {
        called = true;
        return sampleAnalysis;
      },
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const form = new FormData();

    form.set(
      'cv',
      new Blob(
        [
          Buffer.alloc(
            CV_MAX_FILE_SIZE + 1,
            0x41,
          ),
        ],
        {
          type: 'application/pdf',
        },
      ),
      'trop-grand.pdf',
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses',
      {
        method: 'POST',
        body: form,
      },
    );

    const body = await response.json();

    assert.equal(response.status, 413);
    assert.equal(
      body.error.code,
      'CV_FILE_TOO_LARGE',
    );
    assert.equal(called, false);

    assert.deepEqual(
      await fs.readdir(uploadDirectory),
      [],
    );
  },
);

test(
  'une erreur apres upload nettoie toujours le fichier temporaire',
  async (t) => {
    let uploadedPath;

    const service = {
      createAnalysis: async ({ file }) => {
        uploadedPath = file.path;

        await fs.access(uploadedPath);

        throw new CvInputError(
          'CV_TEXT_TOO_SHORT',
        );
      },
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const form = new FormData();

    form.set(
      'cv',
      new Blob(
        [
          Buffer.from(
            '%PDF-1.7\nCV trop court',
          ),
        ],
        {
          type: 'application/pdf',
        },
      ),
      'court.pdf',
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses',
      {
        method: 'POST',
        body: form,
      },
    );

    const body = await response.json();

    assert.equal(response.status, 422);
    assert.equal(
      body.error.code,
      'CV_TEXT_TOO_SHORT',
    );

    await assert.rejects(
      fs.access(uploadedPath),
      (error) =>
        error?.code === 'ENOENT',
    );
  },
);

test(
  'le rapport PDF est protégé par ownership et permission dédiée',
  async (t) => {
    const calls = [];
    const permissions = [];

    const service = {
      getReport: async (input) => {
        calls.push(input);

        return {
          buffer: Buffer.from(
            '%PDF-1.7\nrapport',
          ),
          fileName:
            'rapport-cv-makoki-analysis-1.pdf',
        };
      },
    };

    const { app, uploadDirectory } =
      createApp(
        service,
        async (input) => {
          permissions.push(input);
          return true;
        },
      );

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses/analysis-1/report.pdf',
    );

    const buffer = Buffer.from(
      await response.arrayBuffer(),
    );

    assert.equal(
      response.status,
      200,
    );

    assert.equal(
      response.headers.get(
        'content-type',
      ),
      'application/pdf',
    );

    assert.equal(
      response.headers.get(
        'cache-control',
      ),
      'private, no-store, max-age=0',
    );

    assert.equal(
      response.headers.get(
        'x-content-type-options',
      ),
      'nosniff',
    );

    assert.match(
      response.headers.get(
        'content-disposition',
      ),
      /rapport-cv-makoki-analysis-1\.pdf/u,
    );

    assert.equal(
      buffer
        .subarray(0, 5)
        .toString('ascii'),
      '%PDF-',
    );

    assert.deepEqual(calls, [
      {
        accountId: ACCOUNT_ID,
        analysisId: 'analysis-1',
      },
    ]);

    assert.deepEqual(permissions, [
      {
        accountId: ACCOUNT_ID,
        permissionId:
          'cv.report.read_own',
      },
    ]);
  },
);

test(
  'un rapport étranger ou inconnu retourne le même 404',
  async (t) => {
    const service = {
      getReport: async () => null,
    };

    const { app, uploadDirectory } =
      createApp(service);

    t.after(() =>
      fs.rm(uploadDirectory, {
        recursive: true,
        force: true,
      })
    );

    const response = await request(
      app,
      '/api/v1/cv/analyses/inconnu/report.pdf',
    );

    const body =
      await response.json();

    assert.equal(
      response.status,
      404,
    );

    assert.equal(
      body.error.code,
      'CV_ANALYSIS_NOT_FOUND',
    );
  },
);
