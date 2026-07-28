'use strict';

const express = require('express');

const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const createProfileRouter = ({ store, authenticate } = {}) => {
  if (!store || typeof authenticate !== 'function') throw new Error('Profile store and authentication are required.');
  const router = express.Router();
  router.use(authenticate);

  router.get('/', route(async (req, res) => {
    const data = await store.getProfile(req.auth.account.id);
    res.status(200).json(data);
  }));

  router.put('/', route(async (req, res) => {
    const data = await store.upsertProfile(req.auth.account.id, req.body || {});
    res.status(200).json(data);
  }));

  return router;
};

module.exports = { createProfileRouter };