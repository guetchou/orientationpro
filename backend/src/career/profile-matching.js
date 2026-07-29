'use strict';

const {
  PREPARATION_ADAPTER_VERSION,
  resolvePreparationReference,
} = require('./preparation-model');

const PROFILE_RECOMMENDATION_ALGORITHM_VERSION = 'career-profile-context-v2';

const GOAL_WEIGHTS = Object.freeze({
  choose_studies: Object.freeze({ riasec: 0.80, skills: 0.20, education: 0 }),
  find_job: Object.freeze({ riasec: 0.60, skills: 0.30, education: 0.10 }),
  career_change: Object.freeze({ riasec: 0.65, skills: 0.30, education: 0.05 }),
  improve_skills: Object.freeze({ riasec: 0.70, skills: 0.30, education: 0 }),
  start_business: Object.freeze({ riasec: 0.75, skills: 0.25, education: 0 }),
  other: Object.freeze({ riasec: 0.70, skills: 0.25, education: 0.05 }),
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
  other: null,
});

const PROFICIENCY_WEIGHT = Object.freeze({ beginner: 0.40, intermediate: 0.65, advanced: 0.85, expert: 1, unknown: 0.50 });
const RELATION_WEIGHT = Object.freeze({ essential: 1, important: 0.85, optional: 0.60, related: 0.40 });

const round = (value, digits = 2) => Math.round(value * (10 ** digits)) / (10 ** digits);

const normalizeGoal = (goal) => Object.hasOwn(GOAL_WEIGHTS, goal) ? goal : 'other';

const configuredWeights = (goal) => ({ ...GOAL_WEIGHTS[normalizeGoal(goal)] });

