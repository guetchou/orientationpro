'use strict';

const { normalizeText } = require('./normalizer');
const { detectSections } = require('./section-detector');
const { detectSkills } = require('./skills-detector');
const { matchJob } = require('./job-matcher');
const { computeScores } = require('./scoring');
const { buildRecommendations } = require('./recommendations');

const ALGORITHM_VERSION = 'makoki-cv-rules-v1';

const LIMITATIONS = [
  'Analyse heuristique et explicable de la structure, de la lisibilité et de l’adéquation d’un CV avec une offre.',
  'Les systèmes de recrutement diffèrent selon les employeurs ; le résultat est une aide à l’amélioration, pas une garantie de sélection.',
  'Aucune reconnaissance OCR, aucune probabilité d’entretien, aucune décision de recrutement.',
];

// Analyse déterministe pure : (texte + offre facultative) -> analyse structurée.
// Aucune I/O, aucun Math.random, aucune date intégrée au calcul.
const analyzeCv = ({ text, jobTitle, jobDescription, requiredSkills, detectedLanguage } = {}) => {
  const normalized = normalizeText(text);
  const sectionInfo = detectSections(normalized);
  const skills = detectSkills(normalized);
  const targetMatch = matchJob(normalized, skills, { jobTitle, jobDescription, requiredSkills });
  const scoreResult = computeScores({ normalized, sectionInfo, skills });
  const { issues, strengths } = buildRecommendations({ sectionInfo, scoreResult, skills, targetMatch });

  return {
    status: 'completed',
    detectedLanguage: detectedLanguage || (/(\bthe\b|\band\b|\bwith\b)/.test(normalized.lowered) && !/(\ble\b|\bla\b|\bles\b|\bet\b)/.test(normalized.lowered) ? 'en' : 'fr'),
    scores: {
      generalReadiness: scoreResult.scores.generalReadiness,
      structure: scoreResult.scores.structure,
      contentClarity: scoreResult.scores.contentClarity,
      impact: scoreResult.scores.impact,
      targetRelevance: targetMatch ? targetMatch.targetRelevance : null,
    },
    sections: sectionInfo.sections,
    skills,
    strengths,
    issues,
    recommendations: issues.map((i) => ({ code: i.code, recommendation: i.recommendation, severity: i.severity })),
    targetMatch,
    scoreBreakdown: scoreResult.breakdown,
    methodology: {
      version: ALGORITHM_VERSION,
      type: 'deterministic_rules',
      limitations: LIMITATIONS,
    },
  };
};

module.exports = { analyzeCv, ALGORITHM_VERSION, LIMITATIONS };
