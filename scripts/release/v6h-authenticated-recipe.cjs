'use strict';

const fs = require('node:fs');

const apiRoot = process.env.V6H_API_ROOT || 'https://makoki.org/api';
const email = process.env.V6H_RECIPE_EMAIL;
const password = process.env.V6H_RECIPE_PASSWORD;
const phase = process.env.V6H_RECIPE_PHASE || 'initial';
const outputPath = process.env.V6H_RECIPE_OUTPUT || '/tmp/v6h-api-evidence.json';

const required = (name, value) => {
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

required('V6H_RECIPE_EMAIL', email);
required('V6H_RECIPE_PASSWORD', password);

const request = async (path, { token, expected, ...options } = {}) => {
  const response = await fetch(`${apiRoot}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 400) }; }
  }
  if (expected && response.status !== expected) {
    throw new Error(`${options.method || 'GET'} ${path}: expected HTTP ${expected}, received ${response.status}: ${JSON.stringify(body)}`);
  }
  return { response, body };
};

const login = async () => {
  const { body } = await request('/v1/auth/login', {
    method: 'POST',
    expected: 200,
    body: JSON.stringify({ email, password }),
  });
  if (!body?.accessToken || body?.account?.status !== 'active') {
    throw new Error('Login did not return an active authenticated account.');
  }
  return body;
};

const validateRecommendations = (envelope) => {
  const recommendation = envelope?.project?.recommendation;
  if (!recommendation) throw new Error('Recommendation payload is missing.');
  if (recommendation.status !== 'complete') {
    throw new Error(`Expected complete recommendations, received ${recommendation.status}.`);
  }
  if (!Array.isArray(recommendation.scenarios) || recommendation.scenarios.length < 3 || recommendation.scenarios.length > 5) {
    throw new Error(`Expected 3 to 5 scenarios, received ${recommendation.scenarios?.length ?? 'missing'}.`);
  }
  for (const scenario of recommendation.scenarios) {
    if (!scenario.id || !scenario.title || !scenario.firstActions?.length || !scenario.sourceReferences?.length) {
      throw new Error(`Scenario ${scenario.id || 'unknown'} is incomplete.`);
    }
    if (!['high', 'medium', 'low'].includes(scenario.confidence)) {
      throw new Error(`Scenario ${scenario.id} has an invalid confidence.`);
    }
    if (!Object.hasOwn(scenario, 'durationMonths') || !scenario.cost || !scenario.calendar || !Array.isArray(scenario.modes)) {
      throw new Error(`Scenario ${scenario.id} is missing structured comparison facts.`);
    }
  }
  return recommendation;
};

const writeEvidence = (evidence) => {
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify(evidence)}\n`);
};

const initial = async () => {
  const verificationToken = required('V6H_VERIFICATION_TOKEN', process.env.V6H_VERIFICATION_TOKEN);
  const health = await request('/test/health', { expected: 200 });
  if (health.body?.status !== 'OK' || !health.body?.gitSha) {
    throw new Error('Production health did not expose an OK status and served SHA.');
  }

  const verified = await request('/v1/auth/verify-email', {
    method: 'POST',
    expected: 200,
    body: JSON.stringify({ token: verificationToken }),
  });
  if (verified.body?.account?.status !== 'active') {
    throw new Error('Email verification did not activate the account.');
  }

  const session = await login();
  writeEvidence({
    phase: 'initial',
    servedSha: health.body.gitSha,
    accountStatus: session.account.status,
    accountIdPresent: Boolean(session.account.id),
    verified: true,
  });
};

const final = async () => {
  const projectId = required('V6H_PROJECT_ID', process.env.V6H_PROJECT_ID);
  const session = await login();
  const { body } = await request(`/v1/life-projects/${encodeURIComponent(projectId)}`, {
    token: session.accessToken,
    expected: 200,
  });
  const recommendation = validateRecommendations(body);
  if (body?.project?.state !== 'provisional_choice') {
    throw new Error(`Expected provisional_choice, received ${body?.project?.state || 'missing'}.`);
  }
  if (!body?.project?.activeScenarioId) throw new Error('No active provisional scenario was persisted.');
  const selected = recommendation.scenarios.find((scenario) => scenario.id === body.project.activeScenarioId);
  if (!selected) throw new Error('The active scenario is absent from recommendations.');

  writeEvidence({
    phase: 'final',
    projectId,
    persistenceVersion: body.persistenceVersion,
    projectState: body.project.state,
    activeScenarioId: body.project.activeScenarioId,
    selectedScenario: {
      title: selected.title,
      rank: selected.rank,
      fitScore: selected.fitScore,
      confidence: selected.confidence,
      firstAction: selected.firstActions[0]?.title || null,
    },
    scenarioCount: recommendation.scenarios.length,
  });
};

(phase === 'initial' ? initial() : final()).catch((error) => {
  process.stderr.write(`V6-H authenticated recipe failed: ${error.message}\n`);
  process.exitCode = 1;
});
