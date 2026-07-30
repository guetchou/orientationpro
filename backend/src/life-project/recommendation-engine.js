'use strict';

const crypto = require('node:crypto');
const {
  RECOMMENDATION_ENGINE_VERSION,
  createLocalOption,
  createRecommendationOutput,
} = require('./recommendation-contracts');

const BASE_DIMENSION_WEIGHTS = Object.freeze({
  interests: 20,
  skills: 15,
  preferences: 10,
  schoolCompatibility: 15,
  practicalConstraints: 15,
  localAccessibility: 10,
  temporalFeasibility: 5,
  financialFeasibility: 5,
  experimentation: 5,
});

const OBJECTIVE_MULTIPLIERS = Object.freeze({
  studies: Object.freeze({ interests: 1.1, schoolCompatibility: 1.3, temporalFeasibility: 1.1, financialFeasibility: 1.1, skills: 0.8 }),
  insertion: Object.freeze({ skills: 1.25, schoolCompatibility: 0.8, practicalConstraints: 1.2, localAccessibility: 1.15, temporalFeasibility: 1.3, financialFeasibility: 1.2 }),
  reconversion: Object.freeze({ interests: 1.15, skills: 1.25, schoolCompatibility: 0.65, practicalConstraints: 1.1, experimentation: 1.3 }),
  entrepreneurship: Object.freeze({ interests: 1.1, skills: 1.15, preferences: 1.2, schoolCompatibility: 0.5, practicalConstraints: 1.1, financialFeasibility: 1.1, experimentation: 1.4 }),
  reentry: Object.freeze({ schoolCompatibility: 1.1, practicalConstraints: 1.2, localAccessibility: 1.15, temporalFeasibility: 1.1, financialFeasibility: 1.15 }),
  uncertain: Object.freeze({ interests: 1.15, preferences: 1.15, experimentation: 1.25, schoolCompatibility: 0.8 }),
});

const PRIORITY_DIMENSIONS = Object.freeze({
  duration: 'temporalFeasibility',
  cost: 'financialFeasibility',
  proximity: 'localAccessibility',
  employability: 'practicalConstraints',
  interest: 'interests',
  personal_interest: 'interests',
  alternance: 'practicalConstraints',
  future_income: 'financialFeasibility',
  stability: 'practicalConstraints',
  evolution: 'skills',
  family_compatibility: 'practicalConstraints',
});

const EDUCATION_RANKS = Object.freeze({
  none: 0,
  primary: 1,
  middle_school: 2,
  high_school: 3,
  baccalaureate: 4,
  vocational: 4,
  bac_plus_1: 5,
  bac_plus_2: 6,
  licence: 7,
  master: 8,
  doctorate: 9,
});

const normalizeToken = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/gu, '')
  .trim()
  .toLowerCase();

const uniqueTokens = (value) => [...new Set(
  (Array.isArray(value) ? value : [])
    .map(normalizeToken)
    .filter(Boolean),
)];

const round = (value, digits = 2) => Math.round(value * (10 ** digits)) / (10 ** digits);
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const diceSimilarity = (left, right) => {
  const a = new Set(uniqueTokens(left));
  const b = new Set(uniqueTokens(right));
  if (a.size === 0 || b.size === 0) return null;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
};

const resolveEducationRank = (diagnostic) => {
  if (Number.isFinite(Number(diagnostic.educationRank))) return Number(diagnostic.educationRank);
  const level = normalizeToken(diagnostic.educationLevel);
  return Object.hasOwn(EDUCATION_RANKS, level) ? EDUCATION_RANKS[level] : null;
};

