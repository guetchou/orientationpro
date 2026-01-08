const express = require('express');
const router = express.Router();
const {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  publishJobPosting,
  getJobStats
} = require('../controllers/job.controller');

// Créer une nouvelle offre d'emploi
router.post('/create', createJobPosting);

// Obtenir toutes les offres d'emploi avec filtres
router.get('/list', getJobPostings);

// Obtenir une offre d'emploi par ID
router.get('/:id', getJobPostingById);

// Mettre à jour une offre d'emploi
router.put('/:id', updateJobPosting);

// Supprimer une offre d'emploi
router.delete('/:id', deleteJobPosting);

// Publier une offre d'emploi
router.post('/:id/publish', publishJobPosting);

// Obtenir les statistiques des offres d'emploi
router.get('/stats/overview', getJobStats);

module.exports = router;

