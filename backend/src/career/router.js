'use strict';

const express = require('express');

const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const requirePermission = (hasPermission, permissionId) => route(async (req, res, next) => {
  const allowed = await hasPermission({ accountId: req.auth.account.id, permissionId });
  if (!allowed) {
    return res.status(403).json({ error: { code: 'PERMISSION_DENIED', message: 'The authenticated account is not allowed to perform this career action.' } });
  }
  return next();
});

const requestedLocale = (req) => req.query.locale || 'fr';

const createCareerRouter = ({ store, authenticate, hasPermission }) => {
  if (!store || typeof authenticate !== 'function' || typeof hasPermission !== 'function') {
    throw new Error('Career store, authentication and permission checks are required.');
  }
  const router = express.Router();
  router.use(authenticate);

  router.get('/catalog/summary', requirePermission(hasPermission, 'career.catalog.read'), route(async (req, res) => {
    const sources = await store.getCatalogSummary();
    return res.status(200).json({ sources });
  }));

  router.get('/occupations', requirePermission(hasPermission, 'career.catalog.read'), route(async (req, res) => {
    const locale = requestedLocale(req);
    const occupations = await store.searchOccupations({
      query: req.query.q,
      locale,
      riasecOnly: req.query.riasecOnly === 'true',
      includeLocallyExcluded: req.query.includeLocallyExcluded === 'true',
      limit: req.query.limit,
      offset: req.query.offset,
    });
    return res.status(200).json({ requestedLocale: locale, occupations });
  }));

  router.get('/occupations/:occupationId', requirePermission(hasPermission, 'career.catalog.read'), route(async (req, res) => {
    const locale = requestedLocale(req);
    const occupation = await store.getOccupation({ occupationId: req.params.occupationId, locale });
    if (!occupation) return res.status(404).json({ error: { code: 'OCCUPATION_NOT_FOUND', message: 'The requested occupation does not exist in the active catalog.' } });
    return res.status(200).json({ requestedLocale: locale, occupation });
  }));

  router.get('/matches/:resultId', requirePermission(hasPermission, 'career.match.read_own'), route(async (req, res) => {
    const result = await store.matchOrientationResult({
      accountId: req.auth.account.id,
      resultId: req.params.resultId,
      locale: requestedLocale(req),
      includeLocallyExcluded: req.query.includeLocallyExcluded === 'true',
      limit: req.query.limit,
    });
    if (!result) return res.status(404).json({ error: { code: 'ORIENTATION_RESULT_NOT_FOUND', message: 'The orientation result does not exist for the authenticated account.' } });
    return res.status(200).json(result);
  }));

  router.get('/recommendations/:resultId', requirePermission(hasPermission, 'career.match.read_own'), route(async (req, res) => {
    const result = await store.recommendProfileCareers({
      accountId: req.auth.account.id,
      resultId: req.params.resultId,
      locale: requestedLocale(req),
      includeLocallyExcluded: req.query.includeLocallyExcluded === 'true',
      limit: req.query.limit,
    });
    if (!result) return res.status(404).json({ error: { code: 'ORIENTATION_RESULT_NOT_FOUND', message: 'The orientation result does not exist for the authenticated account.' } });
    return res.status(200).json(result);
  }));

  router.post('/recommendations/:resultId/snapshots', requirePermission(hasPermission, 'career.match.read_own'), route(async (req, res) => {
    const result = await store.createRecommendationSnapshot({
      accountId: req.auth.account.id,
      resultId: req.params.resultId,
      locale: requestedLocale(req),
      includeLocallyExcluded: req.query.includeLocallyExcluded === 'true',
      limit: req.query.limit,
    });
    if (!result) return res.status(404).json({ error: { code: 'ORIENTATION_RESULT_NOT_FOUND', message: 'The orientation result does not exist for the authenticated account.' } });
    return res.status(result.created ? 201 : 200).json(result);
  }));

  router.get('/recommendation-snapshots/:snapshotId', requirePermission(hasPermission, 'career.match.read_own'), route(async (req, res) => {
    const result = await store.getRecommendationSnapshot({
      accountId: req.auth.account.id,
      snapshotId: req.params.snapshotId,
    });
    if (!result) return res.status(404).json({ error: { code: 'CAREER_SNAPSHOT_NOT_FOUND', message: 'The recommendation snapshot does not exist for the authenticated account.' } });
    return res.status(200).json(result);
  }));

  return router;
};

module.exports = { createCareerRouter };