const normalizeDiagnostic = (input = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('diagnostic must be a plain object.');
  }
  const location = input.location && typeof input.location === 'object'
    ? {
      country: normalizeToken(input.location.country),
      zone: normalizeToken(input.location.zone),
    }
    : { country: '', zone: '' };
  const budget = input.budget && typeof input.budget === 'object'
    ? {
      amount: Number.isFinite(Number(input.budget.amount)) ? Number(input.budget.amount) : null,
      currency: normalizeToken(input.budget.currency),
    }
    : { amount: null, currency: '' };
  const priorities = Array.isArray(input.priorities)
    ? input.priorities.map((entry) => ({
      id: normalizeToken(entry?.id),
      importance: clamp(Number(entry?.importance) || 0, 0, 1),
    })).filter((entry) => entry.id)
    : [];
  return Object.freeze({
    id: input.id ? String(input.id) : null,
    objective: normalizeToken(input.objective) || 'uncertain',
    educationRank: resolveEducationRank(input),
    educationLevel: normalizeToken(input.educationLevel),
    location,
    mobility: normalizeToken(input.mobility) || 'unknown',
    budget,
    maxDurationMonths: Number.isFinite(Number(input.maxDurationMonths))
      ? Number(input.maxDurationMonths)
      : null,
    needIncomeWithinMonths: Number.isFinite(Number(input.needIncomeWithinMonths))
      ? Number(input.needIncomeWithinMonths)
      : null,
    interests: uniqueTokens(input.interests),
    skills: uniqueTokens(input.skills),
    preferences: uniqueTokens(input.preferences),
    availableModes: uniqueTokens(input.availableModes),
    equipment: uniqueTokens(input.equipment),
    documents: uniqueTokens(input.documents),
    regulatoryQualifications: uniqueTokens(input.regulatoryQualifications),
    priorities,
  });
};

const objectiveWeights = (diagnostic) => {
  const multipliers = {
    ...Object.fromEntries(Object.keys(BASE_DIMENSION_WEIGHTS).map((key) => [key, 1])),
    ...(OBJECTIVE_MULTIPLIERS[diagnostic.objective] || OBJECTIVE_MULTIPLIERS.uncertain),
  };
  for (const priority of diagnostic.priorities) {
    const dimension = PRIORITY_DIMENSIONS[priority.id];
    if (dimension) multipliers[dimension] *= 1 + (priority.importance * 0.5);
  }
  const weighted = Object.fromEntries(
    Object.entries(BASE_DIMENSION_WEIGHTS).map(([dimension, base]) => (
      [dimension, base * multipliers[dimension]]
    )),
  );
  const total = Object.values(weighted).reduce((sum, value) => sum + value, 0);
  return Object.freeze(Object.fromEntries(
    Object.entries(weighted).map(([dimension, value]) => [dimension, round((value / total) * 100, 4)]),
  ));
};

const locationTokens = (diagnostic) => uniqueTokens([
  diagnostic.location.country,
  diagnostic.location.zone,
]);

const optionIsOnline = (option) => option.modes.map(normalizeToken).includes('online')
  || option.modes.map(normalizeToken).includes('distance');

const hardFilter = ({ diagnostic, option }) => {
  const blockers = [];
  if (option.status === 'unavailable' || option.verificationStatus === 'obsolete') {
    blockers.push('Option indisponible ou déclarée obsolète dans le référentiel local.');
  }
  if (option.calendar.status === 'closed') {
    blockers.push('Le calendrier d’accès est fermé pour la période connue.');
  }
  if (option.entryLevel.minimumRank !== null && diagnostic.educationRank !== null
    && diagnostic.educationRank < option.entryLevel.minimumRank) {
    blockers.push(`Le niveau d’entrée connu (${option.entryLevel.label || option.entryLevel.minimumRank}) n’est pas atteint actuellement.`);
  }
  const knownLocations = uniqueTokens(option.geographies);
  const userLocations = locationTokens(diagnostic);
  const localMatch = knownLocations.length === 0
    || (diagnostic.location.zone
      ? knownLocations.includes(diagnostic.location.zone)
      : knownLocations.some((location) => userLocations.includes(location)));
  const mobilityRestricted = ['none', 'local'].includes(diagnostic.mobility);
  if (!localMatch && mobilityRestricted && !optionIsOnline(option)) {
    blockers.push('La localisation connue est incompatible avec la mobilité déclarée.');
  }
  if (diagnostic.maxDurationMonths !== null && option.durationMonths !== null
    && option.durationMonths > diagnostic.maxDurationMonths) {
    blockers.push('La durée connue dépasse la durée maximale déclarée.');
  }
  if (diagnostic.budget.amount !== null && option.cost.amount !== null
    && option.cost.amount > diagnostic.budget.amount && !option.cost.fundingAvailable) {
    blockers.push('Le coût connu dépasse le budget déclaré et aucun financement n’est identifié.');
  }
  const missingRegulatory = option.regulatoryRequirements
    .map(normalizeToken)
    .filter((requirement) => !diagnostic.regulatoryQualifications.includes(requirement));
  if (missingRegulatory.length > 0) {
    blockers.push(`Condition réglementaire non satisfaite : ${missingRegulatory.join(', ')}.`);
  }
  const missingEquipment = option.requiredEquipment
    .map(normalizeToken)
    .filter((equipment) => !diagnostic.equipment.includes(equipment));
  if (missingEquipment.length > 0 && option.modes.every((mode) => ['online', 'distance'].includes(normalizeToken(mode)))) {
    blockers.push(`Équipement indispensable non disponible : ${missingEquipment.join(', ')}.`);
  }
  return blockers;
};

