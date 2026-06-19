const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const { uploadCV, getCVHistory, getCVAnalysis, getCVReportPDF } = require('../controllers/cv.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  CV_MAX_FILE_SIZE,
  isAllowedCvFile,
  matchesCvFileSignature,
} = require('../security/cv-access');

// Configurer le dossier d'upload
const uploadDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: CV_MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!isAllowedCvFile(file)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'cv'));
    }
    return cb(null, true);
  },
});

const receiveCvUpload = (req, res, next) => {
  upload.single('cv')(req, res, (error) => {
    if (!error) return next();

    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({
      success: false,
      message: status === 413
        ? 'Le fichier dépasse la taille maximale autorisée de 5 Mo.'
        : 'Seuls les fichiers PDF et DOCX valides sont acceptés.',
    });
  });
};

const verifyCvSignature = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const handle = await fs.open(req.file.path, 'r');
    const signature = Buffer.alloc(8);
    try {
      await handle.read(signature, 0, signature.length, 0);
    } finally {
      await handle.close();
    }

    if (matchesCvFileSignature(signature, req.file.mimetype)) return next();
  } catch (error) {
    console.error('Unable to validate uploaded CV signature:', error.message);
  }

  await fs.unlink(req.file.path).catch(() => {});
  return res.status(400).json({
    success: false,
    message: 'La signature du fichier ne correspond pas à un PDF ou DOCX valide.',
  });
};

// Route POST /api/cv/upload
router.post('/upload', authenticate, receiveCvUpload, verifyCvSignature, uploadCV);

// Route GET /api/cv/history
router.get('/history', authenticate, getCVHistory);

// Route GET /api/cv/analysis/:id - Récupérer une analyse spécifique
router.get('/analysis/:id', authenticate, getCVAnalysis);

// Route GET /api/cv/report/:id/pdf
router.get('/report/:id/pdf', authenticate, getCVReportPDF);

module.exports = router;
