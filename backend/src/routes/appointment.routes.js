const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getCounselorAppointments,
  getClientAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
  getCounselorStats
} = require('../controllers/appointment.controller');

// Créer un rendez-vous
router.post('/create', createAppointment);

// Obtenir les rendez-vous d'un conseiller
router.get('/counselor/:counselor_id', getCounselorAppointments);

// Obtenir les rendez-vous d'un client
router.get('/client/:client_id', getClientAppointments);

// Mettre à jour le statut d'un rendez-vous
router.put('/:appointment_id/status', updateAppointmentStatus);

// Obtenir les créneaux disponibles d'un conseiller
router.get('/slots/:counselor_id', getAvailableSlots);

// Obtenir les statistiques d'un conseiller
router.get('/stats/:counselor_id', getCounselorStats);

module.exports = router;
