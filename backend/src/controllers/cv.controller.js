const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const mysql = require('mysql2/promise');
const { pool } = require('../config/database');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');

// Fonction d'extraction de texte selon le type de fichier
async function extractText(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
  } else if (mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  } else {
    throw new Error('Type de fichier non supporté pour l\'extraction de texte.');
  }
}

// Fonction de détection des soft skills
function detectSoftSkills(text) {
  const softSkillsList = [
    'communication',
    'travail en équipe',
    'adaptabilité',
    'créativité',
    'leadership',
    'gestion du temps',
    'résolution de problèmes',
    'esprit critique',
    'autonomie',
    'empathie'
  ];
  const found = [];
  for (const skill of softSkillsList) {
    const regex = new RegExp(skill, 'i');
    if (regex.test(text)) {
      found.push(skill);
    }
  }
  return found;
}

// Fonction de scoring ATS simple
function scoreCV(text) {
  let score = 0;
  let feedback = [];
  // Exemples de critères (à enrichir)
  if (/compétence|skills?/i.test(text)) score += 20; else feedback.push('Ajoutez une section Compétences.');
  if (/expérience|experience/i.test(text)) score += 20; else feedback.push('Ajoutez une section Expérience.');
  if (/formation|education/i.test(text)) score += 20; else feedback.push('Ajoutez une section Formation.');
  if (/contact|email|téléphone|phone/i.test(text)) score += 20; else feedback.push('Ajoutez vos informations de contact.');
  if (text.length > 1000) score += 20; else feedback.push('Votre CV semble trop court.');
  // Détection des soft skills
  const softSkills = detectSoftSkills(text);
  if (softSkills.length > 0) {
    score += 10; // Bonus si soft skills présents
    feedback.push(`Soft skills détectés : ${softSkills.join(', ')}.`);
  } else {
    feedback.push('Aucune soft skill détectée, pensez à les mettre en avant.');
  }
  return { score, feedback: feedback.join(' '), softSkills };
}

// POST /api/cv/upload
const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu.' });
    }
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;
    // Récupérer l'ID utilisateur si fourni
    const userId = req.body.user_id ? parseInt(req.body.user_id, 10) : null;
    // Extraction intelligente
    const extractedText = await extractText(filePath, mimeType);
    // Scoring ATS, feedback et soft skills
    const { score, feedback, softSkills } = scoreCV(extractedText);
    // Stockage en base
    await pool.query(
      'INSERT INTO cv_analysis (user_id, file_name, extracted_text, ats_score, feedback) VALUES (?, ?, ?, ?, ?)',
      [userId, fileName, extractedText, score, feedback]
    );
    res.json({
      success: true,
      message: 'CV uploadé, analysé et stocké avec succès.',
      fileName,
      ats_score: score,
      feedback,
      extracted_text: extractedText,
      soft_skills: softSkills
    });
  } catch (error) {
    console.error('Erreur upload CV:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du CV.' });
  }
};

// GET /api/cv/history?user_id=123
const getCVHistory = async (req, res) => {
  try {
    const userId = req.query.user_id || null;
    let rows;
    if (userId) {
      [rows] = await pool.query('SELECT * FROM cv_analysis WHERE user_id = ? ORDER BY upload_date DESC', [userId]);
    } else {
      [rows] = await pool.query('SELECT * FROM cv_analysis ORDER BY upload_date DESC');
    }
    res.json({ success: true, history: rows });
  } catch (error) {
    console.error('Erreur historique CV:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'historique.' });
  }
};

// GET /api/cv/report/:id/pdf
const getCVReportPDF = async (req, res) => {
  try {
    // Authentification via JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    let userId = null;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      userId = payload.userId;
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    // Récupérer l'analyse
    const [rows] = await pool.query('SELECT * FROM cv_analysis WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Rapport non trouvé.' });
    }
    const report = rows[0];
    // Générer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-cv-${report.id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(20).text('Rapport d\'analyse ATS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Fichier : ${report.file_name}`);
    doc.text(`Date d'upload : ${new Date(report.upload_date).toLocaleString()}`);
    doc.text(`Score ATS : ${report.ats_score} / 100`);
    doc.moveDown();
    doc.fontSize(12).text('Feedback :', { underline: true });
    doc.text(report.feedback);
    doc.moveDown();
    doc.fontSize(12).text('Texte extrait du CV :', { underline: true });
    doc.font('Courier').fontSize(10).text(report.extracted_text, { lineGap: 2 });
    doc.end();
  } catch (error) {
    console.error('Erreur PDF CV:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF.' });
  }
};

module.exports = { uploadCV, getCVHistory, getCVReportPDF }; 