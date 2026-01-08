const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');

// Routes pour les offres d'emploi
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Obtenir la liste des offres d'emploi
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page (défaut 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page (défaut 20)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, paused, closed]
 *         description: Filtrer par statut
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filtrer par département
 *       - in: query
 *         name: employment_type
 *         schema:
 *           type: string
 *           enum: [full_time, part_time, contract, internship]
 *         description: Filtrer par type d'emploi
 *       - in: query
 *         name: remote_type
 *         schema:
 *           type: string
 *           enum: [on_site, remote, hybrid]
 *         description: Filtrer par type de travail
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *           enum: [entry, mid, senior, executive]
 *         description: Filtrer par niveau d'expérience
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans titre, description, exigences
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Champ de tri
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des offres récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', jobsController.getJobs);

/**
 * @swagger
 * /api/jobs/stats:
 *   get:
 *     summary: Obtenir les statistiques des offres d'emploi
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', jobsController.getJobsStats);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Obtenir une offre d'emploi par ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre d'emploi trouvée
 *       404:
 *         description: Offre d'emploi non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', jobsController.getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Créer une nouvelle offre d'emploi
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du poste
 *               description:
 *                 type: string
 *                 description: Description du poste
 *               requirements:
 *                 type: string
 *                 description: Exigences du poste
 *               responsibilities:
 *                 type: string
 *                 description: Responsabilités du poste
 *               benefits:
 *                 type: string
 *                 description: Avantages offerts
 *               salary_min:
 *                 type: number
 *                 description: Salaire minimum
 *               salary_max:
 *                 type: number
 *                 description: Salaire maximum
 *               salary_currency:
 *                 type: string
 *                 default: XAF
 *                 description: Devise du salaire
 *               employment_type:
 *                 type: string
 *                 enum: [full_time, part_time, contract, internship]
 *                 default: full_time
 *                 description: Type d'emploi
 *               remote_type:
 *                 type: string
 *                 enum: [on_site, remote, hybrid]
 *                 default: on_site
 *                 description: Type de travail
 *               location:
 *                 type: string
 *                 description: Localisation du poste
 *               department:
 *                 type: string
 *                 description: Département
 *               experience_level:
 *                 type: string
 *                 enum: [entry, mid, senior, executive]
 *                 default: mid
 *                 description: Niveau d'expérience requis
 *               required_skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Compétences requises
 *               preferred_skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Compétences préférées
 *               education_requirements:
 *                 type: string
 *                 description: Exigences de formation
 *               language_requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Langues requises
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Priorité du recrutement
 *               application_deadline:
 *                 type: string
 *                 format: date
 *                 description: Date limite de candidature
 *               posted_by:
 *                 type: integer
 *                 description: ID de l'utilisateur qui publie l'offre
 *     responses:
 *       201:
 *         description: Offre d'emploi créée avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', jobsController.createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Mettre à jour une offre d'emploi
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre d'emploi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               benefits:
 *                 type: string
 *               salary_min:
 *                 type: number
 *               salary_max:
 *                 type: number
 *               salary_currency:
 *                 type: string
 *               employment_type:
 *                 type: string
 *                 enum: [full_time, part_time, contract, internship]
 *               remote_type:
 *                 type: string
 *                 enum: [on_site, remote, hybrid]
 *               location:
 *                 type: string
 *               department:
 *                 type: string
 *               experience_level:
 *                 type: string
 *                 enum: [entry, mid, senior, executive]
 *               required_skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferred_skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               education_requirements:
 *                 type: string
 *               language_requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, active, paused, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               application_deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Offre d'emploi mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Offre d'emploi non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', jobsController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Supprimer une offre d'emploi
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre d'emploi supprimée avec succès
 *       404:
 *         description: Offre d'emploi non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', jobsController.deleteJob);

module.exports = router;