const ratioOrUnknown = (ratio, unknownValue = 0.35) => ratio === null ? unknownValue : ratio;

const practicalRatio = ({ diagnostic, option }) => {
  const components = [];
  if (diagnostic.availableModes.length > 0 && option.modes.length > 0) {
    components.push(option.modes.map(normalizeToken).some((mode) => diagnostic.availableModes.includes(mode)) ? 1 : 0.2);
  }
  if (option.requiredEquipment.length > 0) {
    const available = option.requiredEquipment.map(normalizeToken)
      .filter((entry) => diagnostic.equipment.includes(entry)).length;
    components.push(available / option.requiredEquipment.length);
  }
  if (diagnostic.needIncomeWithinMonths !== null && option.durationMonths !== null) {
    components.push(option.durationMonths <= diagnostic.needIncomeWithinMonths ? 1 : 0.25);
  }
  const preference = diceSimilarity(diagnostic.preferences, option.preferences);
  if (preference !== null) components.push(preference);
  return components.length > 0
    ? components.reduce((sum, value) => sum + value, 0) / components.length
    : 0.4;
};

const localRatio = ({ diagnostic, option }) => {
  const knownLocations = uniqueTokens(option.geographies);
  const userLocations = locationTokens(diagnostic);
  const exactLocation = diagnostic.location.zone
    ? knownLocations.includes(diagnostic.location.zone)
    : knownLocations.some((location) => userLocations.includes(location));
  if (exactLocation) {
    return option.localOpportunities.some((entry) => entry.status === 'verified') ? 1 : 0.8;
  }
  if (optionIsOnline(option)) return 0.75;
  if (knownLocations.length === 0 || userLocations.length === 0) return 0.3;
  return ['national', 'international', 'flexible'].includes(diagnostic.mobility) ? 0.55 : 0;
};

const schoolRatio = ({ diagnostic, option }) => {
  if (option.entryLevel.minimumRank === null) return 0.5;
  if (diagnostic.educationRank === null) return 0.25;
  const margin = diagnostic.educationRank - option.entryLevel.minimumRank;
  if (margin >= 0) return 1;
  return 0;
};

const temporalRatio = ({ diagnostic, option }) => {
  if (option.calendar.status === 'closed') return 0;
  const components = [option.calendar.status === 'open' ? 1 : 0.45];
  if (diagnostic.maxDurationMonths !== null && option.durationMonths !== null) {
    components.push(option.durationMonths <= diagnostic.maxDurationMonths ? 1 : 0);
  }
  if (diagnostic.needIncomeWithinMonths !== null && option.durationMonths !== null) {
    components.push(option.durationMonths <= diagnostic.needIncomeWithinMonths ? 1 : 0.25);
  }
  return components.reduce((sum, value) => sum + value, 0) / components.length;
};

const financialRatio = ({ diagnostic, option }) => {
  if (option.cost.status === 'unknown' || option.cost.amount === null) return 0.35;
  if (diagnostic.budget.amount === null) return option.cost.fundingAvailable ? 0.7 : 0.45;
  if (option.cost.amount <= diagnostic.budget.amount) return 1;
  return option.cost.fundingAvailable ? 0.65 : 0;
};

