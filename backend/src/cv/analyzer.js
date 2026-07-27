'use strict';

const { normalizeText } = require('./normalizer');
const { detectSections } = require('./section-detector');
const { detectSkills } = require('./skills-detector');
const { matchJob } = require('./job-matcher');
const { computeScores } = require('./scoring');
const { buildRecommendations } = require('./recommendations');
const { CvInputError } = require('./errors');

const ALGORITHM_VERSION = 'makoki-cv-rules-v1';

const MAX_RAW_LENGTH = 200000;
const MIN_WORDS = 40;
const MIN_PRINTABLE_RATIO = 0.6;

const LIMITATIONS = [
  "Analyse heuristique et explicable de la structure, de la lisibilite et de l'adequation d'un CV avec une offre.",
  "Les systemes de recrutement different selon les employeurs ; le resultat est une aide a l'amelioration, pas une garantie de selection.",
  "Aucune reconnaissance OCR, aucune probabilite d'entretien, aucune decision de recrutement.",
];

// Detection de langue : fr, en ou und. Ne jamais choisir fr uniquement parce
// que l'anglais n'est pas reconnu.
const detectLanguage = (lowered) => {
  const fr = (lowered.match(/(?:^|[^a-z])(le|la|les|des|une|dans|pour|avec|est|et|du|au|aux)(?=$|[^a-z])/g) || []).length;
  const en = (lowered.match(/(?:^|[^a-z])(the|and|of|to|in|for|with|is|an|on|at)(?=$|[^a-z])/g) || []).length;
  if (fr >= 3 && fr >= en) return 'fr';
  if (en >= 3 && en > fr) return 'en';
  return 'und';
};

const analyzeCv = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new CvInputError('CV_INPUT_REQUIRED');
  }
  const { text, jobTitle, jobDescription, requiredSkills, fileName, mimeType, fileSize } = input;

  if (typeof text !== 'string') throw new CvInputError('CV_TEXT_INVALID_TYPE', { field: 'text' });
  if (text.length > MAX_RAW_LENGTH) throw new CvInputError('CV_TEXT_TOO_LARGE', { limit: MAX_RAW_LENGTH });
  if (jobTitle != null && typeof jobTitle !== 'string') throw new CvInputError('CV_TEXT_INVALID_TYPE', { field: 'jobTitle' });
  if (jobDescription != null && typeof jobDescription !== 'string') throw new CvInputError('CV_TEXT_INVALID_TYPE', { field: 'jobDescription' });

  const normalized = normalizeText(text);
  if (normalized.charCount === 0) throw new CvInputError('CV_TEXT_EMPTY');
  if (normalized.printableRatio < MIN_PRINTABLE_RATIO) throw new CvInputError('CV_TEXT_UNREADABLE', { printableRatio: normalized.printableRatio });
  if (normalized.wordCount < MIN_WORDS) throw new CvInputError('CV_TEXT_TOO_SHORT', { minWords: MIN_WORDS });

  const detectedLanguage = detectLanguage(normalized.lowered);
  const sectionInfo = detectSections(normalized);
  const skills = detectSkills(normalized);
  const targetMatch = matchJob(normalized, skills, { jobTitle, jobDescription, requiredSkills });
  const scoreResult = computeScores({ normalized, sectionInfo, skills });
  const { issues, strengths } = buildRecommendations({ sectionInfo, scoreResult, skills, targetMatch });

  const present = (key) => sectionInfo.sections.find((s) => s.key === key)?.present || false;

  return {
    status: 'completed',
    document: {
      fileName: fileName ? String(fileName) : null,
      mimeType: mimeType ? String(mimeType) : null,
      fileSize: Number.isFinite(fileSize) ? fileSize : null,
      pageCount: null,
      detectedLanguage,
      textLength: normalized.charCount,
      wordCount: normalized.wordCount,
    },
    scores: {
      generalReadiness: scoreResult.scores.generalReadiness,
      structure: scoreResult.scores.structure,
      contentClarity: scoreResult.scores.contentClarity,
      impact: scoreResult.scores.impact,
      technicalUsability: scoreResult.scores.technicalUsability,
      targetRelevance: targetMatch ? targetMatch.targetRelevance : null,
    },
    contactPresence: sectionInfo.contact,
    experienceSignals: {
      present: present('experience'),
      actionVerbs: scoreResult.signals.verbHits,
      quantified: scoreResult.signals.quantified,
    },
    educationSignals: { present: present('education') },
    sections: sectionInfo.sections,
    skills,
    strengths,
    issues,
    recommendations: issues.map((i) => ({ code: i.code, recommendation: i.recommendation, severity: i.severity })),
    targetMatch,
    scoreBreakdown: scoreResult.breakdown,
    methodology: { version: ALGORITHM_VERSION, type: 'deterministic_rules', limitations: LIMITATIONS },
  };
};

module.exports = { analyzeCv, ALGORITHM_VERSION, LIMITATIONS, MAX_RAW_LENGTH, MIN_WORDS, MIN_PRINTABLE_RATIO, detectLanguage };
