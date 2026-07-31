'use strict';

const { deepFreeze } = require('./contracts');

const DIAGNOSTIC_SCHEMA_VERSION = 'makoki-life-diagnostic-v1';
const OBJECTIVES = Object.freeze([
  'studies',
  'training',
  'insertion',
  'reentry',
  'reconversion',
  'entrepreneurship',
  'work_and_training',
  'uncertain',
]);
const MOBILITY_LEVELS = Object.freeze(['none', 'local', 'national', 'international', 'flexible', 'unknown']);
const VERIFICATION_LEVELS = Object.freeze(['declared', 'verified', 'unknown']);
const RIASEC_DIMENSIONS = Object.freeze(['R', 'I', 'A', 'S', 'E', 'C']);
const RIASEC_KEYWORDS = Object.freeze({
  R: Object.freeze(['realiste', 'technique', 'terrain', 'pratique', 'machines', 'construction', 'technologie']),
  I: Object.freeze(['investigation', 'sciences', 'analyse', 'recherche', 'mathematiques', 'resolution de problemes']),
  A: Object.freeze(['artistique', 'creation', 'design', 'expression', 'communication visuelle']),
  S: Object.freeze(['social', 'aide', 'enseignement', 'accompagnement', 'service', 'sante']),
  E: Object.freeze(['entreprenant', 'entrepreneuriat', 'vente', 'leadership', 'negociation', 'initiative']),
  C: Object.freeze(['conventionnel', 'organisation', 'gestion', 'administration', 'donnees', 'precision']),
});

class LifeDiagnosticContractError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LifeDiagnosticContractError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const isObject = (value) => Boolean(value)
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype;

const object = (value, field) => {
  if (value === undefined || value === null) return {};
  if (!isObject(value)) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_OBJECT_INVALID',
      `${field} must be a plain object.`,
      { field },
    );
  }
  return { ...value };
};

const optionalString = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_STRING_INVALID',
      `${field} must be a non-empty string when provided.`,
      { field },
    );
  }
  return value.trim();
};

const requiredString = (value, field) => {
  const normalized = optionalString(value, field);
  if (!normalized) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_FIELD_REQUIRED',
      `${field} is required.`,
      { field },
    );
  }
  return normalized;
};

const stringArray = (value, field) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const enumValue = (value, field, allowed, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (!allowed.includes(value)) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_ENUM_INVALID',
      `${field} is invalid.`,
      { field, value, allowed },
    );
  }
  return value;
};

const numberOrNull = (value, field, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < minimum || numeric > maximum) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_NUMBER_INVALID',
      `${field} must be between ${minimum} and ${maximum}.`,
      { field, value },
    );
  }
  return numeric;
};

const timestamp = (value, field) => {
  const text = requiredString(value, field);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return parsed.toISOString();
};

const evidenceField = (input, field) => {
  const value = object(input, field);
  return deepFreeze({
    value: value.value === undefined ? null : value.value,
    verification: enumValue(
      value.verification,
      `${field}.verification`,
      VERIFICATION_LEVELS,
      value.value === undefined || value.value === null || value.value === '' ? 'unknown' : 'declared',
    ),
    source: optionalString(value.source, `${field}.source`),
    verifiedAt: value.verifiedAt ? timestamp(value.verifiedAt, `${field}.verifiedAt`) : null,
  });
};

const priority = (input, field) => {
  const value = object(input, field);
  return deepFreeze({
    id: requiredString(value.id, `${field}.id`),
    importance: numberOrNull(value.importance, `${field}.importance`, 0, 1) ?? 0.5,
  });
};