const dimensionRatios = ({ diagnostic, option }) => ({
  interests: ratioOrUnknown(diceSimilarity(diagnostic.interests, option.interests)),
  skills: ratioOrUnknown(diceSimilarity(diagnostic.skills, option.skills)),
  preferences: ratioOrUnknown(diceSimilarity(diagnostic.preferences, option.preferences)),
  schoolCompatibility: schoolRatio({ diagnostic, option }),
  practicalConstraints: practicalRatio({ diagnostic, option }),
  localAccessibility: localRatio({ diagnostic, option }),
  temporalFeasibility: temporalRatio({ diagnostic, option }),
  financialFeasibility: financialRatio({ diagnostic, option }),
  experimentation: option.experimentActions.length > 0 ? 1 : 0,
});

const missingCriticalInformation = ({ diagnostic, option }) => {
  const missing = [];
  if (diagnostic.educationRank === null && option.entryLevel.minimumRank !== null) missing.push('Niveau scolaire ou professionnel actuel');
  if (locationTokens(diagnostic).length === 0 && option.geographies.length > 0) missing.push('Pays, ville ou zone de résidence');
  if (diagnostic.budget.amount === null && option.cost.amount !== null) missing.push('Budget maximal ou financement mobilisable');
  if (diagnostic.maxDurationMonths === null && option.durationMonths !== null) missing.push('Durée maximale acceptable');
  if (diagnostic.interests.length === 0 && option.interests.length > 0) missing.push('Intérêts et activités appréciées');
  if (diagnostic.skills.length === 0 && option.skills.length > 0) missing.push('Compétences et expériences disponibles');
  if (option.calendar.status === 'unknown') missing.push('Calendrier de candidature ou de démarrage');
  if (option.cost.status === 'unknown') missing.push('Coût ou fourchette de coût');
  if (option.entryLevel.status === 'to_confirm') missing.push('Conditions exactes d’admission');
  return [...new Set(missing)];
};

const sourceIsStale = (source, generatedAt) => {
  if (!source.verifiedAt) return false;
  const ageMs = new Date(generatedAt).getTime() - new Date(source.verifiedAt).getTime();
  return ageMs > 365 * 24 * 60 * 60 * 1000;
};

const penaltyDetails = ({ diagnostic, option, generatedAt }) => {
  const criticalUnknowns = missingCriticalInformation({ diagnostic, option });
  const stale = option.sourceReferences.some((source) => sourceIsStale(source, generatedAt));
  const unverified = option.verificationStatus !== 'verified'
    || option.entryLevel.status !== 'verified'
    || option.sourceReferences.some((source) => source.verificationStatus !== 'verified');
  return Object.freeze({
    criticalUnknown: Math.min(20, criticalUnknowns.length * 5),
    staleSource: stale ? 5 : 0,
    unverifiedCondition: unverified ? 10 : 0,
    noExperiment: option.experimentActions.length === 0 ? 5 : 0,
  });
};

const confidenceFor = ({ diagnostic, option, generatedAt, missingInformation }) => {
  const completenessSignals = [
    diagnostic.objective && diagnostic.objective !== 'uncertain',
    diagnostic.educationRank !== null,
    locationTokens(diagnostic).length > 0,
    diagnostic.budget.amount !== null,
    diagnostic.maxDurationMonths !== null,
    diagnostic.interests.length > 0,
    diagnostic.skills.length > 0,
    diagnostic.preferences.length > 0,
  ];
  const completeness = completenessSignals.filter(Boolean).length / completenessSignals.length;
  const allSourcesVerified = option.sourceReferences.every((source) => (
    source.verificationStatus === 'verified' && !sourceIsStale(source, generatedAt)
  ));
  const locallyVerified = option.verificationStatus === 'verified'
    && option.localOpportunities.every((entry) => entry.status === 'verified');
  if (completeness >= 0.8 && allSourcesVerified && locallyVerified && missingInformation.length <= 1) {
    return 'high';
  }
  if (completeness >= 0.5 && option.sourceReferences.length > 0
    && option.verificationStatus !== 'obsolete') {
    return 'medium';
  }
  return 'low';
};

