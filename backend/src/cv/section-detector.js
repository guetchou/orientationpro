'use strict';

const { stripDiacritics } = require('./normalizer');

// En-têtes de section reconnus (fr/en), sans accent pour la comparaison.
const SECTION_KEYS = [
  { key: 'contact', labels: ['contact', 'coordonnees', 'informations personnelles'] },
  { key: 'summary', labels: ['profil', 'resume', 'summary', 'a propos', 'objectif'] },
  { key: 'experience', labels: ['experience', 'experiences professionnelles', 'parcours professionnel', 'work experience', 'emploi'] },
  { key: 'education', labels: ['formation', 'formations', 'education', 'diplomes', 'etudes', 'parcours academique'] },
  { key: 'skills', labels: ['competences', 'skills', 'aptitudes', 'savoir-faire'] },
  { key: 'languages', labels: ['langues', 'languages', 'langue'] },
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
// Numéros au format local possible (Congo +242) ou international.
const PHONE_RE = /(?:\+?\d[\d ().-]{6,}\d)/;

const detectSections = (normalized) => {
  const found = new Map();
  normalized.lines.forEach((line, index) => {
    const compact = stripDiacritics(line.toLowerCase()).replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
    for (const section of SECTION_KEYS) {
      if (found.has(section.key)) continue;
      const isHeading = line.length <= 40;
      if (isHeading && section.labels.some((label) => compact === label || compact.startsWith(label + ' ') || compact === label.replace(/s$/, ''))) {
        found.set(section.key, index);
      }
    }
  });

  const hasEmail = EMAIL_RE.test(normalized.text);
  const hasPhone = PHONE_RE.test(normalized.text);
  if (!found.has('contact') && (hasEmail || hasPhone)) {
    found.set('contact', 0);
  }

  return {
    sections: SECTION_KEYS.map((section) => ({
      key: section.key,
      present: found.has(section.key),
      lineIndex: found.has(section.key) ? found.get(section.key) : null,
    })),
    contact: { hasEmail, hasPhone },
  };
};

module.exports = { detectSections, EMAIL_RE, PHONE_RE };
