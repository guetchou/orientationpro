
const { Buffer } = require('buffer');
const NLPService = require('../services/nlpService');
const MatchingService = require('../services/matchingService');
const AnalyticsService = require('../services/analyticsService');
const ScoringService = require('../services/scoringService');
const NotificationService = require('../services/notificationService');
const TestEngine = require('../services/testEngine');

// Initialize services
const nlpService = new NLPService();
const matchingService = new MatchingService();
const analyticsService = new AnalyticsService();
const scoringService = new ScoringService();
const notificationService = new NotificationService();
const testEngine = new TestEngine();

// Simple helpers (ported from Supabase Edge Functions logic, simplified for Node)
function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}

function extractPhones(text) {
  const phoneRegex = /(?:\+33|0)[1-9](?:[0-9]{8})/g;
  return text.match(phoneRegex) || [];
}

function extractLinkedIn(text) {
  const linkedInRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
  return text.match(linkedInRegex) || [];
}

function detectSkills(text) {
  const skillsKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue.js', 'Angular',
    'Node.js', 'Express', 'Django', 'Spring', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD',
    'HTML5', 'CSS3', 'Sass', 'Webpack', 'Vite', 'Jest', 'Cypress',
    'Scrum', 'Agile', 'Kanban', 'Jira', 'Trello', 'Figma', 'Photoshop',
    'Leadership', 'Management', 'Communication', 'Teamwork'
  ];
  const lower = text.toLowerCase();
  return skillsKeywords.filter(k => lower.includes(k.toLowerCase()));
}

function calculateConfidence(parsed) {
  let score = 0;
  if (parsed.personal?.email) score += 0.2;
  if (parsed.personal?.phone) score += 0.2;
  if ((parsed.skills || []).length > 0) score += 0.2;
  if ((parsed.experience || []).length > 0) score += 0.2;
  if ((parsed.education || []).length > 0) score += 0.2;
  return Math.min(1, Math.max(0.4, score));
}

function calculateReadability(content) {
  const sentences = content.split(/[.!?]/).filter(Boolean).length || 1;
  const words = content.trim().split(/\s+/).filter(Boolean).length || 1;
  const wordsPerSentence = words / sentences;
  // 1.0 means easy to read
  return Math.max(0, Math.min(1, 1 - Math.abs(wordsPerSentence - 20) / 40));
}

function calculateStructureScore(content) {
  const headers = ['expérience', 'experience', 'formation', 'education', 'compétences', 'skills'];
  const lower = content.toLowerCase();
  const hits = headers.reduce((acc, h) => acc + (lower.includes(h) ? 1 : 0), 0);
  return Math.min(1, hits / headers.length);
}

// POST /api/ats/cv/parse - Version ultra-avancée avec NLP
async function parseCV(req, res) {
  try {
    const { fileContent, fileName, fileType } = req.body || {};
    if (!fileContent || !fileName || !fileType) {
      return res.status(400).json({ success: false, error: 'fileContent, fileName et fileType sont requis' });
    }

    console.log(`🔍 Starting advanced CV parsing for ${fileName}...`);

    // Decode base64 content
    let text = '';
    try {
      const buf = Buffer.from(fileContent, 'base64');
      const asText = buf.toString('utf8');
      const printable = asText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      text = printable;
    } catch (e) {
      console.warn('Failed to decode base64 content, using fallback');
      text = fileContent; // Assume it's already text
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Impossible d\'extraire le texte du document. Veuillez vérifier le format du fichier.' 
      });
    }

    // Use advanced NLP service for comprehensive analysis
    const analysis = await nlpService.analyzeCV(text, fileName);

    // Format response for frontend compatibility
    const response = {
      success: true,
      data: {
        personal: analysis.personalInfo,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        languages: [], // Will be populated by NLP service
        sections: analysis.sections,
        semantic: analysis.semantic,
        qualityScores: analysis.qualityScores,
        recommendations: analysis.recommendations
      },
      metadata: {
        fileName,
        fileType,
        processedAt: analysis.metadata.processedAt,
        confidence: analysis.personalInfo.confidence,
        textLength: analysis.metadata.textLength,
        wordCount: analysis.metadata.wordCount,
        nlpVersion: '2.0'
      }
    };

    console.log(`✅ Advanced CV parsing completed for ${fileName}`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Advanced CV parsing error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'analyse avancée du CV' 
    });
  }
}

