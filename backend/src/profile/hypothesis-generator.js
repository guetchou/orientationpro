'use strict';

const crypto = require('node:crypto');

const GENERATOR_VERSION = 'profile-hypotheses-v1';
const MAX_HYPOTHESES = 8;

const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = normalize(value[key]);
    return result;
  }, {});
};

const stableStringify = (value) => JSON.stringify(normalize(value));
const sha256 = (value) => crypto.createHash('sha256').update(stableStringify(value)).digest('hex');

const semanticProfile = ({ profile, education = [], skills = [] } = {}) => ({
  profile: profile ? {
    first_name: profile.first_name || null,
    last_name: profile.last_name || null,
    city: profile.city || null,
    country_code: profile.country_code || null,
    current_situation: profile.current_situation || null,
    primary_goal: profile.primary_goal || null,
    mobility_scope: profile.mobility_scope || null,
    profile_summary: profile.profile_summary || null,
  } : null,
  education: education.map((entry) => ({
    education_level: entry.education_level,
    status: entry.status,
    diploma_name: entry.diploma_name || null,
    field_of_study: entry.field_of_study || null,
    start_year: entry.start_year || null,
    end_year: entry.end_year || null,
  })).sort((left, right) => stableStringify(left).localeCompare(stableStringify(right))),
  skills: skills.filter((skill) => skill.confirmation_status === 'confirmed').map((skill) => ({
    label: skill.label,
    esco_uri: skill.esco_uri || null,
    proficiency: skill.proficiency || 'unknown',
    source: skill.source || null,
  })).sort((left, right) => stableStringify(left).localeCompare(stableStringify(right))),
});

const makeCandidate = ({ key, type, title, question, action, rationale, confidence, evidence = [], details = {} }) => ({
  key,
  hypothesisType: type,
  value: { key, title, question, action, evidence, ...details },
  rationale,
  confidence,
});

const buildCandidates = ({ profile, education = [], skills = [] } = {}) => {
  const candidates = [];
  const confirmedSkills = skills.filter((skill) => skill.confirmation_status === 'confirmed');
  const confirmedEscoSkills = confirmedSkills.filter((skill) => Boolean(skill.esco_uri));

  if (!profile?.primary_goal || profile.primary_goal === 'other') {
    candidates.push(makeCandidate({
      key: 'goal.clarify',
      type: 'goal_clarification',
      title: 'Préciser votre objectif principal',
      question: 'Quel résultat concret attendez-vous de votre parcours d’orientation ?',
      action: 'complete_profile',
      rationale: 'Un objectif explicite permet de pondérer les recommandations sans supposer votre intention.',
      confidence: 0.99,
      evidence: [{ field: 'primary_goal', value: profile?.primary_goal || null }],
    }));
  }

  if (!profile?.mobility_scope || profile.mobility_scope === 'unknown') {
    candidates.push(makeCandidate({
      key: 'mobility.clarify',
      type: 'mobility_clarification',
      title: 'Préciser votre mobilité',
      question: 'Dans quel périmètre souhaitez-vous explorer les opportunités ?',
      action: 'complete_profile',
      rationale: 'La mobilité influence les pistes à explorer, mais ne doit jamais être déduite automatiquement.',
      confidence: 0.98,
      evidence: [{ field: 'mobility_scope', value: profile?.mobility_scope || null }],
    }));
  }

  const educationRelevantGoals = new Set(['choose_studies', 'career_change', 'improve_skills']);
  if (educationRelevantGoals.has(profile?.primary_goal) && education.length === 0) {
    candidates.push(makeCandidate({
      key: 'education.add_context',
      type: 'education_context',
      title: 'Ajouter votre parcours d’études',
      question: 'Quel est votre niveau d’études ou votre formation la plus récente ?',
      action: 'add_education',
      rationale: 'Votre objectif nécessite un repère de préparation ; aucune équivalence réglementaire ne sera déduite.',
      confidence: 0.94,
      evidence: [{ field: 'primary_goal', value: profile.primary_goal }],
    }));
  }

  if (confirmedEscoSkills.length === 0) {
    candidates.push(makeCandidate({
      key: 'skills.add_esco_evidence',
      type: 'esco_skill_evidence',
      title: 'Ajouter des compétences ESCO',
      question: 'Quelles compétences confirmées décrivent le mieux ce que vous savez déjà faire ?',
      action: 'add_esco_skills',
      rationale: 'Des compétences ESCO confirmées rendent le rapprochement avec les métiers plus explicable.',
      confidence: 0.93,
      evidence: [{ metric: 'confirmed_esco_skill_count', value: 0 }],
    }));
  }

  for (const skill of confirmedEscoSkills.filter((item) => !item.proficiency || item.proficiency === 'unknown').slice(0, 3)) {
    candidates.push(makeCandidate({
      key: `skill.proficiency:${skill.esco_uri}`,
      type: 'skill_proficiency',
      title: `Évaluer « ${skill.label} »`,
      question: `Quel est votre niveau réel pour la compétence « ${skill.label} » ?`,
      action: 'rate_skill',
      rationale: 'Le niveau de maîtrise ne doit pas être inféré à partir du seul libellé de la compétence.',
      confidence: 0.97,
      evidence: [{ esco_uri: skill.esco_uri, label: skill.label, proficiency: skill.proficiency || 'unknown' }],
      details: { escoUri: skill.esco_uri, skillLabel: skill.label },
    }));
  }

  if (!profile?.profile_summary && profile?.completion_percent >= 50) {
    candidates.push(makeCandidate({
      key: 'summary.add_context',
      type: 'profile_summary',
      title: 'Ajouter une courte synthèse',
      question: 'Comment décririez-vous votre situation, vos priorités et vos contraintes en quelques phrases ?',
      action: 'complete_profile',
      rationale: 'Une synthèse rédigée par vous apporte du contexte sans transformer une inférence en fait.',
      confidence: 0.86,
      evidence: [{ metric: 'completion_percent', value: Number(profile.completion_percent || 0) }],
    }));
  }

  return candidates.slice(0, MAX_HYPOTHESES);
};

const generateProfileHypotheses = (payload = {}) => {
  const semanticInput = semanticProfile(payload);
  const profileFingerprint = sha256(semanticInput);
  const candidates = buildCandidates(payload).map((candidate) => ({
    ...candidate,
    value: {
      ...candidate.value,
      generator: {
        version: GENERATOR_VERSION,
        profileFingerprint,
      },
    },
  }));
  return { generatorVersion: GENERATOR_VERSION, profileFingerprint, semanticInput, candidates };
};

module.exports = {
  GENERATOR_VERSION,
  buildCandidates,
  generateProfileHypotheses,
  semanticProfile,
  stableStringify,
};
