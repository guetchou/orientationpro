'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAtsService, AtsServiceError } = require('../src/ats-v1/service');
const { statusFor } = require('../src/ats-v1/router');
const { AtsWorkflowError } = require('../src/ats-v1/workflow');
const { AtsPersistenceError } = require('../src/ats-v1/store');

const application = Object.freeze({
  id: 'app-1', jobId: 'job-1', candidateAccountId: 'candidate-1',
  state: 'submitted', version: 1,
});

const makeService = ({ read = true, transition = { allowed: true, actorRole: 'recruiter' } } = {}) => {
  const calls = [];
  const store = {
    async getApplication(id) { return id === 'missing' ? null : application; },
    async listHistory() { return [{ id: 1, eventType: 'application.transitioned' }]; },
    async transition(command) { calls.push(command); return { application: { ...application, state: command.to, version: 2 } }; },
  };
  const authorizer = {
    async canReadApplication() { return read; },
    async canTransition() { return transition; },
  };
  return { service: createAtsService({ store, authorizer }), calls };
};

test('candidate cannot read another candidate application', async () => {
  const { service } = makeService({ read: false });
  await assert.rejects(
    service.getApplication({ id: 'candidate-2', roles: ['user'] }, 'app-1'),
    (error) => error instanceof AtsServiceError && error.code === 'ATS_RESOURCE_FORBIDDEN',
  );
});

test('authorized reader can retrieve ordered history through service', async () => {
  const { service } = makeService();
  const events = await service.listHistory({ id: 'candidate-1', roles: ['user'] }, 'app-1');
  assert.equal(events.length, 1);
});

test('transition uses server-derived actor identity and role', async () => {
  const { service, calls } = makeService();
  await service.transition(
    { id: 'recruiter-1', roles: ['recruiter'] },
    'app-1',
    { to: 'under_review', expectedVersion: 1, actorAccountId: 'attacker', actorRole: 'admin' },
  );
  assert.equal(calls[0].actorAccountId, 'recruiter-1');
  assert.equal(calls[0].actorRole, 'recruiter');
  assert.deepEqual(calls[0].metadata, {});
});

test('forbidden transition never reaches persistence', async () => {
  const { service, calls } = makeService({ transition: { allowed: false, actorRole: null } });
  await assert.rejects(
    service.transition({ id: 'candidate-2', roles: ['user'] }, 'app-1', { to: 'withdrawn', expectedVersion: 1 }),
    (error) => error.code === 'ATS_RESOURCE_FORBIDDEN',
  );
  assert.equal(calls.length, 0);
});

test('router error mapping is controlled', () => {
  assert.equal(statusFor(new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'missing')), 404);
  assert.equal(statusFor(new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'no')), 403);
  assert.equal(statusFor(new AtsPersistenceError('ATS_VERSION_REQUIRED', 'version')), 428);
  assert.equal(statusFor(new AtsPersistenceError('ATS_VERSION_CONFLICT', 'conflict')), 409);
  assert.equal(statusFor(new AtsWorkflowError('ATS_TRANSITION_NOT_ALLOWED', 'transition')), 409);
  assert.equal(statusFor(new AtsWorkflowError('ATS_STATE_INVALID', 'state')), 400);
});
