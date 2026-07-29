'use strict';

const express = require('express');
const { DataRightsError } = require('./service');

const route = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);

const createDataRightsRouter = ({ service, authenticate, cookieSecure = true } = {}) => {
  if (!service || !authenticate) throw new TypeError('DATA_RIGHTS_DEPENDENCIES_REQUIRED');
  const router = express.Router();
  router.use(authenticate);

  router.get('/export', route(async (request, response) => {
    const payload = await service.exportAccount(request.auth.account.id);
    response.setHeader('Content-Disposition', 'attachment; filename="makoki-data-export.json"');
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(payload);
  }));

  router.patch('/profile', route(async (request, response) => {
    const payload = await service.correctProfile(request.auth.account.id, request.body || {});
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ schemaVersion: 'makoki.data-correction-result.v1', profile: payload });
  }));

  router.post('/delete-account', route(async (request, response) => {
    const result = await service.deleteAccount({
      accountId: request.auth.account.id,
      currentPassword: request.body?.currentPassword,
      confirmation: request.body?.confirmation,
    });
    response.clearCookie('orientationpro_refresh', {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(result);
  }));

  router.use((error, request, response, next) => {
    if (!(error instanceof DataRightsError)) return next(error);
    return response.status(error.status).json({
      error: { code: error.code, message: error.message },
      requestId: request.requestId,
    });
  });

  return router;
};

module.exports = { createDataRightsRouter };