// POST /api/ats/cv/optimize
async function optimizeCV(req, res) {
  try {
    const { content, target_position, target_industry } = req.body || {};
    if (!content) return res.status(400).json({ success: false, error: 'content requis' });

    const industryKeywords = {
      'technology': ['développement', 'programmation', 'technologie', 'informatique', 'software', 'digital'],
      'healthcare': ['santé', 'médical', 'soins', 'patient', 'clinique', 'hôpital'],
      'finance': ['finance', 'comptabilité', 'budget', 'analyse', 'investissement', 'banque'],
      'education': ['enseignement', 'éducation', 'formation', 'pédagogie', 'apprentissage'],
      'marketing': ['marketing', 'communication', 'publicité', 'stratégie', 'campagne', 'média']
    };
    const positionKeywords = {
      'developer': ['développeur', 'programmeur', 'code', 'logiciel', 'application', 'web'],
      'manager': ['gestion', 'management', 'équipe', 'projet', 'leadership', 'stratégie'],
      'analyst': ['analyse', 'données', 'rapport', 'recherche', 'statistiques', 'évaluation'],
      'designer': ['design', 'créatif', 'conception', 'graphique', 'visuel', 'art'],
      'consultant': ['conseil', 'consultation', 'expertise', 'stratégie', 'optimisation']
    };

    const relevantKeywords = [
      ...(target_industry ? (industryKeywords[String(target_industry).toLowerCase()] || []) : []),
      ...(target_position ? (positionKeywords[String(target_position).toLowerCase()] || []) : [])
    ];

    const lower = content.toLowerCase();
    const foundKeywords = relevantKeywords.filter(k => lower.includes(k.toLowerCase()));
    const missingKeywords = relevantKeywords.filter(k => !lower.includes(k.toLowerCase()));

    const keywordScore = relevantKeywords.length > 0 ? (foundKeywords.length / relevantKeywords.length) * 40 : 20;
    const readabilityScore = calculateReadability(content) * 30;
    const structureScore = calculateStructureScore(content) * 30;
    const atsScore = Math.min(100, Math.round(keywordScore + readabilityScore + structureScore));

    return res.status(200).json({
      success: true,
      atsScore,
      foundKeywords,
      missingKeywords,
      suggestions: missingKeywords.map(k => `Ajoutez le mot-clé « ${k} » si pertinent.`),
      tips: [
        'Utilisez des verbes d’action et des résultats mesurables.',
        'Structurez votre CV avec des sections claires (Expérience, Formation, Compétences).',
        'Adaptez votre CV à chaque offre (mots-clés spécifiques).'
      ]
    });
  } catch (error) {
    console.error('ATS optimizeCV error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
  }
}

// POST /api/ats/tests/analyze
async function analyzeTestResults(req, res) {
  try {
    const { testType, results } = req.body || {};
    if (!testType || !results) return res.status(400).json({ success: false, error: 'testType et results requis' });

    const analysis = {
      personalityInsights: [],
      careerRecommendations: [],
      learningPathways: [],
      strengthWeaknessAnalysis: [],
      developmentSuggestions: [],
      confidenceScore: results.confidenceScore || 75
    };

    switch (String(testType)) {
      case 'RIASEC':
      case 'riasec': {
        const { R = 0, I = 0, A = 0, S = 0, E = 0, C = 0 } = results;
        const scores = { R, I, A, S, E, C };
        const entries = Object.entries(scores);
        const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
        const typeMap = { R: 'Réaliste', I: 'Investigatif', A: 'Artistique', S: 'Social', E: 'Entreprenant', C: 'Conventionnel' };
        analysis.personalityInsights = [`Profil dominant: ${typeMap[dominant[0]]}`];
        analysis.careerRecommendations = ['Technologie', 'Santé', 'Éducation', 'Finance'];
        analysis.developmentSuggestions = ['Développer les compétences transversales', 'Renforcer les points faibles identifiés'];
        break;
      }
      case 'emotional': {
        analysis.personalityInsights = ['Bonne conscience de soi', 'Gestion du stress à renforcer'];
        analysis.developmentSuggestions = ['Exercices de régulation émotionnelle', 'Feedback 360°'];
        break;
      }
      case 'learning_style': {
        analysis.learningPathways = ['Cours vidéo', 'Projets pratiques', 'Mentorat'];
        break;
      }
      case 'multiple_intelligence': {
        analysis.personalityInsights = ['Forces multiples détectées'];
        break;
      }
      case 'career_transition': {
        analysis.careerRecommendations = ['Conseil', 'Gestion de projet', 'Formation'];
        break;
      }
      case 'retirement_readiness':
      case 'senior_employment':
      case 'no_diploma_career': {
        analysis.careerRecommendations = ['Services', 'Vente', 'Support technique'];
        analysis.developmentSuggestions = ['Formations courtes certifiantes'];
        break;
      }
      default:
        return res.status(400).json({ success: false, error: `Unsupported test type: ${testType}` });
    }

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('ATS analyzeTestResults error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
  }
}

// POST /api/ats/matching/analyze - Nouveau endpoint pour le matching intelligent
async function analyzeMatching(req, res) {
  try {
    const { cvData, jobData } = req.body || {};
    
    if (!cvData || !jobData) {
      return res.status(400).json({ 
        success: false, 
        error: 'cvData et jobData sont requis pour l\'analyse de matching' 
      });
    }

    console.log(`🔍 Starting intelligent matching analysis...`);

    // Utiliser le service de matching intelligent
    const matchingAnalysis = await matchingService.matchCandidateToJob(cvData, jobData);

    console.log(`✅ Matching analysis completed - Score: ${matchingAnalysis.matching.overallScore}%`);
    
    return res.status(200).json({
      success: true,
      data: matchingAnalysis,
      metadata: {
        processedAt: new Date().toISOString(),
        algorithmVersion: '2.0'
      }
    });

  } catch (error) {
    console.error('❌ Matching analysis error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'analyse de matching' 
    });
  }
}

// POST /api/ats/scoring/compute - Nouveau endpoint scoring avancé
async function computeAdvancedScoring(req, res) {
  try {
    const { cvData, jobData } = req.body || {};

    if (!cvData || !jobData) {
      return res.status(400).json({
        success: false,
        error: "cvData et jobData sont requis pour le scoring"
      });
    }

    console.log('🧮 Computing advanced multi-criteria scoring...');

    const scoring = await scoringService.computeScore(cvData, jobData);

    return res.status(200).json({
      success: true,
      data: scoring,
      metadata: {
        processedAt: new Date().toISOString(),
        version: '2.0'
      }
    });

  } catch (error) {
    console.error('❌ Advanced scoring error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || "Erreur lors du scoring avancé"
    });
  }
}