const highestEducation = (education = []) => {
  if (!Array.isArray(education)) return null;
  return education
    .filter((entry) => entry && ['completed', 'in_progress'].includes(entry.status))
    .map((entry) => {
      const rank = EDUCATION_RANK[entry.education_level];
      if (!Number.isFinite(rank)) return null;
      return {
        level: entry.education_level,
        status: entry.status,
        effectiveRank: rank - (entry.status === 'in_progress' ? 0.5 : 0),
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.effectiveRank - left.effectiveRank || left.level.localeCompare(right.level))[0] || null;
};

const educationReadiness = ({ education = [], jobZone = null, onetSourceVersion = null } = {}) => {
  const highest = highestEducation(education);
  const reference = resolvePreparationReference({ sourceVersion: onetSourceVersion, jobZone });
  const provenance = {
    adapterVersion: reference.adapterVersion,
    sourceVersion: reference.sourceVersion,
    frameworkId: reference.frameworkId,
    frameworkKind: reference.frameworkKind,
    zoneLabel: reference.zoneLabel,
  };
  if (!highest) {
    return {
      available: false,
      score: null,
      status: 'missing_education',
      highestEducationLevel: null,
      highestEducationStatus: null,
      jobZone: reference.jobZone,
      requiredRank: reference.requiredRank,
      gap: null,
      ...provenance,
    };
  }
  if (!reference.available) {
    return {
      available: true,
      score: 50,
      status: reference.reason === 'unknown_onet_version'
        ? 'unknown_onet_version'
        : 'unsupported_job_zone',
      highestEducationLevel: highest.level,
      highestEducationStatus: highest.status,
      jobZone: reference.jobZone,
      requiredRank: null,
      gap: null,
      ...provenance,
    };
  }

  const gap = round(highest.effectiveRank - reference.requiredRank, 1);
  let score = 20;
  let status = 'large_gap';
  if (gap >= 0) {
    score = 100;
    status = 'meets_reference';
  } else if (gap >= -1) {
    score = 75;
    status = 'near_reference';
  } else if (gap >= -2) {
    score = 45;
    status = 'development_gap';
  }

  return {
    available: true,
    score,
    status,
    highestEducationLevel: highest.level,
    highestEducationStatus: highest.status,
    jobZone: reference.jobZone,
    requiredRank: reference.requiredRank,
    gap,
    ...provenance,
  };
};

const skillEvidence = ({ matchedSkills = [], confirmedSkillCount = 0 } = {}) => {
  const unique = new Map();
  for (const skill of Array.isArray(matchedSkills) ? matchedSkills : []) {
    if (!skill?.escoUri) continue;
    const contribution = (PROFICIENCY_WEIGHT[skill.proficiency] || PROFICIENCY_WEIGHT.unknown)
      * (RELATION_WEIGHT[skill.relationKind] || RELATION_WEIGHT.related);
    const current = unique.get(skill.escoUri);
    if (!current || contribution > current.contribution) {
      unique.set(skill.escoUri, {
        escoUri: skill.escoUri,
        label: skill.label,
        proficiency: skill.proficiency || 'unknown',
        relationKind: skill.relationKind || 'related',
        contribution,
      });
    }
  }

  const matches = [...unique.values()]
    .sort((left, right) => right.contribution - left.contribution || left.label.localeCompare(right.label))
    .map(({ contribution, ...skill }) => ({ ...skill, contribution: round(contribution, 3) }));
  const totalContribution = matches.reduce((sum, skill) => sum + skill.contribution, 0);

  return {
    available: Number(confirmedSkillCount) > 0,
    score: Number(confirmedSkillCount) > 0 ? round(Math.min(100, (totalContribution / 3) * 100), 2) : null,
    confirmedSkillCount: Number(confirmedSkillCount) || 0,
    matchedSkillCount: matches.length,
    matchedSkills: matches.slice(0, 6),
  };
};

const normalizeWeights = ({ weights, skillAvailable, educationAvailable }) => {
  const active = {
    riasec: weights.riasec,
    skills: skillAvailable ? weights.skills : 0,
    education: educationAvailable ? weights.education : 0,
  };
  const total = active.riasec + active.skills + active.education;
  return Object.fromEntries(
    Object.entries(active).map(([key, value]) => [key, total > 0 ? round(value / total, 6) : 0]),
  );
};

const explanationForEducation = (education) => {
  if (!education.available) return null;
  if (education.status === 'unknown_onet_version') {
    return 'Le niveau d’études déclaré est connu, mais la version O*NET de ce métier ne permet pas de sélectionner un modèle Job Zone fiable.';
  }
  if (education.status === 'unsupported_job_zone') {
    return 'Le niveau d’études déclaré est connu, mais la Job Zone de ce métier n’est pas valide pour la version O*NET utilisée.';
  }
  if (education.status === 'meets_reference') return 'Le niveau d’études déclaré atteint le repère de préparation associé à ce métier.';
  if (education.status === 'near_reference') return 'Le niveau d’études déclaré est proche du repère de préparation associé à ce métier.';
  return 'Un écart de préparation académique ou professionnelle reste à explorer pour ce métier.';
};

const buildRecommendation = ({
  match,
  occupation,
  profile,
  education,
  confirmedSkillCount,
  matchedSkills,
}) => {
  const weights = configuredWeights(profile?.primary_goal);
  const skills = skillEvidence({ matchedSkills, confirmedSkillCount });
  const academic = educationReadiness({
    education,
    jobZone: occupation?.jobZone,
    onetSourceVersion: occupation?.riasecSource?.version,
  });
  const normalized = normalizeWeights({
    weights,
    skillAvailable: skills.available,
    educationAvailable: academic.available,
  });
  const recommendationScore = round(
    (match.fitScore * normalized.riasec)
      + ((skills.score || 0) * normalized.skills)
      + ((academic.score || 0) * normalized.education),
    2,
  );

  const explanations = [
    {
      code: 'RIASEC_ALIGNMENT',
      signal: 'riasec',
      score: match.fitScore,
      message: `La proximité RIASEC entre le Résultat d’orientation et ce métier est de ${match.fitScore} %.`,
    },
  ];
  if (skills.available) {
    explanations.push({
      code: skills.matchedSkillCount > 0 ? 'ESCO_SKILL_EVIDENCE' : 'ESCO_SKILL_GAP',
      signal: 'skills',
      score: skills.score,
      message: skills.matchedSkillCount > 0
        ? `${skills.matchedSkillCount} compétence(s) ESCO confirmée(s) sont reliées à ce métier.`
        : 'Aucune compétence ESCO confirmée du profil n’est actuellement reliée à ce métier.',
    });
  }
  const educationMessage = explanationForEducation(academic);
  if (educationMessage) {
    explanations.push({
      code: `EDUCATION_${academic.status.toUpperCase()}`,
      signal: 'education',
      score: academic.score,
      message: educationMessage,
    });
  }

  const cautions = [
    'Ce classement aide à explorer des pistes. Il ne garantit ni emploi, ni salaire, ni réussite, ni aptitude réglementaire.',
    'Les profils RIASEC et Job Zone viennent d’O*NET ; les libellés et relations de compétences viennent d’ESCO lorsqu’un rapprochement traçable existe.',
  ];
  if (academic.available) cautions.push('Le repère Job Zone n’est pas une équivalence officielle de diplôme dans un pays donné.');
  if (profile?.mobility_scope) cautions.push('La mobilité déclarée est affichée comme contexte mais n’entre pas dans le score sans référentiel géographique versionné.');

  return {
    ...match,
    recommendationScore,
    recommendationAlgorithmVersion: PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
    profileComponents: {
      riasec: { available: true, score: match.fitScore },
      skills,
      education: academic,
      configuredWeights: weights,
      appliedWeights: normalized,
    },
    explanations,
    cautions,
  };
};

const rankProfileRecommendations = ({
  baseMatches = [],
  occupationsById = new Map(),
  profile = null,
  education = [],
  confirmedSkills = [],
  skillLinksByOccupation = new Map(),
  limit = 20,
} = {}) => {
  if (!Array.isArray(baseMatches)) throw new TypeError('baseMatches must be an array.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new TypeError('limit must be an integer between 1 and 100.');
  const confirmedSkillCount = confirmedSkills.length;
  return baseMatches
    .map((match) => {
      const occupation = occupationsById.get(match.occupationId) || null;
      const presentationId = occupation?.presentationOccupationId || match.occupationId;
      return buildRecommendation({
        match,
        occupation,
        profile,
        education,
        confirmedSkillCount,
        matchedSkills: skillLinksByOccupation.get(presentationId) || [],
      });
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore
      || right.fitScore - left.fitScore
      || left.preferredLabel.localeCompare(right.preferredLabel)
      || left.occupationId.localeCompare(right.occupationId))
    .slice(0, limit);
};

const profileRecommendationContext = ({
  profile = null,
  education = [],
  confirmedSkills = [],
  versioning = {},
} = {}) => {
  const highest = highestEducation(education);
  const usedSignals = ['riasec'];
  const missingSignals = [];
  if (confirmedSkills.length > 0) usedSignals.push('confirmed_esco_skills');
  else missingSignals.push('confirmed_esco_skills');
  if (highest) usedSignals.push('education');
  else missingSignals.push('education');
  if (profile?.primary_goal) usedSignals.push('primary_goal');
  else missingSignals.push('primary_goal');
  if (!profile) missingSignals.push('profile');

  return {
    algorithmVersion: PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
    preparationAdapterVersion: PREPARATION_ADAPTER_VERSION,
    profileFingerprint: versioning.profileFingerprint || null,
    inputFingerprint: versioning.inputFingerprint || null,
    catalogSources: versioning.catalogSources || [],
    profileCompletionPercent: profile?.completion_percent ?? 0,
    currentSituation: profile?.current_situation ?? null,
    primaryGoal: profile?.primary_goal ?? null,
    mobilityScope: profile?.mobility_scope ?? null,
    highestEducationLevel: highest?.level ?? null,
    highestEducationStatus: highest?.status ?? null,
    confirmedEscoSkillCount: confirmedSkills.length,
    configuredWeights: configuredWeights(profile?.primary_goal),
    usedSignals,
    missingSignals,
    limitations: [
      'Aucune donnée de salaire, de débouché local ou de catalogue national n’entre dans le score.',
      'La mobilité n’est pas scorée sans référentiel géographique versionné.',
      'Les compétences sans URI ESCO confirmée restent visibles dans le profil mais ne modifient pas ce score.',
    ],
  };
};

module.exports = {
  EDUCATION_RANK,
  GOAL_WEIGHTS,
  PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
  buildRecommendation,
  configuredWeights,
  educationReadiness,
  highestEducation,
  profileRecommendationContext,
  rankProfileRecommendations,
  skillEvidence,
};
