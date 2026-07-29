'use strict';

const LEGACY_API_FLAG = 'LEGACY_API_ENABLED';

const LEGACY_ROUTE_MOUNTS = Object.freeze([
  Object.freeze({ path: '/api/cv', key: 'cv' }),
  Object.freeze({ path: '/api/candidates', key: 'candidates' }),
  Object.freeze({ path: '/api/jobs', key: 'jobs' }),
  Object.freeze({ path: '/api/ats', key: 'ats' }),
  Object.freeze({ path: '/api/appointments', key: 'appointments' }),
  Object.freeze({ path: '/api/messaging', key: 'messaging' }),
  Object.freeze({ path: '/api/applications', key: 'applications' }),
  Object.freeze({ path: '/api/matching', key: 'matching' }),
  Object.freeze({ path: '/api/communication', key: 'communication' }),
  Object.freeze({ path: '/api', key: 'jobScraping' }),
]);

const isLegacyApiEnabled = (env = {}) => env[LEGACY_API_FLAG] === 'true';

const mountLegacyApi = ({ app, env, routes }) => {
  if (!app || typeof app.use !== 'function') {
    throw new TypeError('LEGACY_API_APP_REQUIRED');
  }
  if (!isLegacyApiEnabled(env)) return Object.freeze([]);

  const mounted = [];
  for (const entry of LEGACY_ROUTE_MOUNTS) {
    const router = routes?.[entry.key];
    if (!router) throw new TypeError(`LEGACY_API_ROUTE_REQUIRED:${entry.key}`);
    app.use(entry.path, router);
    mounted.push(entry.path);
  }
  return Object.freeze(mounted);
};

module.exports = {
  LEGACY_API_FLAG,
  LEGACY_ROUTE_MOUNTS,
  isLegacyApiEnabled,
  mountLegacyApi,
};
