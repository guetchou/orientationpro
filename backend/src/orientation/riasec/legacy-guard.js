const RETIRED_RIASEC_TYPES = new Set(['riasec', 'riasec_professional']);

const normalizedTestType = (value) => String(value || '').trim().toLowerCase();

const rejectLegacyRiasec = (req, res, next) => {
  const testType = normalizedTestType(req.body?.testType);
  if (!RETIRED_RIASEC_TYPES.has(testType)) return next();

  return res.status(410).json({
    success: false,
    error: {
      code: 'LEGACY_RIASEC_RETIRED',
      message: 'This historical RIASEC engine is retired. Use the authenticated versioned orientation API.',
      canonicalEndpoints: {
        instrument: 'GET /api/v1/orientation/riasec/instrument',
        attempts: 'POST /api/v1/orientation/riasec/attempts',
        results: 'GET /api/v1/orientation/results',
      },
    },
  });
};

const hideRetiredRiasec = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (!payload?.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      return originalJson(payload);
    }
    const data = { ...payload.data };
    delete data.riasec_professional;
    return originalJson({
      ...payload,
      data,
      metadata: {
        ...(payload.metadata || {}),
        count: Object.keys(data).length,
      },
    });
  };
  return next();
};

module.exports = {
  RETIRED_RIASEC_TYPES,
  hideRetiredRiasec,
  rejectLegacyRiasec,
};
