const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadCV, getCVHistory, getCVAnalysis, getCVReportPDF } = require('../controllers/cv.controller');

// Configurer le dossier d'upload
const uploadDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route POST /api/cv/upload
router.post('/upload', upload.single('cv'), uploadCV);

// Route GET /api/cv/history
router.get('/history', getCVHistory);

// Route GET /api/cv/analysis/:id - Récupérer une analyse spécifique
router.get('/analysis/:id', getCVAnalysis);

// Route GET /api/cv/report/:id/pdf
router.get('/report/:id/pdf', getCVReportPDF);

module.exports = router; 