const explanationLabels = Object.freeze({
  interests: 'Les intérêts déclarés correspondent aux activités associées à cette option.',
  skills: 'Les compétences ou expériences déclarées recoupent celles attendues pour cette option.',
  preferences: 'Les préférences de travail déclarées sont compatibles avec cette option.',
  schoolCompatibility: 'Le niveau scolaire ou professionnel déclaré est compatible avec le niveau d’entrée connu.',
  practicalConstraints: 'Les modalités pratiques connues sont compatibles avec les contraintes déclarées.',
  localAccessibility: 'Une modalité locale ou à distance compatible a été identifiée.',
  temporalFeasibility: 'La durée et le calendrier connus sont compatibles avec l’horizon déclaré.',
  financialFeasibility: 'Le coût connu ou le financement identifié est compatible avec le budget déclaré.',
  experimentation: 'Une action concrète permet de tester rapidement cette piste.',
});

const generatedAction = (option) => ({
  title: `Vérifier les conditions d’accès de « ${option.title} »`,
  deadlineDays: 7,
  expectedEvidence: 'Source, date, conditions d’admission, coût, calendrier et contact vérifiés',
});

const deterministicScenarioId = (optionId) => `scenario-${crypto
  .createHash('sha256')
  .update(`${RECOMMENDATION_ENGINE_VERSION}:${optionId}`)
  .digest('hex')
  .slice(0, 24)}`;

const scoreOption = ({ diagnostic, option, weights, generatedAt }) => {
  const ratios = dimensionRatios({ diagnostic, option });
  const scoreBreakdown = Object.fromEntries(
    Object.entries(ratios).map(([dimension, ratio]) => [
      dimension,
      round(clamp(ratio, 0, 1) * weights[dimension], 2),
    ]),
  );
  const rawScore = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);
  const penalties = penaltyDetails({ diagnostic, option, generatedAt });
  const penaltyTotal = Object.values(penalties).reduce((sum, value) => sum + value, 0);
  const fitScore = round(clamp(rawScore - penaltyTotal, 0, 100), 2);
  const missingInformation = missingCriticalInformation({ diagnostic, option });
  const reasons = Object.entries(scoreBreakdown)
    .filter(([, score]) => score > 0)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([signal, score]) => ({
      signal,
      score: round(clamp((score / weights[signal]) * 100, 0, 100), 2),
      explanation: explanationLabels[signal],
    }));
  const strengths = reasons.slice(0, 3).map((reason) => reason.explanation);
  const risks = [...option.risks];
  if (penalties.unverifiedCondition > 0) risks.push('Une ou plusieurs conditions d’accès doivent encore être confirmées auprès d’une source locale.');
  if (penalties.staleSource > 0) risks.push('Au moins une source locale date de plus de douze mois.');
  if (penalties.noExperiment > 0) risks.push('Aucune possibilité d’expérimentation rapide n’est documentée.');
  return {
    option,
    fitScore,
    reasons,
    strengths: [...new Set(strengths)],
    risks: [...new Set(risks)],
    missingInformation,
    scoreBreakdown,
    penalties,
    confidence: confidenceFor({ diagnostic, option, generatedAt, missingInformation }),
    firstActions: option.experimentActions.length > 0
      ? option.experimentActions.slice(0, 3)
      : [generatedAction(option)],
  };
};

const selectDiversified = (ranked, maximum = 5) => {
  if (ranked.length === 0) return [];
  const selected = [ranked[0]];
  const groups = new Set([ranked[0].option.diversificationGroup]);
  const categories = new Set([ranked[0].option.category]);
  for (const candidate of ranked.slice(1)) {
    if (selected.length >= maximum) break;
    if (!groups.has(candidate.option.diversificationGroup)) {
      selected.push(candidate);
      groups.add(candidate.option.diversificationGroup);
      categories.add(candidate.option.category);
    }
  }
  for (const candidate of ranked.slice(1)) {
    if (selected.length >= maximum) break;
    if (selected.includes(candidate)) continue;
    if (!categories.has(candidate.option.category)) {
      selected.push(candidate);
      groups.add(candidate.option.diversificationGroup);
      categories.add(candidate.option.category);
    }
  }
  for (const candidate of ranked.slice(1)) {
    if (selected.length >= maximum) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }
  return selected.sort((left, right) => right.fitScore - left.fitScore
    || left.option.title.localeCompare(right.option.title)
    || left.option.id.localeCompare(right.option.id));
};

