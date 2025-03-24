
import { LearningStyleResults } from "@/types/test";

export const analyzeLearningStyleResults = (responses: number[]): LearningStyleResults => {
  // Calcul des scores pour chaque style
  const visual = responses.reduce((sum, val, index) => index === 0 && val === 4 ? sum + val : (index === 1 && val === 4 ? sum + val : (index === 2 && val === 4 ? sum + val : sum)), 0);
  const auditory = responses.reduce((sum, val, index) => index === 0 && val === 3 ? sum + val : (index === 1 && val === 3 ? sum + val : (index === 2 && val === 3 ? sum + val : sum)), 0);
  const kinesthetic = responses.reduce((sum, val, index) => index === 0 && val === 5 ? sum + val : (index === 1 && val === 5 ? sum + val : (index === 2 && val === 5 ? sum + val : sum)), 0);
  const reading = responses.reduce((sum, val, index) => index === 0 && val === 2 ? sum + val : (index === 1 && val === 2 ? sum + val : (index === 2 && val === 2 ? sum + val : sum)), 0);

  // Déterminer le style dominant
  const styles = [
    { style: 'visual', score: visual },
    { style: 'auditory', score: auditory },
    { style: 'kinesthetic', score: kinesthetic },
    { style: 'reading', score: reading }
  ];
  styles.sort((a, b) => b.score - a.score);
  const primaryStyle = styles[0].style;
  const secondaryStyle = styles[1].style;

  // Recommandations basées sur le style dominant
  const recommendedStrategies = [];
  if (primaryStyle === 'visual') {
    recommendedStrategies.push("Utiliser des graphiques et des diagrammes", "Prendre des notes visuelles", "Regarder des vidéos éducatives");
  } else if (primaryStyle === 'auditory') {
    recommendedStrategies.push("Écouter des podcasts ou des conférences", "Participer à des discussions de groupe", "Enregistrer des notes vocales");
  } else if (primaryStyle === 'kinesthetic') {
    recommendedStrategies.push("Faire des expériences pratiques", "Utiliser des modèles ou des simulations", "Bouger pendant l'étude");
  } else {
    recommendedStrategies.push("Lire des livres et des articles", "Écrire des résumés", "Faire des recherches approfondies");
  }

  // Niveau de confiance basé sur la cohérence des réponses
  const confidenceScore = 75; // valeur par défaut, à affiner si nécessaire

  return {
    visual,
    auditory,
    kinesthetic,
    reading,
    dominantStyle: primaryStyle,
    secondary: secondaryStyle,
    recommendedStrategies,
    confidenceScore
  };
};
