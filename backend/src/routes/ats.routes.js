const express = require('express');
const router = express.Router();

const {
  parseCV,
  optimizeCV,
  analyzeTestResults,
  analyzeMatching,
  getAnalyticsDashboard,
  predictCandidateSuccess,
  analyzeSourceEffectiveness,
  computeAdvancedScoring,
  sendNotification,
  notifyCandidateStatus,
  executeIndustrialTest,
  getAvailableTests,
} = require('../controllers/ats.controller');
const {
  hideRetiredRiasec,
  rejectLegacyRiasec,
} = require('../orientation/riasec/legacy-guard');

router.post('/cv/parse', parseCV);
router.post('/cv/optimize', optimizeCV);

// Les anciens endpoints ATS restent disponibles pour les autres tests,
// mais ne peuvent plus calculer ni interpréter un profil RIASEC.
router.post('/tests/analyze', rejectLegacyRiasec, analyzeTestResults);
router.post('/tests/execute', rejectLegacyRiasec, executeIndustrialTest);
router.get('/tests/available', hideRetiredRiasec, getAvailableTests);

router.post('/matching/analyze', analyzeMatching);
router.post('/analytics/dashboard', getAnalyticsDashboard);
router.post('/analytics/predict', predictCandidateSuccess);
router.post('/analytics/sources', analyzeSourceEffectiveness);
router.post('/scoring/compute', computeAdvancedScoring);
router.post('/notify/send', sendNotification);
router.post('/notify/candidate-status', notifyCandidateStatus);

module.exports = router;