const positioningFor = (candidate, index, first) => {
  if (index === 0) return 'priority';
  if (candidate.option.fallback) return 'fallback';
  if (candidate.option.exploratory) return 'exploratory';
  if (candidate.option.category === first.option.category) return 'adjacent';
  return 'alternative';
};

const generateLifeRecommendations = ({
  diagnostic: diagnosticInput,
  options: optionInputs = [],
  generatedAt: generatedAtInput = null,
  clock = () => new Date(),
  maximumScenarios = 5,
} = {}) => {
  const diagnostic = normalizeDiagnostic(diagnosticInput);
  if (!Array.isArray(optionInputs)) throw new TypeError('options must be an array.');
  if (!Number.isInteger(maximumScenarios) || maximumScenarios < 3 || maximumScenarios > 5) {
    throw new TypeError('maximumScenarios must be an integer between 3 and 5.');
  }
  const generatedAt = new Date(generatedAtInput || clock()).toISOString();
  const options = optionInputs.map(createLocalOption);
  const weights = objectiveWeights(diagnostic);
  const nonPrioritized = [];
  const eligible = [];
  for (const option of options) {
    const blockers = hardFilter({ diagnostic, option });
    if (blockers.length > 0) {
      nonPrioritized.push({ optionId: option.id, title: option.title, reasons: blockers });
    } else {
      eligible.push(scoreOption({ diagnostic, option, weights, generatedAt }));
    }
  }
  const ranked = eligible.sort((left, right) => right.fitScore - left.fitScore
    || left.option.title.localeCompare(right.option.title)
    || left.option.id.localeCompare(right.option.id));
  const selected = selectDiversified(ranked, maximumScenarios);
  const scenarioIds = selected.map((entry) => deterministicScenarioId(entry.option.id));
  const scenarios = selected.map((entry, index) => ({
    id: scenarioIds[index],
    optionId: entry.option.id,
    title: entry.option.title,
    category: entry.option.category,
    positioning: positioningFor(entry, index, selected[0]),
    rank: index + 1,
    fitScore: entry.fitScore,
    confidence: entry.confidence,
    reasons: entry.reasons,
    strengths: entry.strengths,
    conditions: entry.option.conditions,
    risks: entry.risks,
    blockingFactors: [],
    missingInformation: entry.missingInformation,
    localOpportunities: entry.option.localOpportunities,
    sourceReferences: entry.option.sourceReferences,
    firstActions: entry.firstActions,
    alternatives: scenarioIds.filter((id) => id !== scenarioIds[index]),
    scoreBreakdown: {
      weights,
      points: entry.scoreBreakdown,
    },
    penalties: entry.penalties,
    generatedAt,
    engineVersion: RECOMMENDATION_ENGINE_VERSION,
  }));
  const outputMissing = [...new Set([
    ...selected.flatMap((entry) => entry.missingInformation),
    ...(selected.length < 3 ? ['Référentiel insuffisant pour produire trois options diversifiées.'] : []),
  ])];
  return createRecommendationOutput({
    engineVersion: RECOMMENDATION_ENGINE_VERSION,
    status: scenarios.length >= 3 ? 'complete' : 'insufficient_options',
    generatedAt,
    diagnosticSummary: {
      diagnosticId: diagnostic.id,
      objective: diagnostic.objective,
      educationRank: diagnostic.educationRank,
      location: diagnostic.location,
      mobility: diagnostic.mobility,
      appliedWeights: weights,
    },
    scenarios,
    nonPrioritized,
    missingInformation: outputMissing,
  });
};

module.exports = {
  BASE_DIMENSION_WEIGHTS,
  EDUCATION_RANKS,
  OBJECTIVE_MULTIPLIERS,
  generateLifeRecommendations,
  hardFilter,
  normalizeDiagnostic,
  objectiveWeights,
  selectDiversified,
};
