const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const mysql = require('mysql2/promise');
const { pool } = require('../config/database');
const PDFDocument = require('pdfkit');
const {
  CvAccessError,
  getAuthenticatedUserId,
  isPrivilegedCvRole,
  parsePositiveInteger,
  resolveCvAccessScope,
} = require('../security/cv-access');

const CV_HISTORY_COLUMNS = [
  'id', 'user_id', 'candidate_id', 'file_name', 'file_size', 'mime_type',
  'document_type', 'detected_language', 'detected_sections', 'ats_score',
  'completeness_score', 'relevance_score', 'presentation_score', 'feedback',
  'strengths', 'weaknesses', 'recommendations', 'processing_status',
  'processing_time_ms', 'upload_date', 'analyzed_at', 'updated_at',
].join(', ');

const CV_ANALYSIS_COLUMNS = [
  CV_HISTORY_COLUMNS, 'extracted_text', 'contact_info', 'personal_info',
  'education', 'experience', 'skills', 'keywords', 'sentiment_score',
  'readability_score', 'job_matches', 'match_percentage', 'ai_model_version',
].join(', ');

// =====================================================
// SYSTÈME D'ANALYSE INTELLIGENT ATS v2.0
// =====================================================

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

// Détection du type de document
function detectDocumentType(text, fileName) {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('cv') || lowerFileName.includes('resume') || 
      lowerText.includes('curriculum vitae') || lowerText.includes('résumé')) {
    return 'cv';
  }
  if (lowerFileName.includes('cover') || lowerFileName.includes('lettre') ||
      lowerText.includes('lettre de motivation') || lowerText.includes('cover letter')) {
    return 'cover_letter';
  }
  if (lowerFileName.includes('portfolio') || lowerText.includes('portfolio')) {
    return 'portfolio';
  }
  return 'cv'; // Par défaut
}

// Détection de la langue
function detectLanguage(text) {
  const frenchWords = ['et', 'le', 'de', 'à', 'un', 'être', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'celui', 'faire', 'sur', 'autre', 'même', 'bien', 'où', 'sans', 'pouvoir', 'encore', 'aussi', 'comme', 'premier', 'temps', 'personne', 'année', 'monde', 'jour', 'monsieur', 'demander', 'alors', 'français', 'travail', 'famille', 'pays', 'suivre', 'connaître', 'depuis', 'eau', 'partir', 'dire', 'contre', 'tenir', 'regarder', 'venir', 'donner', 'prendre', 'aller', 'voir', 'savoir', 'falloir', 'devoir', 'croire', 'trouver', 'rester', 'sembler', 'laisser', 'devenir', 'porter', 'parler'];
  const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'];
  
  const words = text.toLowerCase().split(/\s+/);
  let frenchCount = 0;
  let englishCount = 0;
  
  words.forEach(word => {
    if (frenchWords.includes(word)) frenchCount++;
    if (englishWords.includes(word)) englishCount++;
  });
  
  return frenchCount > englishCount ? 'fr' : 'en';
}

// Extraction des informations de contact
function extractContactInfo(text) {
  const contactInfo = {};
  
  // Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = text.match(emailRegex);
  if (emails) contactInfo.email = emails[0];
  
  // Téléphone
  const phoneRegex = /(\+?[0-9\s\-\(\)]{8,})/g;
  const phones = text.match(phoneRegex);
  if (phones) contactInfo.phone = phones.filter(p => p.replace(/\D/g, '').length >= 8)[0];
  
  // LinkedIn
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9\-]+|linkedin\.com\/pub\/[a-zA-Z0-9\-]+)/gi;
  const linkedin = text.match(linkedinRegex);
  if (linkedin) contactInfo.linkedin = linkedin[0];
  
  // GitHub
  const githubRegex = /(github\.com\/[a-zA-Z0-9\-]+)/gi;
  const github = text.match(githubRegex);
  if (github) contactInfo.github = github[0];
  
  return contactInfo;
}

// Extraction des informations personnelles
function extractPersonalInfo(text) {
  const personalInfo = {};
  
  // Nom (première ligne souvent)
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && /^[A-Za-z\s\-'àâäéèêëïîôöùûüÿç]+$/.test(firstLine)) {
      personalInfo.name = firstLine;
    }
  }
  
  // Âge
  const ageRegex = /(\d{1,2})\s*ans?/gi;
  const age = text.match(ageRegex);
  if (age) personalInfo.age = parseInt(age[0].match(/\d+/)[0]);
  
  return personalInfo;
}

// Extraction de l'expérience professionnelle
function extractExperience(text) {
  const experiences = [];
  const sections = text.split(/(?:expérience|experience|emploi|travail|professional)/gi);
  
  if (sections.length > 1) {
    const experienceSection = sections[1];
    const yearRegex = /20\d{2}/g;
    const years = experienceSection.match(yearRegex);
    
    if (years) {
      // Calculer les années d'expérience
      const uniqueYears = [...new Set(years)].map(y => parseInt(y));
      const minYear = Math.min(...uniqueYears);
      const maxYear = Math.max(...uniqueYears);
      const experienceYears = maxYear - minYear;
      
      experiences.push({
        totalYears: experienceYears,
        detectedYears: uniqueYears
      });
    }
  }
  
  return experiences;
}

// Extraction de la formation
function extractEducation(text) {
  const education = [];
  const educationKeywords = ['diplôme', 'formation', 'université', 'école', 'master', 'licence', 'bac', 'degree', 'university', 'college', 'bachelor', 'phd'];
  
  const lines = text.split('\n');
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
      const yearMatch = line.match(/20\d{2}/);
      education.push({
        text: line.trim(),
        year: yearMatch ? parseInt(yearMatch[0]) : null
      });
    }
  });
  
  return education;
}

