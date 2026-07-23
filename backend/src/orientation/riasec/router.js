const crypto = require('node:crypto');
const express = require('express');

const { instrument: instrumentDefinition, INSTRUMENT_ID } = require('./instrument');
const { RiasecValidationError, scoreRiasec } = require('./scoring');
const { RiasecStoreError } = require('./store');

const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const shuffle = (values) => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const selected = crypto.randomInt(index + 1);
    [result[index], result[selected]] = [result[selected], result[index]];
  }
  return result;
};

const publicInstrument = (instrument, itemOrder = instrument.items.map((item) => item.id)) => {
  const itemsById = new Map(instrument.items.map((item) => [item.id, item]));
  return {
    id: instrument.id,
    slug: instrument.slug,
    version: instrument.version,
    locale: instrument.locale,
    status: instrument.status,
    title: instrument.title,
    disclaimer: instrument.disclaimer,
    responseScale: instrument.responseScale,
    itemCount: itemOrder.length,
    items: itemOrder.map((itemId, index) => {
      const item = itemsById.get(itemId);
      if (!item) {
        const error = new Error('The stored item order references an unknown instrument item.');
        error.code = 'CORRUPT_RIASEC_ATTEMPT';
        throw error;
      }
      return {
        id: item.id,
        position: index + 1,
        prompt: item.prompt,
      };
    }),
  };
};

const resultSnapshot = ({ instrument, result }) => ({
  resultType: 'riasec',
  instrument: {
    id: instrument.id,
    slug: instrument.slug,
    version: instrument.version,
    locale: instrument.locale,
    title: instrument.title,
    responseScale: instrument.responseScale,
    methodology: instrument.methodology,
    source: instrument.source,
    disclaimer: instrument.disclaimer,
    contentHash: instrument.contentHash,
  },
  dimensions: instrumentDefinition.dimensions,
  result,
  generatedAt: new Date().toISOString(),
});

const statusForStoreError = (error) => {
  if (error.code === 'ATTEMPT_NOT_FOUND') return 404;
  if (error.code === 'INSTRUMENT_MISMATCH' || error.code === 'ATTEMPT_NOT_SUBMITTABLE') return 409;
  return 400;
};

const createRiasecRouter = ({
  store,
  authenticate,
  hasPermission,
  instrumentId = INSTRUMENT_ID,
  allowDraft = false,
}) => {
  if (!store || typeof authenticate !== 'function' || typeof hasPermission !== 'function') {
    throw new Error('RIASEC store, authentication and permission checks are required.');
  }

  const router = express.Router();
  router.use(authenticate);
  router.use(route(async (req, res, next) => {
    const permissionId = req.method === 'GET'
      ? 'orientation.result.read_own'
      : 'orientation.result.create';
    const allowed = await hasPermission({
      accountId: req.auth.account.id,
      permissionId,
    });
    if (!allowed) {
      return res.status(403).json({
        error: {
          code: 'PERMISSION_DENIED',
          message: 'The authenticated account is not allowed to perform this orientation action.',
        },
      });
    }
    return next();
  }));

  const loadAvailableInstrument = async () => {
    const instrument = await store.getInstrument(instrumentId);
    if (!instrument) return null;
    if (instrument.status === 'draft' && !allowDraft) return null;
    if (!['draft', 'pilot', 'active'].includes(instrument.status)) return null;
    return instrument;
  };

  router.get('/riasec/instrument', route(async (req, res) => {
    const instrument = await loadAvailableInstrument();
    if (!instrument) {
      return res.status(404).json({
        error: {
          code: 'RIASEC_INSTRUMENT_UNAVAILABLE',
          message: 'No RIASEC instrument is currently available.',
        },
      });
    }
    return res.status(200).json({ instrument: publicInstrument(instrument) });
  }));

  router.post('/riasec/attempts', route(async (req, res) => {
    const instrument = await loadAvailableInstrument();
    if (!instrument) {
      return res.status(404).json({
        error: {
          code: 'RIASEC_INSTRUMENT_UNAVAILABLE',
          message: 'No RIASEC instrument is currently available.',
        },
      });
    }

    const itemOrder = shuffle(instrument.items.map((item) => item.id));
    const attempt = await store.createAttempt({
      accountId: req.auth.account.id,
      instrumentId: instrument.id,
      itemOrder,
    });
    return res.status(201).json({
      attempt,
      instrument: publicInstrument(instrument, itemOrder),
    });
  }));

  router.get('/riasec/attempts/:attemptId', route(async (req, res) => {
    const attempt = await store.getAttempt({
      accountId: req.auth.account.id,
      attemptId: req.params.attemptId,
    });
    if (!attempt) {
      return res.status(404).json({
        error: { code: 'ATTEMPT_NOT_FOUND', message: 'The RIASEC attempt does not exist.' },
      });
    }

    const instrument = await store.getInstrument(attempt.instrumentId);
    if (!instrument) {
      return res.status(409).json({
        error: {
          code: 'RIASEC_INSTRUMENT_MISSING',
          message: 'The instrument version for this attempt is unavailable.',
        },
      });
    }
    return res.status(200).json({
      attempt,
      instrument: publicInstrument(instrument, attempt.itemOrder),
    });
  }));

  router.post('/riasec/attempts/:attemptId/submit', route(async (req, res) => {
    const attempt = await store.getAttempt({
      accountId: req.auth.account.id,
      attemptId: req.params.attemptId,
    });
    if (!attempt) {
      return res.status(404).json({
        error: { code: 'ATTEMPT_NOT_FOUND', message: 'The RIASEC attempt does not exist.' },
      });
    }

    const instrument = await store.getInstrument(attempt.instrumentId);
    if (!instrument) {
      return res.status(409).json({
        error: {
          code: 'RIASEC_INSTRUMENT_MISSING',
          message: 'The instrument version for this attempt is unavailable.',
        },
      });
    }

    const responses = req.body?.responses;
    const result = scoreRiasec({ items: instrument.items, responses });
    const completion = await store.completeAttempt({
      accountId: req.auth.account.id,
      attemptId: attempt.id,
      instrumentId: instrument.id,
      responses,
      result,
      snapshot: resultSnapshot({ instrument, result }),
    });

    return res.status(completion.status === 'completed' ? 201 : 200).json(completion);
  }));

  router.get('/results', route(async (req, res) => {
    const results = await store.listResults({
      accountId: req.auth.account.id,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    return res.status(200).json({ results });
  }));

  router.get('/results/:resultId', route(async (req, res) => {
    const result = await store.getResult({
      accountId: req.auth.account.id,
      resultId: req.params.resultId,
    });
    if (!result) {
      return res.status(404).json({
        error: { code: 'ORIENTATION_RESULT_NOT_FOUND', message: 'The orientation result does not exist.' },
      });
    }
    return res.status(200).json({ result });
  }));

  router.use((error, req, res, next) => {
    if (error instanceof RiasecValidationError) {
      return res.status(400).json({
        error: { code: error.code, message: error.message, details: error.details },
      });
    }
    if (error instanceof RiasecStoreError) {
      return res.status(statusForStoreError(error)).json({
        error: { code: error.code, message: error.message },
      });
    }
    return next(error);
  });

  return router;
};

module.exports = {
  createRiasecRouter,
  publicInstrument,
};
