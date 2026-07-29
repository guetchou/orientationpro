'use strict';

const express = require('express');
const { ProfileSynthesisError } = require('./synthesis-store');

const route = (handler) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (error) {
    if (error instanceof ProfileSynthesisError) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message },
      });
    }
    if (error instanceof TypeError) {
      return res.status(400).json({
        error: { code: 'PROFILE_SYNTHESIS_INPUT_INVALID', message: error.message },
      });
    }
    return next(error);
  }
};

const optionalId = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  const id = String(value).trim();
  if (!/^[0-9a-f-]{36}$/iu.test(id)) throw new TypeError(`${field} is invalid.`);
  return id;
};

const createProfileSynthesisRouter = ({ store, authenticate } = {}) => {
  if (!store || typeof authenticate !== 'function') {
    throw new Error('Profile synthesis store and authentication are required.');
  }

  const router = express.Router();
  router.use(authenticate);

  router.post('/', route(async (req, res) => {
    const data = await store.create({
      accountId: req.auth.account.id,
      orientationResultId: optionalId(req.body?.orientationResultId, 'orientationResultId'),
      recommendationSnapshotId: optionalId(
        req.body?.recommendationSnapshotId,
        'recommendationSnapshotId',
      ),
    });
    return res.status(data.created ? 201 : 200).json(data);
  }));

  router.get('/', route(async (req, res) => {
    const syntheses = await store.list(req.auth.account.id, req.query.limit);
    return res.status(200).json({ syntheses });
  }));

  router.get('/:synthesisId', route(async (req, res) => {
    const data = await store.get(req.auth.account.id, req.params.synthesisId);
    if (!data) {
      return res.status(404).json({
        error: {
          code: 'PROFILE_SYNTHESIS_NOT_FOUND',
          message: 'The profile synthesis does not exist for this account.',
        },
      });
    }
    return res.status(200).json(data);
  }));

  return router;
};

module.exports = { createProfileSynthesisRouter };
