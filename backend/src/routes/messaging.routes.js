const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  sendMessage,
  getAppointmentMessages,
  getUserConversations,
  markMessagesAsRead,
  getUnreadCount,
  uploadMessageFile
} = require('../controllers/messaging.controller');

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter tous les types de fichiers pour les messages
    cb(null, true);
  }
});

// Envoyer un message
router.post('/send', sendMessage);

// Obtenir les messages d'un rendez-vous
router.get('/appointment/:appointment_id', getAppointmentMessages);

// Obtenir les conversations d'un utilisateur
router.get('/conversations/:user_id', getUserConversations);

// Marquer les messages comme lus
router.put('/:appointment_id/read', markMessagesAsRead);

// Obtenir le nombre de messages non lus
router.get('/unread/:user_id', getUnreadCount);

// Upload de fichier pour message
router.post('/upload', upload.single('file'), uploadMessageFile);

module.exports = router;
