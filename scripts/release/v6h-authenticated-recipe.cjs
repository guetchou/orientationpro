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

const diagnostic = {
  objective: 'studies',
  identity: {
    ageRange: '18-24',
    country: { value: 'République du Congo', verification: 'declared' },
    zone: { value: 'Brazzaville', verification: 'declared' },
    situation: { value: 'Bachelier en recherche d’orientation pour la rentrée', verification: 'declared' },
    educationLevel: { value: 'baccalaureate', verification: 'declared' },
    diploma: { value: 'Baccalauréat scientifique obtenu', verification: 'declared' },
    subjects: ['Mathématiques', 'Sciences de la vie', 'Français'],
    significantResults: ['Présentation numérique réalisée dans un projet scolaire'],
    interruptions: [],
  },
  constraints: {
    mobility: 'local',
    budget: { amount: 350000, currency: 'XAF', verification: 'declared' },
    needIncomeWithinMonths: 36,
    maxDurationMonths: 48,
    internetAccess: 'regular',
    equipment: ['smartphone'],
    familyResponsibilities: ['Soutien ponctuel à la famille'],
    availability: ['temps plein'],
    healthOrDisability: [],
    documents: ['baccalaureat', 'piece identite'],
    availableModes: ['presentiel', 'online'],
  },
  preferences: {
    interests: ['numérique', 'informatique', 'communication', 'création'],
    activities: ['résoudre des problèmes', 'aider un proche avec son téléphone', 'présenter un projet'],
    favouriteSubjects: ['mathématiques', 'sciences'],
    workEnvironments: ['travail en équipe', 'bureau', 'contact public'],
    workStyles: ['travail technique', 'analyse', 'variété'],
    values: ['évolution', 'insertion', 'utilité'],
  },
  capabilities: {
    skills: ['logique', 'communication', 'organisation'],
    internships: [],
    volunteering: ['Aide numérique informelle dans le quartier'],
    jobs: [],
    personalProjects: ['Création d’une présentation et d’un mini-budget sur tableur'],
    responsibilities: ['Organisation d’un travail de groupe scolaire'],
    languages: ['français', 'lingala'],
    digitalSkills: ['navigation web', 'traitement de texte', 'tableur débutant'],
    evidence: ['présentation scolaire disponible'],
    regulatoryQualifications: [],
  },
  priorities: [
    { id: 'interest', importance: 1 },
    { id: 'proximity', importance: 0.92 },
    { id: 'cost', importance: 0.84 },
    { id: 'duration', importance: 0.76 },
    { id: 'employability', importance: 0.68 },
  ],
  notes: 'Dossier de recette V6-H anonymisé, créé uniquement pour valider le parcours public authentifié.',
};

const validateRecommendations = (envelope) => {
  const recommendation = envelope?.project?.recommendation;
  if (!recommendation) throw new Error('Recommendation payload is missing.');
  if (recommendation.status !== 'complete') {
    throw new Error(`Expected complete recommendations, received ${recommendation.status}.`);
  }
  if (recommendation.scenarios.length < 3 || recommendation.scenarios.length > 5) {
    throw new Error(`Expected 3 to 5 scenarios, received ${recommendation.scenarios.length}.`);
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
  const verified = await request('/v1/auth/verify-email', {
    method: 'POST',
    expected: 200,
    body: JSON.stringify({ token: verificationToken }),
  });
  if (verified.body?.account?.status !== 'active') throw new Error('Email verification did not activate the account.');

  const session = await login();
  const token = session.accessToken;

  const created = await request('/v1/life-projects', {
    method: 'POST',
    expected: 201,
    token,
    body: JSON.stringify({
      title: 'Recette V6-H — projet de vie rentrée',
      purpose: 'Comparer des options réalistes et préparer une première action vérifiable.',
    }),
  });
  const projectId = created.body?.project?.id;
  const createdVersion = created.body?.persistenceVersion;
  if (!projectId || createdVersion !== 1) throw new Error('Created project did not return the expected version 1.');

  const diagnosed = await request(`/v1/life-projects/${encodeURIComponent(projectId)}/diagnostic`, {
    method: 'PUT',
    expected: 200,
    token,
    headers: { 'if-match': `"${createdVersion}"` },
    body: JSON.stringify(diagnostic),
  });
  const diagnosedVersion = diagnosed.body?.persistenceVersion;
  if (diagnosedVersion !== 2 || diagnosed.body?.project?.diagnostic?.identity?.zone?.value !== 'Brazzaville') {
    throw new Error('Diagnostic was not persisted at version 2.');
  }

  const generated = await request(`/v1/life-projects/${encodeURIComponent(projectId)}/recommendations`, {
    method: 'POST',
    expected: 200,
    token,
    headers: { 'if-match': `"${diagnosedVersion}"` },
    body: JSON.stringify({ maximumScenarios: 5 }),
  });
  const recommendation = validateRecommendations(generated.body);
  if (generated.body?.project?.state !== 'comparison' || generated.body?.persistenceVersion !== 3) {
    throw new Error('Project did not enter comparison at version 3.');
  }

  writeEvidence({
    phase: 'initial',
    accountStatus: session.account.status,
    projectId,
    persistenceVersion: generated.body.persistenceVersion,
    projectState: generated.body.project.state,
    recommendationStatus: recommendation.status,
    scenarioCount: recommendation.scenarios.length,
    scenarioFacts: recommendation.scenarios.map((scenario) => ({
      id: scenario.id,
      rank: scenario.rank,
      title: scenario.title,
      confidence: scenario.confidence,
      fitScore: scenario.fitScore,
      durationMonths: scenario.durationMonths,
      costStatus: scenario.cost.status,
      calendarStatus: scenario.calendar.status,
      modes: scenario.modes,
      sourceCount: scenario.sourceReferences.length,
      firstActionCount: scenario.firstActions.length,
    })),
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
