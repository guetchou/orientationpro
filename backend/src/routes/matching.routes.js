const express = require('express');
const router = express.Router();
const {
  findBestCandidates,
  findBestJobs,
  triggerAutomaticMatching
} = require('../controllers/matching.controller');

// Trouver les meilleurs candidats pour une offre d'emploi
router.get('/job/:job_id/candidates', findBestCandidates);

// Trouver les meilleures offres pour un candidat
router.get('/candidate/:candidate_id/jobs', findBestJobs);

// Déclencher le matching automatique
router.post('/auto-match', triggerAutomaticMatching);

module.exports = router;

