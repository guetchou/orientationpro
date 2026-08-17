'use strict';

const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const test = require('node:test');

const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

const parseJson = (value) =>
  typeof value === 'string'
    ? JSON.parse(value)
    : value;

test(
  'CV migration persists an immutable snapshot without raw CV content',
  async () => {
    const pool = createPool();
    const migrations = path.join(
      __dirname,
      '..',
      'migrations',
    );

    const accountId = randomUUID();
    const analysisId = randomUUID();
    const email = `cv-migration-${accountId}@example.test`;

    await migrateUp(pool, migrations);

    try {
      const [columns] = await pool.query(
        `SELECT column_name AS name
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = 'cv_analyses'
         ORDER BY ordinal_position`,
      );

      const columnNames = columns.map((column) => column.name);

      assert.deepEqual(
        columnNames,
        [
          'id',
          'account_id',
          'idempotency_key',
          'request_fingerprint',
          'algorithm_version',
          'file_name',
          'mime_type',
          'file_size',
          'page_count',
          'source_sha256',
          'detected_language',
          'general_readiness',
          'target_relevance',
          'target_title',
          'analysis_snapshot',
          'created_at',
        ],
      );

      for (const forbiddenColumn of [
        'raw_text',
        'cv_text',
        'file_blob',
        'file_content',
        'job_description',
      ]) {
        assert.equal(
          columnNames.includes(forbiddenColumn),
          false,
        );
      }

      const [idempotencyIndexes] = await pool.query(
        `SELECT index_name, non_unique, GROUP_CONCAT(column_name ORDER BY seq_in_index) AS columns_list
         FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'cv_analyses'
           AND index_name = 'uq_cv_analyses_account_idempotency'
         GROUP BY index_name, non_unique`,
      );

      assert.equal(idempotencyIndexes.length, 1);
      assert.equal(Number(idempotencyIndexes[0].non_unique), 0);
      assert.equal(idempotencyIndexes[0].columns_list, 'account_id,idempotency_key');

      const [permissions] = await pool.query(
        `SELECT id
         FROM auth_permissions
         WHERE id LIKE 'cv.%'
         ORDER BY id`,
      );

      assert.deepEqual(
        permissions.map((permission) => permission.id),
        [
          'cv.analysis.create',
          'cv.analysis.delete_own',
          'cv.analysis.read_own',
          'cv.report.read_own',
        ],
      );

      const [[rolePermissionCount]] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM auth_role_permissions
         WHERE permission_id LIKE 'cv.%'`,
      );

      assert.equal(
        Number(rolePermissionCount.count),
        28,
      );

      await pool.execute(
        `INSERT INTO auth_accounts (
           id,
           email,
           password_hash,
           status
         ) VALUES (?, ?, ?, 'active')`,
        [
          accountId,
          email,
          'migration-test-password-hash',
        ],
      );

      const snapshot = {
        status: 'completed',
        document: {
          fileName: 'cv-fictif.pdf',
          mimeType: 'application/pdf',
          fileSize: 2048,
          pageCount: 2,
          detectedLanguage: 'fr',
          textLength: 1200,
          wordCount: 180,
        },
        scores: {
          generalReadiness: 78,
          structure: 20,
          contentClarity: 19,
          impact: 18,
          technicalUsability: 21,
          targetRelevance: 64,
        },
        recommendations: [],
        methodology: {
          version: 'makoki-cv-rules-v1',
          type: 'deterministic_rules',
        },
      };

      await pool.execute(
        `INSERT INTO cv_analyses (
           id,
           account_id,
           idempotency_key,
           request_fingerprint,
           algorithm_version,
           file_name,
           mime_type,
           file_size,
           page_count,
           source_sha256,
           detected_language,
           general_readiness,
           target_relevance,
           target_title,
           analysis_snapshot
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          analysisId,
          accountId,
          'cv-test-operation',
          'c'.repeat(64),
          'makoki-cv-rules-v1',
          'cv-fictif.pdf',
          'application/pdf',
          2048,
          2,
          'a'.repeat(64),
          'fr',
          78,
          64,
          'Conseiller clientèle',
          JSON.stringify(snapshot),
        ],
      );

      await assert.rejects(
        pool.execute(
          `INSERT INTO cv_analyses (
             id,
             account_id,
             idempotency_key,
             request_fingerprint,
             algorithm_version,
             file_name,
             mime_type,
             file_size,
             source_sha256,
             detected_language,
             general_readiness,
             analysis_snapshot
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            accountId,
            'cv-test-operation',
            'c'.repeat(64),
            'makoki-cv-rules-v1',
            'cv-fictif.pdf',
            'application/pdf',
            2048,
            'd'.repeat(64),
            'fr',
            78,
            JSON.stringify(snapshot),
          ],
        ),
      );

      const [[stored]] = await pool.query(
        `SELECT
           account_id,
           idempotency_key,
           request_fingerprint,
           algorithm_version,
           general_readiness,
           target_relevance,
           analysis_snapshot
         FROM cv_analyses
         WHERE id = ?`,
        [analysisId],
      );

      assert.equal(stored.account_id, accountId);
      assert.equal(stored.idempotency_key, 'cv-test-operation');
      assert.equal(stored.request_fingerprint, 'c'.repeat(64));
      assert.equal(
        stored.algorithm_version,
        'makoki-cv-rules-v1',
      );
      assert.equal(
        Number(stored.general_readiness),
        78,
      );
      assert.equal(
        Number(stored.target_relevance),
        64,
      );

      const storedSnapshot = parseJson(
        stored.analysis_snapshot,
      );

      assert.equal(
        storedSnapshot.status,
        'completed',
      );
      assert.equal(
        storedSnapshot.scores.generalReadiness,
        78,
      );
      assert.equal(
        Object.hasOwn(storedSnapshot, 'text'),
        false,
      );

      await assert.rejects(
        pool.execute(
          `INSERT INTO cv_analyses (
             id,
             account_id,
             algorithm_version,
             file_name,
             mime_type,
             file_size,
             source_sha256,
             detected_language,
             general_readiness,
             analysis_snapshot
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            accountId,
            'makoki-cv-rules-v1',
            'score-invalide.pdf',
            'application/pdf',
            1024,
            'b'.repeat(64),
            'fr',
            101,
            JSON.stringify(snapshot),
          ],
        ),
      );

      await pool.execute(
        'DELETE FROM auth_accounts WHERE id = ?',
        [accountId],
      );

      const [[remaining]] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM cv_analyses
         WHERE account_id = ?`,
        [accountId],
      );

      assert.equal(Number(remaining.count), 0);
    } finally {
      await pool.execute(
        'DELETE FROM auth_accounts WHERE id = ?',
        [accountId],
      );

      await pool.end();
    }
  },
);