// Extraction des compétences
function extractSkills(text) {
  const technicalSkills = [];
  const softSkills = [];
  
  // Compétences techniques communes
  const techSkillsList = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue.js', 'Node.js',
    'PHP', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'HTML', 'CSS', 'Docker',
    'Kubernetes', 'AWS', 'Azure', 'Git', 'Linux', 'Windows', 'MacOS',
    'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'InDesign', 'After Effects',
    'Excel', 'Word', 'PowerPoint', 'Tableau', 'Power BI', 'JIRA', 'Slack'
  ];
  
  // Soft skills
  const softSkillsList = [
    'communication', 'leadership', 'travail en équipe', 'créativité', 'adaptabilité',
    'gestion du temps', 'résolution de problèmes', 'esprit critique', 'autonomie',
    'empathie', 'négociation', 'présentation', 'organisation', 'initiative'
  ];
  
  const lowerText = text.toLowerCase();
  
  techSkillsList.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      technicalSkills.push(skill);
    }
  });
  
  softSkillsList.forEach(skill => {
    if (lowerText.includes(skill)) {
      softSkills.push(skill);
    }
  });
  
  return { technical: technicalSkills, soft: softSkills };
}

// Détection des sections du CV
function detectSections(text) {
  const sections = {};
  const sectionKeywords = {
    contact: ['contact', 'coordonnées', 'informations personnelles'],
    experience: ['expérience', 'experience', 'emploi', 'travail', 'professional'],
    education: ['formation', 'éducation', 'diplôme', 'études', 'education'],
    skills: ['compétences', 'skills', 'savoir-faire', 'expertise'],
    languages: ['langues', 'languages', 'idiomes'],
    certifications: ['certifications', 'certificats', 'formations']
  };
  
  const lowerText = text.toLowerCase();
  
  Object.keys(sectionKeywords).forEach(section => {
    sections[section] = sectionKeywords[section].some(keyword => 
      lowerText.includes(keyword)
    );
  });
  
  return sections;
}