const createRiasecProfile = (input) => {
  if (input === undefined || input === null) return null;
  const value = object(input, 'diagnostic.riasecProfile');
  const scoreInput = object(value.scores, 'diagnostic.riasecProfile.scores');
  const scores = Object.fromEntries(RIASEC_DIMENSIONS.map((dimension) => [
    dimension,
    numberOrNull(
      scoreInput[dimension],
      `diagnostic.riasecProfile.scores.${dimension}`,
      0,
      100,
    ) ?? 0,
  ]));
  const ranking = Array.isArray(value.ranking)
    ? value.ranking.map((entry, index) => {
      const field = `diagnostic.riasecProfile.ranking[${index}]`;
      const rankingEntry = object(entry, field);
      const dimension = requiredString(rankingEntry.dimension, `${field}.dimension`);
      return deepFreeze({
        dimension: enumValue(dimension, `${field}.dimension`, RIASEC_DIMENSIONS),
        score: numberOrNull(rankingEntry.score, `${field}.score`, 0, 100) ?? 0,
      });
    })
    : [];
  if (new Set(ranking.map((entry) => entry.dimension)).size !== ranking.length) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_RIASEC_RANKING_INVALID',
      'diagnostic.riasecProfile.ranking contains duplicate dimensions.',
    );
  }

  return deepFreeze({
    resultId: requiredString(value.resultId, 'diagnostic.riasecProfile.resultId'),
    attemptId: requiredString(value.attemptId, 'diagnostic.riasecProfile.attemptId'),
    instrumentId: requiredString(value.instrumentId, 'diagnostic.riasecProfile.instrumentId'),
    algorithmVersion: requiredString(
      value.algorithmVersion,
      'diagnostic.riasecProfile.algorithmVersion',
    ),
    primaryCode: optionalString(value.primaryCode, 'diagnostic.riasecProfile.primaryCode'),
    displayCode: requiredString(value.displayCode, 'diagnostic.riasecProfile.displayCode'),
    scores,
    ranking,
    completedAt: timestamp(value.completedAt, 'diagnostic.riasecProfile.completedAt'),
  });
};

