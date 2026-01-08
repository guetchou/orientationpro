const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationStats
} = require('../controllers/application.controller');

// Postuler à une offre d'emploi
router.post('/apply', applyToJob);

// Obtenir les candidatures d'un candidat
router.get('/candidate/:candidate_id', getCandidateApplications);

// Obtenir les candidatures pour une offre d'emploi
router.get('/job/:job_id', getJobApplications);

// Mettre à jour le statut d'une candidature
router.put('/:application_id/status', updateApplicationStatus);

// Obtenir les statistiques des candidatures
router.get('/stats/overview', getApplicationStats);

module.exports = router;