// Calcul du score ATS intelligent
function calculateIntelligentATSScore(analysisData) {
  let score = 0;
  const feedback = [];
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  // Score des sections (40 points max)
  const sections = analysisData.detectedSections;
  if (sections.contact) { score += 8; strengths.push('Informations de contact présentes'); }
  else { weaknesses.push('Informations de contact manquantes'); recommendations.push('Ajoutez vos coordonnées complètes'); }
  
  if (sections.experience) { score += 10; strengths.push('Section expérience présente'); }
  else { weaknesses.push('Section expérience manquante'); recommendations.push('Détaillez votre expérience professionnelle'); }
  
  if (sections.education) { score += 8; strengths.push('Formation mentionnée'); }
  else { weaknesses.push('Formation non mentionnée'); recommendations.push('Ajoutez votre parcours éducatif'); }
  
  if (sections.skills) { score += 10; strengths.push('Compétences listées'); }
  else { weaknesses.push('Compétences non listées'); recommendations.push('Créez une section compétences'); }
  
  if (sections.languages) { score += 4; strengths.push('Langues mentionnées'); }
  else { recommendations.push('Mentionnez vos compétences linguistiques'); }
  
  // Score des compétences (30 points max)
  const skills = analysisData.skills;
  const techSkillsCount = skills.technical.length;
  const softSkillsCount = skills.soft.length;
  
  if (techSkillsCount >= 5) { score += 15; strengths.push(`${techSkillsCount} compétences techniques détectées`); }
  else if (techSkillsCount >= 3) { score += 10; }
  else if (techSkillsCount >= 1) { score += 5; }
  else { weaknesses.push('Peu de compétences techniques'); recommendations.push('Ajoutez plus de compétences techniques'); }
  
  if (softSkillsCount >= 3) { score += 15; strengths.push(`${softSkillsCount} soft skills détectées`); }
  else if (softSkillsCount >= 1) { score += 10; }
  else { weaknesses.push('Soft skills manquantes'); recommendations.push('Mentionnez vos qualités personnelles'); }
  
  // Score du contenu (20 points max)
  const textLength = analysisData.extractedText.length;
  if (textLength >= 2000) { score += 15; strengths.push('CV détaillé'); }
  else if (textLength >= 1000) { score += 10; }
  else if (textLength >= 500) { score += 5; }
  else { weaknesses.push('CV trop court'); recommendations.push('Développez davantage le contenu'); }
  
  // Score de la présentation (10 points max)
  const contactInfo = analysisData.contactInfo;
  if (contactInfo.email) score += 3;
  if (contactInfo.phone) score += 3;
  if (contactInfo.linkedin || contactInfo.github) { score += 4; strengths.push('Profils professionnels mentionnés'); }
  
  // Générer un feedback complet et détaillé SIMPLE QUI FONCTIONNE
  const detailedFeedback = `🎯 RAPPORT D'ANALYSE ATS PROFESSIONNEL
═══════════════════════════════════════
OrientationPro Congo - Système ATS Intelligent v2.0
Analyse effectuée le ${new Date().toLocaleDateString('fr-FR')}

📋 RÉSUMÉ EXÉCUTIF
━━━━━━━━━━━━━━━━━
${score >= 80 ? '✅ EXCELLENT CV (' + score + '/100)' : score >= 60 ? '⚡ BON POTENTIEL (' + score + '/100)' : score >= 40 ? '⚠️ À AMÉLIORER (' + score + '/100)' : '🚨 REFONTE NÉCESSAIRE (' + score + '/100)'}
🎯 PROBABILITÉ D'ENTRETIEN: ${score >= 80 ? '85-95%' : score >= 60 ? '60-75%' : score >= 40 ? '30-45%' : '10-25%'}

🏗️ ANALYSE STRUCTURELLE ATS
━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Score Structure: ${Math.round((Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100)}/100

📋 SECTIONS DÉTECTÉES:
• Contact: ${sections.contact ? '✅ DÉTECTÉ' : '❌ MANQUANT'}
• Expérience: ${sections.experience ? '✅ PRÉSENT' : '❌ ABSENT'}
• Formation: ${sections.education ? '✅ MENTIONNÉ' : '❌ MANQUANT'}
• Compétences: ${sections.skills ? '✅ LISTÉ' : '❌ ABSENT'}
• Langues: ${sections.languages ? '✅ INDIQUÉ' : '⚠️ RECOMMANDÉ'}

🎯 ANALYSE DES COMPÉTENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ TECHNIQUES: ${skills.technical.length} détectée(s) ${skills.technical.length >= 5 ? '(✅ EXCELLENT)' : skills.technical.length >= 3 ? '(⚡ BON)' : '(⚠️ INSUFFISANT)'}
👥 SOFT SKILLS: ${skills.soft.length} détectée(s) ${skills.soft.length >= 3 ? '(✅ EXCELLENT)' : skills.soft.length >= 1 ? '(⚡ ACCEPTABLE)' : '(❌ MANQUANT)'}

📞 COORDONNÉES
━━━━━━━━━━━━━━
📧 Email: ${contactInfo.email ? '✅ ' + contactInfo.email : '❌ NON DÉTECTÉ'}
📱 Téléphone: ${contactInfo.phone ? '✅ Présent' : '❌ NON DÉTECTÉ'}
💼 LinkedIn: ${contactInfo.linkedin ? '✅ Présent' : '⚠️ RECOMMANDÉ'}

🚀 PLAN D'ACTION PRIORITAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${!sections.contact ? '🔴 PRIORITÉ 1: Ajoutez vos coordonnées complètes\n' : ''}${!sections.experience ? '🔴 PRIORITÉ 2: Détaillez vos expériences professionnelles\n' : ''}${skills.technical.length < 3 ? '🟠 PRIORITÉ 3: Enrichissez vos compétences techniques\n' : ''}${skills.soft.length === 0 ? '🟠 PRIORITÉ 4: Mentionnez vos qualités personnelles\n' : ''}
💡 CONSEIL PERSONNALISÉ
${score >= 80 ? 'Votre CV est excellent ! Personnalisez-le pour chaque offre.' : score >= 60 ? 'Bon CV ! Appliquez 2-3 recommandations pour atteindre 80+.' : 'CV à restructurer. Suivez les priorités ci-dessus.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 SUPPORT: contact@orientationpro.cg | 🌐 orientationpro.cg
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  
  console.log('✅ Feedback généré, longueur:', detailedFeedback.length);
  
  return {
    atsScore: Math.min(score, 100),
    completenessScore: (Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100,
    relevanceScore: Math.min((techSkillsCount * 10) + (softSkillsCount * 5), 100),
    presentationScore: Math.min(score * 1.2, 100),
    feedback: detailedFeedback,
    strengths,
    weaknesses,
    recommendations
  };
}

// Génération d'un rapport ATS professionnel complet (basé sur les leaders du marché)
function generateDetailedFeedback(score, sections, skills, contactInfo, analysisData) {
  const textLength = analysisData.extractedText.length;
  const techSkillsCount = skills.technical.length;
  const softSkillsCount = skills.soft.length;
  
  let feedback = `🎯 RAPPORT D'ANALYSE ATS PROFESSIONNEL\n`;
  feedback += `═══════════════════════════════════════\n`;
  feedback += `OrientationPro Congo - Système ATS Intelligent v2.0\n`;
  feedback += `Analyse effectuée le ${new Date().toLocaleDateString('fr-FR')}\n\n`;
  
  // 1. RÉSUMÉ EXÉCUTIF
  feedback += `📋 RÉSUMÉ EXÉCUTIF\n`;
  feedback += `━━━━━━━━━━━━━━━━━\n`;
  if (score >= 80) {
    feedback += `✅ STATUT: EXCELLENT (${score}/100)\n`;
    feedback += `🎯 VERDICT: Votre CV respecte les standards ATS et devrait passer les filtres automatiques avec succès.\n`;
    feedback += `📈 PROBABILITÉ D'ENTRETIEN: 85-95%\n`;
  } else if (score >= 60) {
    feedback += `⚡ STATUT: BON POTENTIEL (${score}/100)\n`;
    feedback += `🎯 VERDICT: CV solide nécessitant quelques optimisations pour maximiser l'efficacité ATS.\n`;
    feedback += `📈 PROBABILITÉ D'ENTRETIEN: 60-75%\n`;
  } else if (score >= 40) {
    feedback += `⚠️ STATUT: NÉCESSITE AMÉLIORATIONS (${score}/100)\n`;
    feedback += `🎯 VERDICT: Lacunes importantes limitant la visibilité dans les systèmes ATS.\n`;
    feedback += `📈 PROBABILITÉ D'ENTRETIEN: 30-45%\n`;
  } else {
    feedback += `🚨 STATUT: REFONTE CRITIQUE (${score}/100)\n`;
    feedback += `🎯 VERDICT: CV nécessitant une restructuration majeure pour être ATS-compatible.\n`;
    feedback += `📈 PROBABILITÉ D'ENTRETIEN: 10-25%\n`;
  }
  feedback += `\n`;
  
  // 2. ANALYSE STRUCTURELLE ATS
  feedback += `🏗️ ANALYSE STRUCTURELLE ATS\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  const structureScore = Math.round((Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100);
  feedback += `📊 Score Structure: ${structureScore}/100\n\n`;
  
  feedback += `📋 SECTIONS DÉTECTÉES:\n`;
  feedback += `┌─────────────────┬────────┬─────────────────────────────────┐\n`;
  feedback += `│ Section         │ Status │ Impact ATS                      │\n`;
  feedback += `├─────────────────┼────────┼─────────────────────────────────┤\n`;
  feedback += `│ Contact         │ ${sections.contact ? '✅ OUI' : '❌ NON'} │ ${sections.contact ? 'Identifié par ATS' : 'ATS ne trouve pas vos coordonnées'} │\n`;
  feedback += `│ Expérience      │ ${sections.experience ? '✅ OUI' : '❌ NON'} │ ${sections.experience ? 'Historique professionnel détecté' : 'Aucun parcours identifié'} │\n`;
  feedback += `│ Formation       │ ${sections.education ? '✅ OUI' : '❌ NON'} │ ${sections.education ? 'Qualification académique reconnue' : 'Niveau éducation manquant'} │\n`;
  feedback += `│ Compétences     │ ${sections.skills ? '✅ OUI' : '❌ NON'} │ ${sections.skills ? 'Skills matching activé' : 'Aucune compétence détectable'} │\n`;
  feedback += `│ Langues         │ ${sections.languages ? '✅ OUI' : '⚠️ OPT'} │ ${sections.languages ? 'Multilinguisme reconnu' : 'Bonus international manqué'} │\n`;
  feedback += `│ Certifications  │ ${sections.certifications ? '✅ OUI' : '⚠️ OPT'} │ ${sections.certifications ? 'Expertise certifiée validée' : 'Avantage concurrentiel absent'} │\n`;
  feedback += `└─────────────────┴────────┴─────────────────────────────────┘\n\n`;
  
  // 3. ANALYSE DES COMPÉTENCES AVANCÉE
  feedback += `🎯 ANALYSE DES COMPÉTENCES AVANCÉE\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  const skillsScore = Math.min((techSkillsCount * 10) + (softSkillsCount * 5), 100);
  feedback += `📊 Score Compétences: ${skillsScore}/100\n\n`;
  
  // Compétences techniques
  feedback += `⚙️ COMPÉTENCES TECHNIQUES: ${techSkillsCount} détectée(s)\n`;
  if (techSkillsCount >= 5) {
    feedback += `┗━ ✅ EXCELLENT: Portfolio technique diversifié\n`;
    feedback += `┗━ 📈 Impact ATS: Matching optimal avec offres d'emploi\n`;
  } else if (techSkillsCount >= 3) {
    feedback += `┗━ ⚡ BON: Base solide, enrichissement recommandé\n`;
    feedback += `┗━ 📈 Impact ATS: Matching partiel, ajoutez 2-3 compétences\n`;
  } else if (techSkillsCount >= 1) {
    feedback += `┗━ ⚠️ INSUFFISANT: Portfolio technique limité\n`;
    feedback += `┗━ 📈 Impact ATS: Risque de filtrage automatique\n`;
  } else {
    feedback += `┗━ ❌ CRITIQUE: Aucune compétence technique détectée\n`;
    feedback += `┗━ 📈 Impact ATS: Rejet automatique probable\n`;
  }
  
  if (techSkillsCount > 0) {
    feedback += `┗━ 🔧 Compétences identifiées: ${skills.technical.slice(0, 8).join(', ')}${skills.technical.length > 8 ? '...' : ''}\n`;
  }
  feedback += `\n`;
  
  // Soft skills
  feedback += `👥 SOFT SKILLS: ${softSkillsCount} détectée(s)\n`;
  if (softSkillsCount >= 3) {
    feedback += `┗━ ✅ EXCELLENT: Profil humain bien défini\n`;
    feedback += `┗━ 📈 Impact Recruteur: Leadership et collaboration valorisés\n`;
  } else if (softSkillsCount >= 1) {
    feedback += `┗━ ⚡ ACCEPTABLE: Base présente, développement souhaitable\n`;
    feedback += `┗━ 📈 Impact Recruteur: Ajoutez leadership, communication, adaptabilité\n`;
  } else {
    feedback += `┗━ ❌ MANQUANT: Aucune qualité personnelle identifiée\n`;
    feedback += `┗━ 📈 Impact Recruteur: Profil perçu comme purement technique\n`;
  }
  
  if (softSkillsCount > 0) {
    feedback += `┗━ 🤝 Qualités identifiées: ${skills.soft.join(', ')}\n`;
  }
  feedback += `\n`;
  
  // 4. ANALYSE DE CONTENU ET LISIBILITÉ
  feedback += `📝 ANALYSE DE CONTENU ET LISIBILITÉ\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  const contentScore = textLength >= 2000 ? 100 : textLength >= 1000 ? 75 : textLength >= 500 ? 50 : 25;
  feedback += `📊 Score Contenu: ${contentScore}/100\n\n`;
  
  feedback += `📏 LONGUEUR: ${textLength} caractères\n`;
  if (textLength >= 2000) {
    feedback += `┗━ ✅ EXCELLENT: Contenu riche et informatif\n`;
    feedback += `┗━ 📈 Impact ATS: Données suffisantes pour analyse complète\n`;
  } else if (textLength >= 1000) {
    feedback += `┗━ ⚡ CONVENABLE: Base solide, développement recommandé\n`;
    feedback += `┗━ 📈 Impact ATS: Informations partielles, enrichissement souhaité\n`;
  } else if (textLength >= 500) {
    feedback += `┗━ ⚠️ COURT: Manque de détails sur les expériences\n`;
    feedback += `┗━ 📈 Impact ATS: Risque de sous-évaluation du profil\n`;
  } else {
    feedback += `┗━ ❌ CRITIQUE: CV insuffisamment développé\n`;
    feedback += `┗━ 📈 Impact ATS: Données insuffisantes pour évaluation\n`;
  }
  feedback += `\n`;
  
  // 5. VÉRIFICATION DES COORDONNÉES
  feedback += `📞 VÉRIFICATION DES COORDONNÉES\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  const contactScore = (contactInfo.email ? 25 : 0) + (contactInfo.phone ? 25 : 0) + (contactInfo.linkedin ? 25 : 0) + (contactInfo.github ? 25 : 0);
  feedback += `📊 Score Contact: ${contactScore}/100\n\n`;
  
  feedback += `📧 EMAIL: ${contactInfo.email ? '✅ ' + contactInfo.email : '❌ NON DÉTECTÉ'}\n`;
  feedback += `📱 TÉLÉPHONE: ${contactInfo.phone ? '✅ ' + contactInfo.phone.trim() : '❌ NON DÉTECTÉ'}\n`;
  feedback += `💼 LINKEDIN: ${contactInfo.linkedin ? '✅ ' + contactInfo.linkedin : '⚠️ RECOMMANDÉ - Visibilité professionnelle'}\n`;
  feedback += `💻 GITHUB: ${contactInfo.github ? '✅ ' + contactInfo.github : '⚠️ UTILE - Profils techniques'}\n\n`;
  
  // 6. PLAN D'ACTION PRIORITAIRE
  feedback += `🚀 PLAN D'ACTION PRIORITAIRE\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  const recommendations = [];
  let priority = 1;
  
  // Recommandations critiques (impact élevé)
  if (!sections.contact) {
    recommendations.push(`🔴 PRIORITÉ ${priority++} - CRITIQUE: Créez une section "COORDONNÉES"\n   ┗━ Impact: +8 points ATS | Temps: 5 min | Difficulté: Facile`);
  }
  if (!sections.experience) {
    recommendations.push(`🔴 PRIORITÉ ${priority++} - CRITIQUE: Détaillez vos expériences professionnelles\n   ┗━ Impact: +10 points ATS | Temps: 30 min | Difficulté: Moyen`);
  }
  if (techSkillsCount < 3) {
    recommendations.push(`🟠 PRIORITÉ ${priority++} - IMPORTANT: Enrichissez vos compétences techniques\n   ┗━ Impact: +5-15 points ATS | Temps: 15 min | Difficulté: Facile`);
  }
  if (softSkillsCount === 0) {
    recommendations.push(`🟠 PRIORITÉ ${priority++} - IMPORTANT: Ajoutez vos soft skills\n   ┗━ Impact: +15 points ATS | Temps: 10 min | Difficulté: Facile`);
  }
  if (!sections.education) {
    recommendations.push(`🟡 PRIORITÉ ${priority++} - RECOMMANDÉ: Mentionnez votre formation\n   ┗━ Impact: +8 points ATS | Temps: 10 min | Difficulté: Facile`);
  }
  
  // Recommandations bonus
  if (!contactInfo.linkedin && priority <= 5) {
    recommendations.push(`🟡 PRIORITÉ ${priority++} - BONUS: Ajoutez votre profil LinkedIn\n   ┗━ Impact: +4 points ATS | Temps: 2 min | Difficulté: Très facile`);
  }
  if (textLength < 1000 && priority <= 5) {
    recommendations.push(`🟡 PRIORITÉ ${priority++} - DÉVELOPPEMENT: Enrichissez le contenu\n   ┗━ Impact: +5-15 points ATS | Temps: 20 min | Difficulté: Moyen`);
  }
  
  if (recommendations.length > 0) {
    feedback += recommendations.slice(0, 5).join('\n\n') + '\n\n';
  } else {
    feedback += `✅ FÉLICITATIONS: Votre CV respecte toutes les recommandations ATS !\n\n`;
  }
  
  // 7. STRATÉGIE PERSONNALISÉE
  feedback += `💡 STRATÉGIE PERSONNALISÉE\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (score >= 80) {
    feedback += `🎯 NIVEAU EXPERT (${score}/100)\n`;
    feedback += `┗━ ✅ Votre CV est ATS-ready et compétitif\n`;
    feedback += `┗━ 🎯 Focus: Personnalisation par offre d'emploi\n`;
    feedback += `┗━ 📈 Prochaine étape: Adaptation des mots-clés par poste\n`;
    feedback += `┗━ ⏱️ Temps estimé pour optimisation: 5-10 min par candidature\n`;
  } else if (score >= 60) {
    feedback += `⚡ NIVEAU AVANCÉ (${score}/100)\n`;
    feedback += `┗━ 🎯 Objectif: Atteindre 80+ points en 2-3 améliorations\n`;
    feedback += `┗━ 📈 Potentiel d'amélioration: +${Math.min(25, 85 - score)} points\n`;
    feedback += `┗━ ⏱️ Temps estimé: 45-60 minutes de travail\n`;
    feedback += `┗━ 🚀 Résultat attendu: 2-3x plus d'entretiens\n`;
  } else if (score >= 40) {
    feedback += `⚠️ NIVEAU INTERMÉDIAIRE (${score}/100)\n`;
    feedback += `┗━ 🎯 Objectif: Restructuration ciblée pour atteindre 70+\n`;
    feedback += `┗━ 📈 Potentiel d'amélioration: +${Math.min(35, 75 - score)} points\n`;
    feedback += `┗━ ⏱️ Temps estimé: 1-2 heures de travail structuré\n`;
    feedback += `┗━ 🚀 Résultat attendu: Passage des filtres ATS\n`;
  } else {
    feedback += `🚨 NIVEAU DÉBUTANT (${score}/100)\n`;
    feedback += `┗━ 🎯 Objectif: Refonte complète pour atteindre 60+\n`;
    feedback += `┗━ 📈 Potentiel d'amélioration: +${Math.min(45, 65 - score)} points\n`;
    feedback += `┗━ ⏱️ Temps estimé: 2-3 heures de restructuration\n`;
    feedback += `┗━ 🚀 Résultat attendu: CV fonctionnel et professionnel\n`;
  }
  
  feedback += `\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  feedback += `📞 SUPPORT OrientationPro Congo: contact@orientationpro.cg\n`;
  feedback += `🌐 Plus de conseils: www.orientationpro.cg/ressources\n`;
  feedback += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  
  return feedback;
}

// Analyse sémantique avancée
function performSemanticAnalysis(text) {
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = [...new Set(words)];
  
  // Extraction des mots-clés (mots de plus de 4 lettres, fréquents)
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 4 && !/^\d+$/.test(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const keywords = Object.entries(wordFreq)
    .filter(([word, freq]) => freq >= 2)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
  
  // Score de sentiment simple (mots positifs vs négatifs)
  const positiveWords = ['excellent', 'expert', 'compétent', 'expérimenté', 'créatif', 'innovant', 'leader', 'réussi', 'performant'];
  const negativeWords = ['difficile', 'problème', 'échec', 'faible', 'insuffisant'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const sentimentScore = positiveCount > 0 || negativeCount > 0 
    ? (positiveCount - negativeCount) / (positiveCount + negativeCount)
    : 0;
  
  // Score de lisibilité (approximation basée sur la longueur des phrases)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length 
    : 15;
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgSentenceLength - 15) * 2)); // Optimal: 15 mots/phrase
  
  return {
    keywords,
    sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
    readabilityScore: Math.max(0, Math.min(100, readabilityScore))
  };
}

// POST /api/cv/upload - Version intelligente
const uploadCV = async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier reçu.' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const userId = getAuthenticatedUserId(req.user);
    const candidateId = isPrivilegedCvRole(req.user)
      ? parsePositiveInteger(req.body.candidate_id, 'candidate_id', { optional: true })
      : null;

    // Mise à jour du statut de traitement
    const [insertResult] = await pool.query(
      'INSERT INTO cv_analysis (user_id, candidate_id, file_name, file_path, file_size, mime_type, processing_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, candidateId, fileName, filePath, fileSize, mimeType, 'processing']
    );
    const analysisId = insertResult.insertId;

    try {
      // 1. Extraction du texte
      const extractedText = await extractText(filePath, mimeType);
      
      // 2. Détection du type de document
      const documentType = detectDocumentType(extractedText, fileName);
      
      // 3. Détection de la langue
      const detectedLanguage = detectLanguage(extractedText);
      
      // 4. Extraction des informations
      const contactInfo = extractContactInfo(extractedText);
      const personalInfo = extractPersonalInfo(extractedText);
      const experience = extractExperience(extractedText);
      const education = extractEducation(extractedText);
      const skills = extractSkills(extractedText);
      const detectedSections = detectSections(extractedText);
      
      // 5. Analyse sémantique
      const semanticAnalysis = performSemanticAnalysis(extractedText);
      
      // 6. Calcul des scores
      const analysisData = {
        extractedText,
        contactInfo,
        personalInfo,
        experience,
        education,
        skills,
        detectedSections
      };
      
      const scoring = calculateIntelligentATSScore(analysisData);
      console.log('🔍 SCORING RESULT:', {
        atsScore: scoring.atsScore,
        feedbackLength: scoring.feedback ? scoring.feedback.length : 'UNDEFINED',
        feedbackStart: scoring.feedback ? scoring.feedback.substring(0, 50) : 'NO FEEDBACK'
      });
      
      // 7. Mise à jour en base de données
      const processingTime = Date.now() - startTime;
      
      // Fonction pour sérialiser de manière sécurisée - VERSION AMÉLIORÉE
      const safeStringify = (obj) => {
        try {
          // Gérer les cas null, undefined, string vide
          if (obj === null || obj === undefined) {
            return '{}';
          }
          
          // Si c'est déjà une string, vérifier si c'est du JSON valide
          if (typeof obj === 'string') {
            if (obj === '' || obj === '[object Object]') {
              return '{}';
            }
            // Tenter de parser pour valider
            try {
              JSON.parse(obj);
              return obj; // C'est déjà du JSON valide
            } catch {
              return '{}'; // String invalide, retourner objet vide
            }
          }
          
          // Pour les objets, faire une copie profonde pour éviter les références circulaires
          const cleanObj = JSON.parse(JSON.stringify(obj));
          return JSON.stringify(cleanObj);
        } catch (e) {
          console.warn('⚠️ Erreur stringify pour:', typeof obj, 'Erreur:', e.message);
          return typeof obj === 'object' && Array.isArray(obj) ? '[]' : '{}';
        }
      };

      // Valider les scores numériques - VERSION AMÉLIORÉE
      const safeNumber = (num) => {
        if (num === null || num === undefined || num === '') return 0;
        const parsed = Number(num);
        return isNaN(parsed) || !isFinite(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
      };
      
      await pool.query(`
        UPDATE cv_analysis SET 
          document_type = ?, extracted_text = ?, detected_language = ?, 
          detected_sections = ?, contact_info = ?, personal_info = ?,
          education = ?, experience = ?, skills = ?, 
          ats_score = ?, completeness_score = ?, relevance_score = ?, presentation_score = ?,
          feedback = ?, strengths = ?, weaknesses = ?, recommendations = ?,
          keywords = ?, sentiment_score = ?, readability_score = ?,
          processing_status = ?, processing_time_ms = ?, analyzed_at = NOW()
        WHERE id = ?
      `, [
        documentType, extractedText, detectedLanguage,
        safeStringify(detectedSections), safeStringify(contactInfo), safeStringify(personalInfo),
        safeStringify(education), safeStringify(experience), safeStringify(skills),
        safeNumber(scoring.atsScore), safeNumber(scoring.completenessScore), safeNumber(scoring.relevanceScore), safeNumber(scoring.presentationScore),
        scoring.feedback || '', safeStringify(scoring.strengths), safeStringify(scoring.weaknesses), safeStringify(scoring.recommendations),
        safeStringify(semanticAnalysis.keywords), safeNumber(semanticAnalysis.sentimentScore), safeNumber(semanticAnalysis.readabilityScore),
        'completed', processingTime, analysisId
      ]);

      res.json({
        success: true,
        message: 'CV analysé avec succès par le système ATS intelligent.',
        analysisId,
        fileName,
        documentType,
        detectedLanguage,
        processingTime,
        scores: {
          atsScore: scoring.atsScore,
          completenessScore: Math.round(scoring.completenessScore),
          relevanceScore: Math.round(scoring.relevanceScore),
          presentationScore: Math.round(scoring.presentationScore)
        },
        analysis: {
          contactInfo,
          personalInfo,
          skillsFound: {
            technical: skills.technical,
            soft: skills.soft
          },
          sectionsDetected: detectedSections,
          strengths: scoring.strengths,
          weaknesses: scoring.weaknesses,
          recommendations: scoring.recommendations,
          completeFeedback: scoring.feedback
        },
        // AJOUT: Feedback directement accessible
        feedback: scoring.feedback,
        semantics: {
          keywords: semanticAnalysis.keywords.slice(0, 10),
          sentimentScore: Math.round(semanticAnalysis.sentimentScore * 100) / 100,
          readabilityScore: Math.round(semanticAnalysis.readabilityScore)
        }
      });

    } catch (analysisError) {
      // Erreur pendant l'analyse
      await pool.query(
        'UPDATE cv_analysis SET processing_status = ?, feedback = ? WHERE id = ?',
        ['failed', `Erreur d'analyse: ${analysisError.message}`, analysisId]
      );
      throw analysisError;
    }

  } catch (error) {
    console.error('Erreur upload CV intelligent:', error);
    res.status(error instanceof CvAccessError ? error.statusCode : 500).json({
      success: false, 
      message: 'Erreur lors de l\'analyse intelligente du CV.',
    });
  }
};

