const express = require('express');
const router = express.Router();
const candidatesController = require('../controllers/candidates.controller');

// Routes pour les candidats
/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Obtenir la liste des candidats
 *     tags: [Candidates]
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
 *           enum: [new, screening, interview, technical_test, offer, hired, rejected]
 *         description: Filtrer par statut
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filtrer par poste
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans nom, email, poste
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
 *         description: Liste des candidats récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/', candidatesController.getCandidates);

/**
 * @swagger
 * /api/candidates/stats:
 *   get:
 *     summary: Obtenir les statistiques des candidats
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', candidatesController.getCandidatesStats);

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Obtenir un candidat par ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du candidat
 *     responses:
 *       200:
 *         description: Candidat trouvé
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', candidatesController.getCandidateById);

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Créer un nouveau candidat
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - position
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Nom complet du candidat
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email du candidat
 *               phone:
 *                 type: string
 *                 description: Téléphone du candidat
 *               position:
 *                 type: string
 *                 description: Poste recherché
 *               experience_years:
 *                 type: integer
 *                 description: Années d'expérience
 *               education_level:
 *                 type: string
 *                 description: Niveau d'éducation
 *               location:
 *                 type: string
 *                 description: Localisation
 *               salary_expectation:
 *                 type: number
 *                 description: Prétention salariale
 *               availability:
 *                 type: string
 *                 enum: [immediate, 2_weeks, 1_month, negotiable]
 *                 description: Disponibilité
 *               source:
 *                 type: string
 *                 enum: [website, linkedin, referral, job_board]
 *                 description: Source de candidature
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Compétences
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Langues parlées
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Certifications
 *               social_profiles:
 *                 type: object
 *                 description: Profils sociaux (LinkedIn, GitHub, etc.)
 *               notes:
 *                 type: string
 *                 description: Notes sur le candidat
 *     responses:
 *       201:
 *         description: Candidat créé avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/', candidatesController.createCandidate);

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Mettre à jour un candidat
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du candidat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               position:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               education_level:
 *                 type: string
 *               location:
 *                 type: string
 *               salary_expectation:
 *                 type: number
 *               availability:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [new, screening, interview, technical_test, offer, hired, rejected]
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               social_profiles:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidat mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', candidatesController.updateCandidate);

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Supprimer un candidat
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du candidat
 *     responses:
 *       200:
 *         description: Candidat supprimé avec succès
 *       404:
 *         description: Candidat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', candidatesController.deleteCandidate);

module.exports = router;