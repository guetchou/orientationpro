'use strict';

const express = require('express');

const route = (handler) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (error) {
    if (error instanceof TypeError) {
      return res.status(400).json({ error: { code: 'PROFILE_INPUT_INVALID', message: error.message } });
    }
    return next(error);
  }
};

const collectionFromBody = (req, field) => {
  const value = req.body?.[field];
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array.`);
  return value;
};

const createProfileRouter = ({ store, authenticate } = {}) => {
  if (!store || typeof authenticate !== 'function') {
    throw new Error('Profile store and authentication are required.');
  }

  const router = express.Router();
  router.use(authenticate);

  router.get('/skills/search', route(async (req, res) => {
    const skills = await store.searchSkills({ query: req.query.q, locale: req.query.locale || 'fr', limit: req.query.limit });
    return res.status(200).json({ skills });
  }));

  router.post('/hypotheses/generate', route(async (req, res) => {
    const data = await store.generateHypotheses(req.auth.account.id);
    return res.status(200).json(data);
  }));

  router.get('/', route(async (req, res) => res.status(200).json(await store.getProfile(req.auth.account.id))));
  router.put('/', route(async (req, res) => res.status(200).json(await store.upsertProfile(req.auth.account.id, req.body || {}))));
  router.put('/education', route(async (req, res) => res.status(200).json(await store.replaceEducation(req.auth.account.id, collectionFromBody(req, 'education')))));
  router.put('/skills', route(async (req, res) => res.status(200).json(await store.replaceDeclaredSkills(req.auth.account.id, collectionFromBody(req, 'skills')))));

  router.patch('/hypotheses/:hypothesisId', route(async (req, res) => {
    const data = await store.updateHypothesisStatus(req.auth.account.id, req.params.hypothesisId, req.body?.status);
    if (!data) {
      return res.status(404).json({ error: { code: 'PROFILE_HYPOTHESIS_NOT_FOUND', message: 'The proposed hypothesis does not exist for this account.' } });
    }
    return res.status(200).json(data);
  }));

  return router;
};

module.exports = { createProfileRouter };