// GET /api/cv/history?user_id=123
const getCVHistory = async (req, res) => {
  try {
    const scope = resolveCvAccessScope(req.user, req.query);
    const requestedLimit = parsePositiveInteger(req.query.limit, 'limit', { optional: true });
    const limit = Math.min(requestedLimit || 50, 100);
    
    let query = `SELECT ${CV_HISTORY_COLUMNS} FROM cv_analysis WHERE 1=1`;
    let params = [];
    
    if (scope.userId) {
      query += ' AND user_id = ?';
      params.push(scope.userId);
    }
    
    if (scope.candidateId) {
      query += ' AND candidate_id = ?';
      params.push(scope.candidateId);
    }
    
    query += ' ORDER BY upload_date DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await pool.query(query, params);
    
    // Parse JSON fields avec gestion d'erreurs
    const parsedRows = rows.map(row => {
      const parseJSONSafely = (jsonString, defaultValue) => {
        // Gérer les cas null, undefined, string vide
        if (!jsonString || jsonString === '' || jsonString === 'null' || jsonString === 'undefined') {
          return defaultValue;
        }
        
        // Détecter les objets JavaScript sérialisés incorrectement
        if (jsonString === '[object Object]' || jsonString.startsWith('[object ') || jsonString === '[object Array]') {
          console.warn('🔧 Objet JS détecté au lieu de JSON:', jsonString);
          return defaultValue;
        }
        
        // Si c'est déjà un objet, le retourner directement
        if (typeof jsonString === 'object') {
          return jsonString || defaultValue;
        }
        
        try {
          const parsed = JSON.parse(jsonString);
          return parsed;
        } catch (e) {
          console.warn('⚠️ Erreur parsing JSON:', jsonString.substring(0, 100) + (jsonString.length > 100 ? '...' : ''), e.message);
          return defaultValue;
        }
      };

      return {
        ...row,
        detected_sections: parseJSONSafely(row.detected_sections, {}),
        contact_info: parseJSONSafely(row.contact_info, {}),
        personal_info: parseJSONSafely(row.personal_info, {}),
        education: parseJSONSafely(row.education, []),
        experience: parseJSONSafely(row.experience, []),
        skills: parseJSONSafely(row.skills, {}),
        strengths: parseJSONSafely(row.strengths, []),
        weaknesses: parseJSONSafely(row.weaknesses, []),
        recommendations: parseJSONSafely(row.recommendations, []),
        keywords: parseJSONSafely(row.keywords, [])
      };
    });
    
    res.json({ success: true, history: parsedRows });
  } catch (error) {
    console.error('Erreur historique CV:', error);
    res.status(error instanceof CvAccessError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof CvAccessError ? error.message : 'Erreur lors de la récupération de l\'historique.',
    });
  }
};

