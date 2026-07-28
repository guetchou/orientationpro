'use strict';

const { detectSkills } = require('./skills-detector');
const { normalizeText } = require('./normalizer');

// Analyse ciblée : uniquement si une description d'offre est fournie.
const matchJob = (cvNormalized, cvSkills, target) => {
  if (!target || !target.jobDescription || String(target.jobDescription).trim() === '') {
    return null;
  }
  const jobNorm = normalizeText(target.jobDescription);
  const jobSkills = detectSkills(jobNorm);
  const cvSet = new Set(cvSkills.map((s) => s.canonical));

  const required = (Array.isArray(target.requiredSkills) ? target.requiredSkills : [])
    .map((s) => String(s).trim()).filter(Boolean);

  const present = jobSkills.filter((s) => cvSet.has(s.canonical)).map((s) => s.canonical);
  const missing = jobSkills.filter((s) => !cvSet.has(s.canonical)).map((s) => s.canonical);

  // Mots-clés contextualisés (offre) présents dans le CV.
  const jobKeywords = Array.from(new Set(jobNorm.words.filter((w) => w.length >= 4)));
  const cvWordSet = new Set(cvNormalized.words);
  const keywordOverlap = jobKeywords.length === 0
    ? 0
    : jobKeywords.filter((w) => cvWordSet.has(w)).length / jobKeywords.length;

  const skillCoverage = jobSkills.length === 0 ? null : present.length / jobSkills.length;

  // targetRelevance 0-100 : couverture compétences (60%) + recouvrement mots-clés (40%).
  const relevance = Math.round(((skillCoverage == null ? keywordOverlap : skillCoverage) * 0.6 + keywordOverlap * 0.4) * 100);

  return {
    targetRelevance: Math.max(0, Math.min(100, relevance)),
    jobTitle: target.jobTitle ? String(target.jobTitle).trim() : null,
    presentSkills: present,
    missingSkills: missing,
    requiredSkills: required,
    keywordOverlapPercent: Math.round(keywordOverlap * 100),
  };
};

module.exports = { matchJob };
