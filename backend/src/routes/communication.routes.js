const express = require('express');
const router = express.Router();
const {
  sendEmail,
  sendApplicationStatusNotification,
  sendReminders,
  sendNewJobNotifications
} = require('../controllers/communication.controller');

// Envoyer un email générique
router.post('/send-email', sendEmail);

// Envoyer une notification de statut de candidature
router.post('/application-status', sendApplicationStatusNotification);

// Envoyer des rappels automatiques
router.post('/send-reminders', sendReminders);

// Envoyer des notifications de nouvelles offres
router.post('/new-job-notifications', sendNewJobNotifications);

module.exports = router;
