'use strict';

const { DOMAINS } = require('./skills-taxonomy');
const { stripDiacritics } = require('./normalizer');

const boundary = (alias) => {
  const escaped = stripDiacritics(alias.toLowerCase()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
};

// Pré-compilation déterministe des motifs.
const COMPILED = DOMAINS.flatMap((entry) =>
  entry.skills.map((skill) => ({
    domain: entry.domain,
    canonical: skill.canonical,
    patterns: skill.aliases.map((alias) => boundary(alias)),
  })),
);

const detectSkills = (normalized) => {
  const haystack = normalized.lowered;
  const detected = [];
  for (const skill of COMPILED) {
    if (skill.patterns.some((pattern) => pattern.test(haystack))) {
      detected.push({ canonical: skill.canonical, domain: skill.domain });
    }
  }
  // ordre stable : par domaine puis canonical
  detected.sort((a, b) => (a.domain === b.domain ? a.canonical.localeCompare(b.canonical) : a.domain.localeCompare(b.domain)));
  return detected;
};

module.exports = { detectSkills };