// GET /api/cv/analysis/:id - Récupérer une analyse spécifique
const getCVAnalysis = async (req, res) => {
  try {
    const analysisId = parsePositiveInteger(req.params.id, 'analysis id');
    const userId = getAuthenticatedUserId(req.user);
    const privileged = isPrivilegedCvRole(req.user);
    const query = privileged
      ? `SELECT ${CV_ANALYSIS_COLUMNS} FROM cv_analysis WHERE id = ?`
      : `SELECT ${CV_ANALYSIS_COLUMNS} FROM cv_analysis WHERE id = ? AND user_id = ?`;
    const params = privileged ? [analysisId] : [analysisId, userId];
    const [rows] = await pool.query(query, params);
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Analyse non trouvée.' });
    }
    
    const analysis = rows[0];
    
    // Parse JSON fields avec gestion d'erreurs
    const parseJSONSafely = (jsonString, defaultValue) => {
      // Gérer les cas null, undefined, string vide
      if (!jsonString || jsonString === '' || jsonString === 'null' || jsonString === 'undefined') {
        return defaultValue;
      }
      
      // Détecter les objets JavaScript sérialisés incorrectement
      if (jsonString === '[object Object]' || jsonString.startsWith('[object ') || jsonString === '[object Array]') {
        console.warn('🔧 Objet JS détecté au lieu de JSON:', jsonString);
        return defaultValue;
      }
      
      // Si c'est déjà un objet, le retourner directement
      if (typeof jsonString === 'object') {
        return jsonString || defaultValue;
      }
      
      try {
        const parsed = JSON.parse(jsonString);
        return parsed;
      } catch (e) {
        console.warn('⚠️ Erreur parsing JSON:', jsonString.substring(0, 100) + (jsonString.length > 100 ? '...' : ''), e.message);
        return defaultValue;
      }
    };

    const parsedAnalysis = {
      ...analysis,
      detected_sections: parseJSONSafely(analysis.detected_sections, {}),
      contact_info: parseJSONSafely(analysis.contact_info, {}),
      personal_info: parseJSONSafely(analysis.personal_info, {}),
      education: parseJSONSafely(analysis.education, []),
      experience: parseJSONSafely(analysis.experience, []),
      skills: parseJSONSafely(analysis.skills, {}),
      strengths: parseJSONSafely(analysis.strengths, []),
      weaknesses: parseJSONSafely(analysis.weaknesses, []),
      recommendations: parseJSONSafely(analysis.recommendations, []),
      keywords: parseJSONSafely(analysis.keywords, [])
    };
    
    res.json({ success: true, analysis: parsedAnalysis });
  } catch (error) {
    console.error('Erreur récupération analyse CV:', error);
    res.status(error instanceof CvAccessError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof CvAccessError ? error.message : 'Erreur lors de la récupération de l\'analyse.',
    });
  }
};