const createLifeProjectDiagnostic = (input = {}) => {
  const identity = object(input.identity, 'diagnostic.identity');
  const constraints = object(input.constraints, 'diagnostic.constraints');
  const preferences = object(input.preferences, 'diagnostic.preferences');
  const capabilities = object(input.capabilities, 'diagnostic.capabilities');
  const budget = object(constraints.budget, 'diagnostic.constraints.budget');
  const priorities = Array.isArray(input.priorities)
    ? input.priorities.map((entry, index) => priority(entry, `diagnostic.priorities[${index}]`))
    : [];
  if (new Set(priorities.map((entry) => entry.id)).size !== priorities.length) {
    throw new LifeDiagnosticContractError(
      'LIFE_DIAGNOSTIC_DUPLICATE_PRIORITY',
      'diagnostic.priorities contains duplicate identifiers.',
    );
  }

  return deepFreeze({
    schemaVersion: DIAGNOSTIC_SCHEMA_VERSION,
    id: requiredString(input.id, 'diagnostic.id'),
    objective: enumValue(input.objective, 'diagnostic.objective', OBJECTIVES, 'uncertain'),
    riasecProfile: createRiasecProfile(input.riasecProfile),
    identity: {
      ageRange: optionalString(identity.ageRange, 'diagnostic.identity.ageRange'),
      country: evidenceField(identity.country, 'diagnostic.identity.country'),
      zone: evidenceField(identity.zone, 'diagnostic.identity.zone'),
      situation: evidenceField(identity.situation, 'diagnostic.identity.situation'),
      educationLevel: evidenceField(identity.educationLevel, 'diagnostic.identity.educationLevel'),
      diploma: evidenceField(identity.diploma, 'diagnostic.identity.diploma'),
      subjects: stringArray(identity.subjects, 'diagnostic.identity.subjects'),
      significantResults: stringArray(identity.significantResults, 'diagnostic.identity.significantResults'),
      interruptions: stringArray(identity.interruptions, 'diagnostic.identity.interruptions'),
    },
    constraints: {
      mobility: enumValue(constraints.mobility, 'diagnostic.constraints.mobility', MOBILITY_LEVELS, 'unknown'),
      budget: {
        amount: numberOrNull(budget.amount, 'diagnostic.constraints.budget.amount'),
        currency: optionalString(budget.currency, 'diagnostic.constraints.budget.currency'),
        verification: enumValue(
          budget.verification,
          'diagnostic.constraints.budget.verification',
          VERIFICATION_LEVELS,
          budget.amount === undefined || budget.amount === null ? 'unknown' : 'declared',
        ),
      },
      needIncomeWithinMonths: numberOrNull(
        constraints.needIncomeWithinMonths,
        'diagnostic.constraints.needIncomeWithinMonths',
        0,
        120,
      ),
      maxDurationMonths: numberOrNull(
        constraints.maxDurationMonths,
        'diagnostic.constraints.maxDurationMonths',
        0,
        240,
      ),
      internetAccess: enumValue(
        constraints.internetAccess,
        'diagnostic.constraints.internetAccess',
        ['none', 'limited', 'regular', 'unknown'],
        'unknown',
      ),
      equipment: stringArray(constraints.equipment, 'diagnostic.constraints.equipment'),
      familyResponsibilities: stringArray(
        constraints.familyResponsibilities,
        'diagnostic.constraints.familyResponsibilities',
      ),
      availability: stringArray(constraints.availability, 'diagnostic.constraints.availability'),
      healthOrDisability: stringArray(
        constraints.healthOrDisability,
        'diagnostic.constraints.healthOrDisability',
      ),
      documents: stringArray(constraints.documents, 'diagnostic.constraints.documents'),
      availableModes: stringArray(constraints.availableModes, 'diagnostic.constraints.availableModes'),
    },
    preferences: {
      interests: stringArray(preferences.interests, 'diagnostic.preferences.interests'),
      activities: stringArray(preferences.activities, 'diagnostic.preferences.activities'),
      favouriteSubjects: stringArray(
        preferences.favouriteSubjects,
        'diagnostic.preferences.favouriteSubjects',
      ),
      workEnvironments: stringArray(
        preferences.workEnvironments,
        'diagnostic.preferences.workEnvironments',
      ),
      workStyles: stringArray(preferences.workStyles, 'diagnostic.preferences.workStyles'),
      values: stringArray(preferences.values, 'diagnostic.preferences.values'),
    },
    capabilities: {
      skills: stringArray(capabilities.skills, 'diagnostic.capabilities.skills'),
      internships: stringArray(capabilities.internships, 'diagnostic.capabilities.internships'),
      volunteering: stringArray(capabilities.volunteering, 'diagnostic.capabilities.volunteering'),
      jobs: stringArray(capabilities.jobs, 'diagnostic.capabilities.jobs'),
      personalProjects: stringArray(
        capabilities.personalProjects,
        'diagnostic.capabilities.personalProjects',
      ),
      responsibilities: stringArray(
        capabilities.responsibilities,
        'diagnostic.capabilities.responsibilities',
      ),
      languages: stringArray(capabilities.languages, 'diagnostic.capabilities.languages'),
      digitalSkills: stringArray(
        capabilities.digitalSkills,
        'diagnostic.capabilities.digitalSkills',
      ),
      evidence: stringArray(capabilities.evidence, 'diagnostic.capabilities.evidence'),
      regulatoryQualifications: stringArray(
        capabilities.regulatoryQualifications,
        'diagnostic.capabilities.regulatoryQualifications',
      ),
    },
    priorities,
    notes: optionalString(input.notes, 'diagnostic.notes'),
    recordedAt: timestamp(input.recordedAt, 'diagnostic.recordedAt'),
    updatedAt: timestamp(input.updatedAt || input.recordedAt, 'diagnostic.updatedAt'),
  });
};

