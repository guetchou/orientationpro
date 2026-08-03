'use strict';

const crypto = require('node:crypto');

const SYNTHESIS_SCHEMA_VERSION = 'profile-synthesis-v1';
const SYNTHESIS_ENGINE_VERSION = 'profile-synthesis-engine-v1';

const GOAL_LABELS = Object.freeze({
  choose_studies: 'choisir une formation',
  find_job: 'rechercher un emploi',
  career_change: 'préparer une reconversion',
  improve_skills: 'développer ses compétences',
  start_business: 'explorer un projet entrepreneurial',
  other: 'préciser son projet',
});

const EDUCATION_RANK = Object.freeze({
  primary: 0,
  middle_school: 1,
  high_school: 2,
  baccalaureate: 3,
  vocational: 3,
  bac_plus_1: 4,
  bac_plus_2: 5,
  licence: 6,
  master: 7,
  doctorate: 8,
  other: -1,
});

const stableValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
};

const dateValue = (value) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
};

const semanticValue = (value) => {
  if (Array.isArray(value)) return value.map(semanticValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !['updatedAt', 'createdAt'].includes(key))
        .map(([key, item]) => [key, semanticValue(item)]),
    );
  }
  return value;
};

const fingerprint = (value) => crypto
  .createHash('sha256')
  .update(JSON.stringify(stableValue(semanticValue(value))))
  .digest('hex');

const selectedProfile = (profile) => profile ? {
  firstName: profile.first_name || null,
  lastName: profile.last_name || null,
  city: profile.city || null,
  countryCode: profile.country_code || null,
  currentSituation: profile.current_situation || null,
  primaryGoal: profile.primary_goal || null,
  mobilityScope: profile.mobility_scope || null,
  profileSummary: profile.profile_summary || null,
  completionPercent: Number(profile.completion_percent || 0),
  updatedAt: dateValue(profile.updated_at),
} : null;

const selectedEducation = (education = []) => [...education]
  .map((entry) => ({
    level: entry.education_level,
    status: entry.status,
    diplomaName: entry.diploma_name || null,
    fieldOfStudy: entry.field_of_study || null,
    institution: entry.institution || null,
    countryCode: entry.country_code || null,
    startYear: entry.start_year === null ? null : Number(entry.start_year),
    endYear: entry.end_year === null ? null : Number(entry.end_year),
    updatedAt: dateValue(entry.updated_at),
  }))
  .sort((left, right) => (
    (right.endYear || right.startYear || 0) - (left.endYear || left.startYear || 0)
    || String(left.level).localeCompare(String(right.level))
    || String(left.institution || '').localeCompare(String(right.institution || ''))
  ));

const selectedSkills = (skills = []) => [...skills]
  .map((skill) => ({
    label: skill.label,
    escoUri: skill.esco_uri,
    proficiency: skill.proficiency || 'unknown',
    source: skill.source || null,
    evidence: skill.evidence || null,
    updatedAt: dateValue(skill.updated_at),
  }))
  .sort((left, right) => (
    String(left.escoUri).localeCompare(String(right.escoUri))
    || String(left.label).localeCompare(String(right.label))
  ));

const selectedHypotheses = (hypotheses = []) => [...hypotheses]
  .filter((item) => item.status === 'confirmed' || item.status === 'rejected')
  .map((item) => ({
    id: item.id,
    type: item.hypothesis_type,
    decision: item.status,
    value: item.value_json || null,
    rationale: item.rationale || null,
    confidence: item.confidence === null ? null : Number(item.confidence),
    updatedAt: dateValue(item.updated_at || item.created_at),
  }))
  .sort((left, right) => left.id.localeCompare(right.id));

const selectedOrientation = (result) => ({
  id: result.id,
  instrumentId: result.instrument_id,
  algorithmVersion: result.algorithm_version,
  primaryCode: result.primary_code || null,
  displayCode: result.display_code,
  scores: result.scores_json || {},
  ranking: result.ranking_json || {},
  differentiation: result.differentiation_json || {},
  createdAt: dateValue(result.created_at),
});

const selectedRecommendations = (snapshot) => {
  const recommendation = snapshot.snapshot_json || {};
  const matches = Array.isArray(recommendation?.matching?.matches)
    ? recommendation.matching.matches
    : [];

  return {
    snapshotId: snapshot.id,
    immutable: true,
    inputFingerprint: snapshot.input_fingerprint,
    profileFingerprint: snapshot.profile_fingerprint,
    recommendationAlgorithmVersion: snapshot.recommendation_algorithm_version,
    riasecAlgorithmVersion: snapshot.riasec_algorithm_version,
    preparationAdapterVersion: snapshot.preparation_adapter_version,
    requestedLocale: snapshot.requested_locale,
    onetSources: snapshot.onet_sources_json || [],
    escoSources: snapshot.esco_sources_json || [],
    createdAt: dateValue(snapshot.created_at),
    topMatches: matches.slice(0, 5).map((match) => ({
      occupationId: match.occupationId,
      preferredLabel: match.preferredLabel,
      recommendationScore: Number(match.recommendationScore ?? match.fitScore ?? 0),
      riasecFitScore: Number(match.fitScore ?? 0),
      translationStatus: match.translationStatus || null,
      matchedSkills: Array.isArray(match?.profileComponents?.skills?.matchedSkills)
        ? match.profileComponents.skills.matchedSkills.slice(0, 5)
        : [],
      explanations: Array.isArray(match.explanations)
        ? match.explanations.map((item) => item.message).filter(Boolean)
        : [],
    })),
  };
};

