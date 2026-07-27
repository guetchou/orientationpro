'use strict';

const assert = require('node:assert/strict');
const { randomUUID } =
  require('node:crypto');
const path = require('node:path');
const test = require('node:test');

const mysql = require('mysql2/promise');

const {
  migrateUp,
} = require('../src/db/migrate');

const {
  createCvStore,
} = require('../src/cv/store');

const createPool = () =>
  mysql.createPool({
    host:
      process.env.AUTH_TEST_DB_HOST,
    port: Number(
      process.env.AUTH_TEST_DB_PORT
      || 3306,
    ),
    user:
      process.env.AUTH_TEST_DB_USER,
    password:
      process.env.AUTH_TEST_DB_PASSWORD,
    database:
      process.env.AUTH_TEST_DB_NAME,
    waitForConnections: true,
    connectionLimit: 4,
  });

const createSnapshot = ({
  fileName,
  score,
}) => ({
  status: 'completed',
  document: {
    fileName,
    mimeType: 'application/pdf',
    fileSize: 1024,
    pageCount: 1,
    detectedLanguage: 'fr',
    textLength: 500,
    wordCount: 80,
  },
  scores: {
    generalReadiness: score,
    structure: 20,
    contentClarity: 20,
    impact: 20,
    technicalUsability:
      score - 60,
    targetRelevance: null,
  },
  sections: [],
  skills: [],
  strengths: [],
  issues: [],
  recommendations: [],
  targetMatch: null,
  methodology: {
    version: 'makoki-cv-rules-v1',
    type: 'deterministic_rules',
    limitations: [],
  },
});

test(
  'CV store applique ownership, pagination stable et suppression non enumerante',
  async () => {
    const pool = createPool();

    await migrateUp(
      pool,
      path.join(
        __dirname,
        '..',
        'migrations',
      ),
    );

    const store = createCvStore(pool);

    const accountA = randomUUID();
    const accountB = randomUUID();

    const analysis1 =
      '11111111-1111-4111-8111-111111111111';

    const analysis2 =
      '22222222-2222-4222-8222-222222222222';

    try {
      await pool.execute(
        `INSERT INTO auth_accounts (
           id,
           email,
           password_hash,
           status
         ) VALUES
           (?, ?, ?, 'active'),
           (?, ?, ?, 'active')`,
        [
          accountA,
          `cv-a-${accountA}@example.test`,
          'test-password-hash',
          accountB,
          `cv-b-${accountB}@example.test`,
          'test-password-hash',
        ],
      );

      const first =
        await store.createAnalysis({
          id: analysis1,
          accountId: accountA,
          algorithmVersion:
            'makoki-cv-rules-v1',
          fileName: 'premier.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          pageCount: 1,
          sourceSha256:
            'a'.repeat(64),
          detectedLanguage: 'fr',
          generalReadiness: 71,
          targetRelevance: null,
          targetTitle: null,
          snapshot: createSnapshot({
            fileName: 'premier.pdf',
            score: 71,
          }),
        });

      await store.createAnalysis({
        id: analysis2,
        accountId: accountA,
        algorithmVersion:
          'makoki-cv-rules-v1',
        fileName: 'second.pdf',
        mimeType: 'application/pdf',
        fileSize: 2048,
        pageCount: 2,
        sourceSha256:
          'b'.repeat(64),
        detectedLanguage: 'fr',
        generalReadiness: 82,
        targetRelevance: 64,
        targetTitle:
          'Conseiller clientele',
        snapshot: {
          ...createSnapshot({
            fileName: 'second.pdf',
            score: 82,
          }),
          targetMatch: {
            targetRelevance: 64,
            jobTitle:
              'Conseiller clientele',
            presentSkills: [],
            missingSkills: [],
            requiredSkills: [],
            keywordOverlapPercent: 50,
          },
        },
      });

      assert.equal(first.id, analysis1);
      assert.equal(
        first.snapshot.status,
        'completed',
      );

      assert.equal(
        Object.hasOwn(
          first,
          'sourceSha256',
        ),
        false,
      );

      await pool.execute(
        `UPDATE cv_analyses
         SET created_at =
           '2026-01-01 00:00:00.000'
         WHERE account_id = ?`,
        [accountA],
      );

      const owned =
        await store.listAnalyses({
          accountId: accountA,
          limit: 10,
          offset: 0,
        });

      assert.equal(
        owned.pagination.total,
        2,
      );

      assert.deepEqual(
        owned.analyses.map(
          (analysis) => analysis.id,
        ),
        [
          analysis2,
          analysis1,
        ],
      );

      assert.equal(
        Object.hasOwn(
          owned.analyses[0],
          'snapshot',
        ),
        false,
      );

      const foreignList =
        await store.listAnalyses({
          accountId: accountB,
        });

      assert.equal(
        foreignList.pagination.total,
        0,
      );

      assert.deepEqual(
        foreignList.analyses,
        [],
      );

      assert.equal(
        await store.getAnalysis({
          accountId: accountB,
          analysisId: analysis1,
        }),
        null,
      );

      assert.equal(
        await store.deleteAnalysis({
          accountId: accountB,
          analysisId: analysis1,
        }),
        false,
      );

      assert.equal(
        await store.deleteAnalysis({
          accountId: accountA,
          analysisId: analysis1,
        }),
        true,
      );

      assert.equal(
        await store.getAnalysis({
          accountId: accountA,
          analysisId: analysis1,
        }),
        null,
      );

      const remaining =
        await store.getAnalysis({
          accountId: accountA,
          analysisId: analysis2,
        });

      assert.equal(
        remaining.snapshot.scores
          .generalReadiness,
        82,
      );

      assert.equal(
        Object.hasOwn(
          remaining.snapshot,
          'text',
        ),
        false,
      );
    } finally {
      await pool.execute(
        `DELETE FROM auth_accounts
         WHERE id IN (?, ?)`,
        [accountA, accountB],
      );

      await pool.end();
    }
  },
);
