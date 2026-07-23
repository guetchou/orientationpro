const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const jwt = require('jsonwebtoken');

const {
  CV_MAX_FILE_SIZE,
  getAuthenticatedUserId,
  isPrivilegedCvRole,
  resolveCvAccessScope,
  isAllowedCvFile,
  matchesCvFileSignature,
} = require('../src/security/cv-access');

function request(app, { method = 'GET', path = '/', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const req = http.request({
        host: '127.0.0.1',
        port: address.port,
        method,
        path,
        headers,
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          server.close(() => resolve({ status: res.statusCode, body }));
        });
      });
      req.on('error', (error) => server.close(() => reject(error)));
      req.end();
    });
  });
}

test('CV access requires a positive authenticated user identifier', () => {
  assert.equal(getAuthenticatedUserId({ userId: 42 }), 42);
  assert.equal(getAuthenticatedUserId({ sub: '17' }), 17);
  assert.throws(() => getAuthenticatedUserId({ userId: 'invalid' }), /authenticated user/i);
});

test('only administrative roles receive cross-user CV access', () => {
  assert.equal(isPrivilegedCvRole({ role: 'user' }), false);
  assert.equal(isPrivilegedCvRole({ role: 'recruteur' }), false);
  assert.equal(isPrivilegedCvRole({ role: 'admin' }), true);
  assert.equal(isPrivilegedCvRole({ role: 'super_admin' }), true);
});

test('regular users cannot override CV ownership through query parameters', () => {
  assert.deepEqual(
    resolveCvAccessScope({ userId: 7, role: 'user' }, { user_id: '99', candidate_id: '12' }),
    { privileged: false, userId: 7, candidateId: null },
  );
});

test('administrators may apply validated cross-user filters', () => {
  assert.deepEqual(
    resolveCvAccessScope({ userId: 1, role: 'admin' }, { user_id: '99', candidate_id: '12' }),
    { privileged: true, userId: 99, candidateId: 12 },
  );
  assert.throws(
    () => resolveCvAccessScope({ userId: 1, role: 'admin' }, { user_id: 'abc' }),
    /user_id/i,
  );
});

test('CV upload accepts only matched PDF or DOCX extension and MIME pairs', () => {
  assert.equal(CV_MAX_FILE_SIZE, 5 * 1024 * 1024);
  assert.equal(isAllowedCvFile({ originalname: 'candidate.pdf', mimetype: 'application/pdf' }), true);
  assert.equal(isAllowedCvFile({
    originalname: 'candidate.docx',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }), true);
  assert.equal(isAllowedCvFile({ originalname: 'candidate.pdf.exe', mimetype: 'application/pdf' }), false);
  assert.equal(isAllowedCvFile({ originalname: 'candidate.pdf', mimetype: 'application/x-msdownload' }), false);
  assert.equal(isAllowedCvFile({ originalname: '../candidate.pdf', mimetype: 'application/pdf' }), false);
});

test('CV upload verifies the binary file signature', () => {
  assert.equal(matchesCvFileSignature(Buffer.from('%PDF-1.7'), 'application/pdf'), true);
  assert.equal(matchesCvFileSignature(Buffer.from('MZ fake pdf'), 'application/pdf'), false);
  assert.equal(matchesCvFileSignature(
    Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ), true);
  assert.equal(matchesCvFileSignature(
    Buffer.from('%PDF-1.7'),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ), false);
});

test('CV routes reject anonymous requests before database access', async () => {
  process.env.JWT_SECRET = 'test-only-cv-security-secret-with-32-characters';
  const cvRouter = require('../src/routes/cv.routes');
  const app = express();
  app.use('/api/cv', cvRouter);

  const history = await request(app, { path: '/api/cv/history' });
  assert.equal(history.status, 401);

  const upload = await request(app, { method: 'POST', path: '/api/cv/upload' });
  assert.equal(upload.status, 401);
});

test('authentication middleware verifies tokens with the configured secret', () => {
  process.env.JWT_SECRET = 'test-only-cv-security-secret-with-32-characters';
  const { authenticate } = require('../src/middleware/auth.middleware');
  const token = jwt.sign({ userId: 8, role: 'user' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const response = {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
  let nextCalled = false;

  authenticate(req, response, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.user.userId, 8);
  assert.equal(response.statusCode, null);
});

test('history SQL is scoped to the authenticated user, not the requested user_id', async () => {
  const { pool } = require('../src/config/database');
  const { getCVHistory } = require('../src/controllers/cv.controller');
  const originalQuery = pool.query;
  let captured;
  pool.query = async (sql, params) => {
    captured = { sql, params };
    return [[]];
  };
  const response = {
    payload: null,
    status() { return this; },
    json(payload) { this.payload = payload; return this; },
  };

  try {
    await getCVHistory(
      { user: { userId: 7, role: 'user' }, query: { user_id: '99' } },
      response,
    );
  } finally {
    pool.query = originalQuery;
  }

  assert.match(captured.sql, /AND user_id = \?/);
  assert.deepEqual(captured.params, [7, 50]);
  assert.deepEqual(response.payload, { success: true, history: [] });
});

test('single-analysis SQL enforces ownership for regular users', async () => {
  const { pool } = require('../src/config/database');
  const { getCVAnalysis } = require('../src/controllers/cv.controller');
  const originalQuery = pool.query;
  let captured;
  pool.query = async (sql, params) => {
    captured = { sql, params };
    return [[]];
  };
  const response = {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };

  try {
    await getCVAnalysis(
      { user: { userId: 7, role: 'user' }, params: { id: '12' } },
      response,
    );
  } finally {
    pool.query = originalQuery;
  }

  assert.match(captured.sql, /WHERE id = \? AND user_id = \?/);
  assert.deepEqual(captured.params, [12, 7]);
  assert.equal(response.statusCode, 404);
});
