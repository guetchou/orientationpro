const express = require('express');
const router = express.Router();

const { parseCV, optimizeCV, analyzeTestResults, analyzeMatching, getAnalyticsDashboard, predictCandidateSuccess, analyzeSourceEffectiveness, computeAdvancedScoring, sendNotification, notifyCandidateStatus, executeIndustrialTest, getAvailableTests } = require('../controllers/ats.controller');

// POST /api/ats/cv/parse
router.post('/cv/parse', parseCV);

// POST /api/ats/cv/optimize
router.post('/cv/optimize', optimizeCV);

// POST /api/ats/tests/analyze
router.post('/tests/analyze', analyzeTestResults);

// POST /api/ats/matching/analyze
router.post('/matching/analyze', analyzeMatching);

// POST /api/ats/analytics/dashboard
router.post('/analytics/dashboard', getAnalyticsDashboard);

// POST /api/ats/analytics/predict
router.post('/analytics/predict', predictCandidateSuccess);

// POST /api/ats/analytics/sources
router.post('/analytics/sources', analyzeSourceEffectiveness);

// POST /api/ats/scoring/compute
router.post('/scoring/compute', computeAdvancedScoring);

// POST /api/ats/notify/send
router.post('/notify/send', sendNotification);

// POST /api/ats/notify/candidate-status
router.post('/notify/candidate-status', notifyCandidateStatus);

// POST /api/ats/tests/execute
router.post('/tests/execute', executeIndustrialTest);

// GET /api/ats/tests/available
router.get('/tests/available', getAvailableTests);

module.exports = router;