const diagnosticMissingInformation = (diagnosticInput) => {
  const diagnostic = createLifeProjectDiagnostic(diagnosticInput);
  const missing = [];
  if (!diagnostic.identity.country.value) missing.push('Pays de résidence');
  if (!diagnostic.identity.zone.value) missing.push('Ville ou zone de résidence');
  if (!diagnostic.identity.situation.value) missing.push('Situation scolaire ou professionnelle');
  if (!diagnostic.identity.educationLevel.value) missing.push('Dernier niveau atteint');
  if (diagnostic.objective === 'uncertain') missing.push('Objectif immédiat');
  if (diagnostic.constraints.mobility === 'unknown') missing.push('Mobilité acceptable');
  if (diagnostic.constraints.budget.amount === null) missing.push('Budget maximal ou financement disponible');
  if (diagnostic.constraints.maxDurationMonths === null) missing.push('Durée maximale acceptable');
  if (diagnostic.preferences.interests.length === 0 && !diagnostic.riasecProfile) {
    missing.push('Intérêts et activités appréciées');
  }
  if (diagnostic.capabilities.skills.length === 0
    && diagnostic.capabilities.digitalSkills.length === 0
    && diagnostic.capabilities.personalProjects.length === 0) {
    missing.push('Compétences, expériences ou projets personnels');
  }
  if (diagnostic.priorities.length === 0) missing.push('Critères de décision classés');
  return Object.freeze([...new Set(missing)]);
};

const riasecTokens = (profile) => {
  if (!profile) return [];
  return profile.ranking
    .slice(0, 3)
    .flatMap((entry) => RIASEC_KEYWORDS[entry.dimension] || []);
};

const diagnosticToEngineInput = (diagnosticInput) => {
  const diagnostic = createLifeProjectDiagnostic(diagnosticInput);
  const educationValue = diagnostic.identity.educationLevel.value;
  const countryValue = diagnostic.identity.country.value;
  const zoneValue = diagnostic.identity.zone.value;
  const profileTokens = riasecTokens(diagnostic.riasecProfile);
  return deepFreeze({
    id: diagnostic.id,
    objective: diagnostic.objective,
    educationLevel: typeof educationValue === 'string' ? educationValue : undefined,
    location: {
      country: typeof countryValue === 'string' ? countryValue : undefined,
      zone: typeof zoneValue === 'string' ? zoneValue : undefined,
    },
    mobility: diagnostic.constraints.mobility,
    budget: {
      amount: diagnostic.constraints.budget.amount === null
        ? undefined
        : diagnostic.constraints.budget.amount,
      currency: diagnostic.constraints.budget.currency || undefined,
    },
    maxDurationMonths: diagnostic.constraints.maxDurationMonths === null
      ? undefined
      : diagnostic.constraints.maxDurationMonths,
    needIncomeWithinMonths: diagnostic.constraints.needIncomeWithinMonths === null
      ? undefined
      : diagnostic.constraints.needIncomeWithinMonths,
    interests: [
      ...diagnostic.preferences.interests,
      ...diagnostic.preferences.activities,
      ...diagnostic.preferences.favouriteSubjects,
      ...profileTokens,
    ],
    skills: [
      ...diagnostic.capabilities.skills,
      ...diagnostic.capabilities.digitalSkills,
      ...diagnostic.capabilities.personalProjects,
    ],
    preferences: [
      ...diagnostic.preferences.workEnvironments,
      ...diagnostic.preferences.workStyles,
      ...diagnostic.preferences.values,
      ...profileTokens,
    ],
    availableModes: diagnostic.constraints.availableModes,
    equipment: [
      ...diagnostic.constraints.equipment,
      ...(diagnostic.constraints.internetAccess === 'regular' ? ['internet'] : []),
    ],
    documents: diagnostic.constraints.documents,
    regulatoryQualifications: diagnostic.capabilities.regulatoryQualifications,
    priorities: diagnostic.priorities,
    riasecProfile: diagnostic.riasecProfile || undefined,
  });
};

module.exports = {
  DIAGNOSTIC_SCHEMA_VERSION,
  LifeDiagnosticContractError,
  MOBILITY_LEVELS,
  OBJECTIVES,
  RIASEC_DIMENSIONS,
  RIASEC_KEYWORDS,
  VERIFICATION_LEVELS,
  createLifeProjectDiagnostic,
  diagnosticMissingInformation,
  diagnosticToEngineInput,
};
