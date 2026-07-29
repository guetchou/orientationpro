'use strict';

const SCHEMA_VERSION = 'makoki-capability-registry-v1';

const enabled = (env, key) => String(env?.[key] || '').toLowerCase() === 'true';

const dependencyRules = Object.freeze([
  Object.freeze({ capabilityId: 'orientation.riasec', key: 'RIASEC_API_ENABLED', requires: 'AUTH_V1_ENABLED' }),
  Object.freeze({ capabilityId: 'career.recommendations', key: 'CAREER_API_ENABLED', requires: 'AUTH_V1_ENABLED' }),
  Object.freeze({ capabilityId: 'cv.analysis-v1', key: 'CV_API_V1_ENABLED', requires: 'AUTH_V1_ENABLED' }),
]);

const configurationErrors = (env = {}) => dependencyRules
  .filter((rule) => enabled(env, rule.key) && !enabled(env, rule.requires))
  .map((rule) => Object.freeze({
    code: 'CAPABILITY_DEPENDENCY_MISSING',
    capabilityId: rule.capabilityId,
    configuredBy: rule.key,
    requiredConfiguration: rule.requires,
  }));

const assertCapabilityConfiguration = (env = {}) => {
  const errors = configurationErrors(env);
  if (errors.length === 0) return;

  const error = new Error(errors
    .map((entry) => `${entry.configuredBy} requires ${entry.requiredConfiguration}`)
    .join('; '));
  error.code = 'CAPABILITY_CONFIGURATION_INVALID';
  error.details = errors;
  throw error;
};

const source = (key) => Object.freeze({ kind: 'environment', key });

const capability = ({
  id,
  domain,
  version,
  status,
  configured,
  configurationKey,
  dependencies = [],
  publicLimitations = [],
}) => Object.freeze({
  id,
  domain,
  version,
  status,
  configured,
  configuration: configurationKey ? source(configurationKey) : Object.freeze({ kind: 'implementation' }),
  dependencies: Object.freeze([...dependencies]),
  publicLimitations: Object.freeze([...publicLimitations]),
});

const createCapabilityRegistry = (env = {}) => {
  assertCapabilityConfiguration(env);

  const authV1 = enabled(env, 'AUTH_V1_ENABLED');
  const legacyAuth = enabled(env, 'LEGACY_AUTH_ENABLED');
  const riasec = enabled(env, 'RIASEC_API_ENABLED');
  const career = enabled(env, 'CAREER_API_ENABLED');
  const cv = enabled(env, 'CV_API_V1_ENABLED');

  const capabilities = [
    capability({
      id: 'identity.auth-v1',
      domain: 'identity',
      version: 'auth-v1',
      status: authV1 ? 'active' : 'disabled',
      configured: authV1,
      configurationKey: 'AUTH_V1_ENABLED',
      publicLimitations: ['Activation technique uniquement ; ne décrit pas les fournisseurs OAuth configurés.'],
    }),
    capability({
      id: 'profile.core-v1',
      domain: 'profile',
      version: 'profile-v1',
      status: authV1 ? 'active' : 'disabled',
      configured: authV1,
      configurationKey: 'AUTH_V1_ENABLED',
      dependencies: ['identity.auth-v1'],
      publicLimitations: ['Les informations déclarées ne deviennent pas automatiquement des faits vérifiés.'],
    }),
    capability({
      id: 'orientation.riasec',
      domain: 'orientation',
      version: 'riasec-result-v2',
      status: riasec ? 'experimental' : 'disabled',
      configured: riasec,
      configurationKey: 'RIASEC_API_ENABLED',
      dependencies: ['identity.auth-v1'],
      publicLimitations: [
        'Instrument MAKOKI au statut draft tant que le protocole psychométrique n’est pas achevé.',
        'Résultat descriptif d’intérêts, sans diagnostic ni aptitude garantie.',
      ],
    }),
    capability({
      id: 'career.recommendations',
      domain: 'career',
      version: 'career-profile-context-v2',
      status: career ? 'active' : 'disabled',
      configured: career,
      configurationKey: 'CAREER_API_ENABLED',
      dependencies: ['identity.auth-v1', 'orientation.riasec'],
      publicLimitations: [
        'Aucune garantie d’emploi, de salaire, d’admission ou d’équivalence réglementaire.',
        'Les données ESCO/O*NET doivent être complétées par une couche locale vérifiée.',
      ],
    }),
    capability({
      id: 'cv.analysis-v1',
      domain: 'employment',
      version: 'cv-analysis-v1',
      status: cv ? 'active' : 'disabled',
      configured: cv,
      configurationKey: 'CV_API_V1_ENABLED',
      dependencies: ['identity.auth-v1'],
      publicLimitations: ['Une analyse de document ne valide ni l’expérience ni les compétences déclarées.'],
    }),
    capability({
      id: 'identity.auth-legacy',
      domain: 'identity',
      version: 'legacy',
      status: legacyAuth ? 'legacy' : 'disabled',
      configured: legacyAuth,
      configurationKey: 'LEGACY_AUTH_ENABLED',
      publicLimitations: ['Frontière historique à contenir puis retirer ; ne pas utiliser pour un nouveau parcours.'],
    }),
    capability({
      id: 'life-project.core-v1',
      domain: 'life-project',
      version: 'not-implemented',
      status: 'disabled',
      configured: false,
      publicLimitations: ['Contrats et implémentation non encore livrés ; aucune capacité publique ne doit être annoncée.'],
    }),
  ];

  return Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    configurationValid: true,
    capabilities: Object.freeze(capabilities),
  });
};

module.exports = {
  SCHEMA_VERSION,
  assertCapabilityConfiguration,
  configurationErrors,
  createCapabilityRegistry,
};