// POST /api/ats/notify/send - Envoi d'un email générique
async function sendNotification(req, res) {
  try {
    const { to, subject, html, text, from } = req.body || {};
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ success: false, error: 'to, subject et html|text requis' });
    }

    const result = await notificationService.sendEmail({ to, subject, html, text, from });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Notification send error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erreur envoi email' });
  }
}

// POST /api/ats/notify/candidate-status - Notification statut candidat
async function notifyCandidateStatus(req, res) {
  try {
    const { to, candidateName, status, jobTitle } = req.body || {};
    if (!to || !candidateName || !status || !jobTitle) {
      return res.status(400).json({ success: false, error: 'to, candidateName, status, jobTitle requis' });
    }

    const subject = `Mise à jour de votre candidature – ${jobTitle}`;
    const html = `<p>Bonjour ${candidateName},</p>
      <p>Votre candidature pour le poste <strong>${jobTitle}</strong> est maintenant au statut : <strong>${status}</strong>.</p>
      <p>Nous vous tiendrons informé des prochaines étapes.</p>
      <p>Cordialement,<br/>Équipe Recrutement</p>`;

    const result = await notificationService.sendEmail({ to, subject, html });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Candidate status notify error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erreur notification statut' });
  }
}

// POST /api/ats/analytics/dashboard - Nouveau endpoint pour les analytics
async function getAnalyticsDashboard(req, res) {
  try {
    const { timeRange = '30d', filters = {} } = req.body || {};
    
    console.log('📊 Generating analytics dashboard...');

    // Générer le dashboard complet
    const dashboard = await analyticsService.generateDashboard(timeRange, filters);

    console.log('✅ Analytics dashboard generated successfully');
    
    return res.status(200).json({
      success: true,
      data: dashboard,
      metadata: {
        processedAt: new Date().toISOString(),
        version: '2.0'
      }
    });

  } catch (error) {
    console.error('❌ Analytics dashboard error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de la génération du dashboard' 
    });
  }
}

