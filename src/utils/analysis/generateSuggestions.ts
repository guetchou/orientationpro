
interface TestHistoryItem {
  test_type: string;
  created_at: string;
}

export const generateSuggestions = (testHistory: TestHistoryItem[] = []): string[] => {
  // Si pas de tests, retourner suggestions génériques
  if (!testHistory || testHistory.length === 0) {
    return [
      "Essayez de passer plusieurs tests pour obtenir une vue complète de votre profil",
      "Refaites un test après quelques semaines pour voir votre évolution"
    ];
  }
  
  // Analyse simple basée sur l'historique
  const testTypes = testHistory.map(test => test.test_type);
  const suggestions = [];
  
  // Suggestions de base pour les tests manquants
  const testsMissing = {
    'RIASEC': "Passez le test RIASEC pour découvrir vos intérêts professionnels",
    'emotional': "Essayez le test d'intelligence émotionnelle pour mieux comprendre vos émotions",
    'multiple_intelligence': "Le test des intelligences multiples vous aiderait à identifier vos forces cognitives",
    'learning_style': "Découvrez votre style d'apprentissage pour optimiser vos méthodes d'étude",
    'career_transition': "Le test de reconversion professionnelle vous aidera à évaluer votre potentiel de changement",
    'retirement_readiness': "Évaluez votre préparation à la retraite avec notre test dédié",
    'senior_employment': "Découvrez les opportunités d'emploi adaptées à votre expérience avec le test senior",
    'no_diploma_career': "Explorez vos possibilités professionnelles sans diplôme avec notre test spécialisé"
  };
  
  // Ajouter des suggestions pour les tests non effectués
  Object.entries(testsMissing).forEach(([type, suggestion]) => {
    if (!testTypes.includes(type)) {
      suggestions.push(suggestion);
    }
  });
  
  // Suggestions pour les tests déjà passés
  if (testHistory.length > 0) {
    const oldestTest = testHistory[testHistory.length - 1];
    const oldestDate = new Date(oldestTest.created_at);
    const now = new Date();
    const monthsSinceOldest = (now.getFullYear() - oldestDate.getFullYear()) * 12 + now.getMonth() - oldestDate.getMonth();
    
    if (monthsSinceOldest > 3) {
      suggestions.push(`Refaites le test ${oldestTest.test_type} pour voir votre évolution depuis ${monthsSinceOldest} mois`);
    }
  }
  
  return suggestions.length > 0 ? suggestions : ["Continuez à passer régulièrement des tests pour suivre votre évolution"];
};
