'use strict';

const { ACTION_VERBS } = require('./skills-taxonomy');
const { stripDiacritics } = require('./normalizer');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const QUANTIFIED_RE = /(\b\d{1,3}(?:[ .,]\d{3})*(?:[.,]\d+)?\s?(?:%|fcfa|clients?|projets?|personnes?|mois|ans?|k|m)\b)/i;
const DATE_RE = /\b(19|20)\d{2}\b/g;

// Score deterministe 0-100 en 4 composantes. Le total est exactement la somme
// des composantes ; aucun point de depart n'est attribue sans signal detecte.
const computeScores = ({ normalized, sectionInfo, skills }) => {
  const sections = new Map(sectionInfo.sections.map((s) => [s.key, s.present]));
  const lowered = normalized.lowered;

  const structureBreakdown = [
    { key: 'contact', points: 8, ok: !!sections.get('contact') },
    { key: 'experience', points: 8, ok: !!sections.get('experience') },
    { key: 'education', points: 6, ok: !!sections.get('education') },
    { key: 'skills', points: 5, ok: !!sections.get('skills') },
    { key: 'identity', points: 3, ok: normalized.lines.length > 0 && normalized.lines[0].trim().length > 0 },
  ];
  const structure = structureBreakdown.reduce((s, i) => s + (i.ok ? i.points : 0), 0);

  const uniqueYears = Array.from(new Set((normalized.text.match(DATE_RE) || []).map(Number)));
  const datesOrdered = uniqueYears.length >= 2;
  const enoughText = normalized.wordCount >= 120;
  const density = normalized.wordCount >= 120 && normalized.wordCount <= 1200;
  const contentBreakdown = [
    { key: 'usable_text', points: 8, ok: enoughText },
    { key: 'dates', points: 6, ok: datesOrdered },
    { key: 'experience_present', points: 5, ok: !!sections.get('experience') },
    { key: 'titles', points: 3, ok: !!sections.get('experience') || !!sections.get('education') },
    { key: 'density', points: 3, ok: density },
  ];
  const contentClarity = contentBreakdown.reduce((s, i) => s + (i.ok ? i.points : 0), 0);

  const verbHits = ACTION_VERBS.filter((verb) => lowered.includes(stripDiacritics(verb))).length;
  const quantified = QUANTIFIED_RE.test(normalized.text);
  const uniqueRatio = normalized.words.length === 0 ? 0 : new Set(normalized.words).size / normalized.words.length;
  const impactBreakdown = [
    { key: 'action_verbs', points: clamp(verbHits * 2, 0, 10), ok: verbHits > 0 },
    { key: 'quantified', points: 8, ok: quantified },
    { key: 'responsibilities', points: 4, ok: verbHits >= 3 },
    { key: 'no_repetition', points: 3, ok: uniqueRatio >= 0.4 },
  ];
  const impact = impactBreakdown.reduce((s, i) => s + (i.ok ? i.points : 0), 0);

  const technicalBreakdown = [
    { key: 'text_extracted', points: clamp(Math.round(normalized.printableRatio * 8), 0, 8), ok: normalized.charCount > 0 },
    { key: 'contact_detectable', points: 6, ok: sectionInfo.contact.hasEmail || sectionInfo.contact.hasPhone },
    { key: 'section_titles', points: 3, ok: sectionInfo.sections.filter((s) => s.present).length >= 2 },
    { key: 'no_blocking', points: 3, ok: normalized.printableRatio >= 0.85 },
  ];
  const technicalUsability = technicalBreakdown.reduce((s, i) => s + (i.ok ? i.points : 0), 0);

  const generalReadiness = clamp(structure + contentClarity + impact + technicalUsability, 0, 100);

  return {
    scores: { generalReadiness, structure, contentClarity, impact, technicalUsability },
    signals: { verbHits, quantified, datesOrdered, enoughText, uniqueRatio: Number(uniqueRatio.toFixed(3)), skillsCount: skills.length },
    breakdown: { structure: structureBreakdown, contentClarity: contentBreakdown, impact: impactBreakdown, technicalUsability: technicalBreakdown },
  };
};

module.exports = { computeScores };