// GET /api/cv/report/:id/pdf - Version améliorée
const getCVReportPDF = async (req, res) => {
  try {
    const analysisId = parsePositiveInteger(req.params.id, 'analysis id');
    const userId = getAuthenticatedUserId(req.user);
    const privileged = isPrivilegedCvRole(req.user);
    const query = privileged
      ? `SELECT ${CV_ANALYSIS_COLUMNS} FROM cv_analysis WHERE id = ?`
      : `SELECT ${CV_ANALYSIS_COLUMNS} FROM cv_analysis WHERE id = ? AND user_id = ?`;
    const params = privileged ? [analysisId] : [analysisId, userId];
    const [rows] = await pool.query(query, params);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Rapport non trouvé.' });
    }

    const report = rows[0];
    const strengths = report.strengths ? JSON.parse(report.strengths) : [];
    const weaknesses = report.weaknesses ? JSON.parse(report.weaknesses) : [];
    const recommendations = report.recommendations ? JSON.parse(report.recommendations) : [];
    const skills = report.skills ? JSON.parse(report.skills) : {};

    // Générer le PDF amélioré
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-ats-intelligent-${report.id}.pdf`);

    const doc = new PDFDocument();
    doc.pipe(res);

    // En-tête
    doc.fontSize(24).text('Rapport d\'Analyse ATS Intelligent', { align: 'center' });
    doc.fontSize(12).text(`OrientationPro Congo - Système ATS v2.0`, { align: 'center' });
    doc.moveDown(2);

    // Informations du document
    doc.fontSize(16).text('Informations du Document', { underline: true });
    doc.fontSize(12);
    doc.text(`Fichier : ${report.file_name}`);
    doc.text(`Type : ${report.document_type || 'CV'}`);
    doc.text(`Langue détectée : ${report.detected_language || 'fr'}`);
    doc.text(`Date d'analyse : ${new Date(report.upload_date).toLocaleString('fr-FR')}`);
    doc.text(`Temps de traitement : ${report.processing_time_ms}ms`);
    doc.moveDown();

    // Scores
    doc.fontSize(16).text('Scores d\'Évaluation', { underline: true });
    doc.fontSize(12);
    doc.text(`Score ATS Global : ${report.ats_score}/100`);
    doc.text(`Score de Complétude : ${Math.round(report.completeness_score)}/100`);
    doc.text(`Score de Pertinence : ${Math.round(report.relevance_score)}/100`);
    doc.text(`Score de Présentation : ${Math.round(report.presentation_score)}/100`);
    doc.moveDown();

    // Points forts
    if (strengths.length > 0) {
      doc.fontSize(16).text('Points Forts ✓', { underline: true });
      doc.fontSize(11);
      strengths.forEach(strength => {
        doc.text(`• ${strength}`);
      });
      doc.moveDown();
    }

    // Points faibles
    if (weaknesses.length > 0) {
      doc.fontSize(16).text('Points d\'Amélioration', { underline: true });
      doc.fontSize(11);
      weaknesses.forEach(weakness => {
        doc.text(`• ${weakness}`);
      });
      doc.moveDown();
    }

    // Recommandations
    if (recommendations.length > 0) {
      doc.fontSize(16).text('Recommandations', { underline: true });
      doc.fontSize(11);
      recommendations.forEach(rec => {
        doc.text(`• ${rec}`);
      });
      doc.moveDown();
    }

    // Compétences détectées
    if (skills.technical && skills.technical.length > 0) {
      doc.fontSize(16).text('Compétences Techniques Détectées', { underline: true });
      doc.fontSize(11);
      doc.text(skills.technical.join(', '));
      doc.moveDown();
    }

    if (skills.soft && skills.soft.length > 0) {
      doc.fontSize(16).text('Soft Skills Détectées', { underline: true });
      doc.fontSize(11);
      doc.text(skills.soft.join(', '));
      doc.moveDown();
    }

    // Analyse sémantique
    if (report.keywords) {
      const keywords = JSON.parse(report.keywords);
      if (keywords.length > 0) {
        doc.fontSize(16).text('Mots-clés Principaux', { underline: true });
        doc.fontSize(11);
        doc.text(keywords.slice(0, 10).join(', '));
        doc.moveDown();
      }
    }

    doc.end();
  } catch (error) {
    console.error('Erreur PDF CV:', error);
    res.status(error instanceof CvAccessError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof CvAccessError ? error.message : 'Erreur lors de la génération du PDF.',
    });
  }
};

module.exports = { uploadCV, getCVHistory, getCVAnalysis, getCVReportPDF };
