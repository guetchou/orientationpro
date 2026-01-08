const express = require('express');
const router = express.Router();
const jobScrapingController = require('../controllers/jobScraping.controller.simple');

/**
 * Routes pour la gestion des offres d'emploi
 */

// Routes publiques
router.get('/jobs', jobScrapingController.getAllJobs);
router.get('/jobs/featured', jobScrapingController.getFeaturedJobs);
router.get('/jobs/statistics', jobScrapingController.getJobStatistics);
router.get('/jobs/categories', jobScrapingController.getCategories);
router.get('/jobs/:id', jobScrapingController.getJobById);

// Recherche d'offres
router.post('/jobs/search', jobScrapingController.searchJobs);

// Actions sur les offres
router.post('/jobs/:id/apply', jobScrapingController.incrementApplication);

// Routes d'administration (à protéger avec authentification)
router.post('/admin/jobs/scrape', jobScrapingController.triggerScraping);

module.exports = router;
