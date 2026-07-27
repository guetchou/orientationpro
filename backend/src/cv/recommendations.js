'use strict';

// Génère des constats explicables et stables. Chaque item : code, sévérité,
// intitulé, observation, recommandation, impact score. On ne conseille JAMAIS
// d'inventer des chiffres.
const buildRecommendations = ({ sectionInfo, scoreResult, skills, targetMatch }) => {
  const items = [];
  const has = (key) => sectionInfo.sections.find((s) => s.key === key)?.present;
  const push = (item) => items.push(item);

  if (!has('contact')) {
    push({ code: 'CONTACT_MISSING', severity: 'critique', title: 'Coordonnées absentes',
      observation: 'Aucune adresse e-mail ni numéro de téléphone exploitable n’a été détecté.',
      recommendation: 'Ajoutez un e-mail et un téléphone au format local (+242) en tête de CV.', scoreImpact: -8 });
  }
  if (!has('experience')) {
    push({ code: 'EXPERIENCE_SECTION_MISSING', severity: 'critique', title: 'Section expérience absente',
      observation: 'Aucune section d’expérience professionnelle n’a été identifiée.',
      recommendation: 'Structurez une section « Expérience » avec postes, employeurs et dates.', scoreImpact: -8 });
  }
  if (!has('skills')) {
    push({ code: 'SKILLS_SECTION_MISSING', severity: 'important', title: 'Compétences non regroupées',
      observation: 'Aucune section « Compétences » claire n’a été détectée.',
      recommendation: 'Regroupez vos compétences clés dans une section dédiée.', scoreImpact: -5 });
  }
  if (!scoreResult.signals.quantified) {
    push({ code: 'EXPERIENCE_NO_MEASURABLE_OUTCOME', severity: 'important', title: 'Résultats peu quantifiés',
      observation: 'Aucun résultat mesurable n’a été détecté dans les expériences.',
      recommendation: 'Ajoutez des résultats chiffrés uniquement lorsqu’ils sont réels et vérifiables (volume, délai, objectif atteint).', scoreImpact: -6 });
  }
  if (scoreResult.signals.verbHits < 3) {
    push({ code: 'WEAK_ACTION_VERBS', severity: 'suggestion', title: 'Verbes d’action peu présents',
      observation: 'Peu de verbes d’action ont été repérés dans les descriptions.',
      recommendation: 'Commencez vos réalisations par des verbes d’action (gérer, coordonner, développer).', scoreImpact: -3 });
  }
  if (!scoreResult.signals.enoughText) {
    push({ code: 'CONTENT_TOO_SHORT', severity: 'important', title: 'Contenu trop court',
      observation: 'Le texte extrait est court, ce qui limite l’analyse.',
      recommendation: 'Détaillez davantage vos missions et responsabilités.', scoreImpact: -4 });
  }
  if (targetMatch && targetMatch.missingSkills.length > 0) {
    push({ code: 'TARGET_MISSING_SKILLS', severity: 'important', title: 'Compétences de l’offre absentes',
      observation: `L’offre mentionne des compétences non détectées dans le CV : ${targetMatch.missingSkills.slice(0, 5).join(', ')}.`,
      recommendation: 'Mettez en avant ces compétences si vous les possédez réellement, avec des exemples concrets.', scoreImpact: 0 });
  }

  const order = { critique: 0, important: 1, suggestion: 2 };
  items.sort((a, b) => order[a.severity] - order[b.severity] || a.code.localeCompare(b.code));

  const strengths = [];
  if (has('contact') && (sectionInfo.contact.hasEmail && sectionInfo.contact.hasPhone)) {
    strengths.push({ code: 'CONTACT_COMPLETE', title: 'Coordonnées complètes' });
  }
  if (scoreResult.signals.quantified) strengths.push({ code: 'HAS_QUANTIFIED', title: 'Présence de résultats chiffrés' });
  if (skills.length >= 5) strengths.push({ code: 'RICH_SKILLS', title: 'Compétences variées détectées' });

  return { issues: items, strengths };
};

module.exports = { buildRecommendations };