// POST /api/ats/analytics/predict - Nouveau endpoint pour les prédictions
async function predictCandidateSuccess(req, res) {
  try {
    const { cvData, jobData, historicalData = {} } = req.body || {};
    
    if (!cvData || !jobData) {
      return res.status(400).json({ 
        success: false, 
        error: 'cvData et jobData sont requis pour la prédiction' 
      });
    }

    console.log('🔮 Predicting candidate success...');

    // Prédiction de succès du candidat
    const prediction = await analyticsService.predictCandidateSuccess(cvData, jobData, historicalData);

    console.log(`✅ Success prediction completed: ${prediction.successProbability}%`);
    
    return res.status(200).json({
      success: true,
      data: prediction,
      metadata: {
        processedAt: new Date().toISOString(),
        modelVersion: '2.0'
      }
    });

  } catch (error) {
    console.error('❌ Prediction error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de la prédiction' 
    });
  }
}

// POST /api/ats/analytics/sources - Nouveau endpoint pour l'analyse des sources
async function analyzeSourceEffectiveness(req, res) {
  try {
    const { timeRange = '30d' } = req.body || {};
    
    console.log('📈 Analyzing source effectiveness...');

    // Analyse de l'efficacité des sources
    const analysis = await analyticsService.analyzeSourceEffectiveness(timeRange);

    console.log('✅ Source effectiveness analysis completed');
    
    return res.status(200).json({
      success: true,
      data: analysis,
      metadata: {
        processedAt: new Date().toISOString(),
        timeRange
      }
    });

  } catch (error) {
    console.error('❌ Source analysis error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'analyse des sources' 
    });
  }
}

// POST /api/ats/tests/execute - Nouveau endpoint pour les tests industriels
async function executeIndustrialTest(req, res) {
  try {
    const { testType, responses, userProfile = {} } = req.body || {};
    
    if (!testType || !responses) {
      return res.status(400).json({
        success: false,
        error: 'testType et responses sont requis'
      });
    }

    console.log(`🧪 Executing industrial test: ${testType}`);

    const result = await testEngine.executeTest(testType, responses, userProfile);

    console.log(`✅ Industrial test completed - Score: ${result.globalScore.overall}%`);
    
    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        processedAt: new Date().toISOString(),
        version: '2.0'
      }
    });

  } catch (error) {
    console.error('❌ Industrial test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'exécution du test'
    });
  }
}

// GET /api/ats/tests/available - Liste des tests disponibles
async function getAvailableTests(req, res) {
  try {
    const tests = testEngine.availableTests;
    
    return res.status(200).json({
      success: true,
      data: tests,
      metadata: {
        processedAt: new Date().toISOString(),
        count: Object.keys(tests).length
      }
    });

  } catch (error) {
    console.error('❌ Get available tests error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des tests'
    });
  }
}

module.exports = {
  parseCV,
  optimizeCV,
  analyzeTestResults,
  analyzeMatching,
  getAnalyticsDashboard,
  predictCandidateSuccess,
  analyzeSourceEffectiveness,
  computeAdvancedScoring,
  sendNotification,
  notifyCandidateStatus,
  executeIndustrialTest,
  getAvailableTests
};