const highestEducation = (education = []) => education
  .filter((entry) => ['completed', 'in_progress'].includes(entry.status))
  .map((entry) => ({ ...entry, rank: EDUCATION_RANK[entry.level] ?? -1 }))
  .sort((left, right) => right.rank - left.rank || String(left.level).localeCompare(String(right.level)))[0] || null;

const confirmedHypothesisTitles = (hypotheses) => hypotheses
  .filter((item) => item.decision === 'confirmed')
  .map((item) => {
    if (item.value && typeof item.value === 'object') {
      return item.value.title || item.value.question || item.value.key || item.type;
    }
    return item.type;
  })
  .filter(Boolean)
  .slice(0, 5);

const buildSummary = ({ profile, education, skills, hypotheses, orientation, recommendations }) => {
  const highest = highestEducation(education);
  const confirmed = confirmedHypothesisTitles(hypotheses);
  const topCareers = recommendations.topMatches.slice(0, 3).map((match) => match.preferredLabel);
  const missingInformation = [];

  if (!profile?.primaryGoal) missingInformation.push('objectif principal');
  if (!profile?.mobilityScope || profile.mobilityScope === 'unknown') missingInformation.push('mobilité');
  if (education.length === 0) missingInformation.push('parcours d’études');
  if (skills.length === 0) missingInformation.push('compétences confirmées');

  const strengths = [...skills.slice(0, 5).map((skill) => skill.label), ...confirmed]
    .filter(Boolean)
    .slice(0, 8);
  const explorationPriorities = [
    ...topCareers.map((label) => `Examiner la piste « ${label} » et vérifier son adéquation concrète.`),
    ...missingInformation.map((label) => `Compléter ou préciser : ${label}.`),
  ].slice(0, 6);
  const nextActions = [];
  if (topCareers.length > 0) nextActions.push(`Comparer les premières pistes : ${topCareers.join(', ')}.`);
  if (skills.length < 3) nextActions.push('Ajouter quelques compétences pour mieux préciser les métiers à explorer.');
  if (hypotheses.some((item) => item.decision === 'rejected')) {
    nextActions.push('Revoir les suggestions écartées si ta situation ou ton projet évolue.');
  }
  nextActions.push('Mettre à jour cette synthèse après une modification importante de ton profil ou de ton parcours.');

  const goal = GOAL_LABELS[profile?.primaryGoal] || GOAL_LABELS.other;
  const code = orientation.displayCode || null;
  return {
    headline: `Ton profil met en avant plusieurs pistes pour ${goal}.`,
    keySignals: {
      riasecDisplayCode: code,
      riasecPrimaryCode: orientation.primaryCode,
      riasecCodeStatus: orientation.ranking?.codeStatus || null,
      highestEducationLevel: highest?.level || null,
      confirmedEscoSkillCount: skills.length,
      confirmedHypothesisCount: hypotheses.filter((item) => item.decision === 'confirmed').length,
      rejectedHypothesisCount: hypotheses.filter((item) => item.decision === 'rejected').length,
      recommendationCount: recommendations.topMatches.length,
    },
    strengths,
    explorationPriorities,
    missingInformation,
    nextActions,
  };
};

const buildProfileSynthesis = ({
  profile,
  education = [],
  skills = [],
  hypotheses = [],
  orientationResult,
  recommendationSnapshot,
}) => {
  if (!orientationResult) throw new TypeError('orientationResult is required.');
  if (!recommendationSnapshot) throw new TypeError('recommendationSnapshot is required.');

  const sources = {
    profile: selectedProfile(profile),
    education: selectedEducation(education),
    confirmedEscoSkills: selectedSkills(skills),
    decidedHypotheses: selectedHypotheses(hypotheses),
    orientation: selectedOrientation(orientationResult),
    recommendations: selectedRecommendations(recommendationSnapshot),
  };
  const inputFingerprint = fingerprint({
    schemaVersion: SYNTHESIS_SCHEMA_VERSION,
    engineVersion: SYNTHESIS_ENGINE_VERSION,
    sources,
  });

  return {
    inputFingerprint,
    snapshot: {
      schemaVersion: SYNTHESIS_SCHEMA_VERSION,
      engineVersion: SYNTHESIS_ENGINE_VERSION,
      inputFingerprint,
      summary: buildSummary({
        profile: sources.profile,
        education: sources.education,
        skills: sources.confirmedEscoSkills,
        hypotheses: sources.decidedHypotheses,
        orientation: sources.orientation,
        recommendations: sources.recommendations,
      }),
      sources,
      provenance: {
        riasecAlgorithmVersion: sources.orientation.algorithmVersion,
        recommendationAlgorithmVersion: sources.recommendations.recommendationAlgorithmVersion,
        preparationAdapterVersion: sources.recommendations.preparationAdapterVersion,
        onetSources: sources.recommendations.onetSources,
        escoSources: sources.recommendations.escoSources,
      },
      limitations: [
        'Cette synthèse rassemble les informations de ton profil et de ton parcours. Elle ne constitue ni un diagnostic ni une décision à ta place.',
        'Les suggestions que tu n’as pas encore confirmées ne sont pas incluses.',
        'Les métiers proposés servent à explorer des possibilités et ne garantissent ni emploi, ni salaire, ni admission, ni réussite.',
        'Vérifie toujours les formations, conditions d’accès et règles propres à chaque métier auprès des organismes concernés.',
      ],
    },
  };
};

module.exports = {
  SYNTHESIS_SCHEMA_VERSION,
  SYNTHESIS_ENGINE_VERSION,
  buildProfileSynthesis,
  fingerprint,
};
