
import { LearningStyleResults } from "@/types/test";

export function analyzeLearningStyleResults(responses: any[]): LearningStyleResults {
  // Calculer les scores pour chaque dimension
  const visual = Math.round((responses[0] || 3) * 20);
  const auditory = Math.round((responses[1] || 3) * 20);
  const kinesthetic = Math.round((responses[2] || 3) * 20);
  
  // Déterminer les styles primaire et secondaire
  let primary = 'visual';
  let secondary = 'auditory';
  
  if (visual >= auditory && visual >= kinesthetic) {
    primary = 'visual';
    secondary = auditory >= kinesthetic ? 'auditory' : 'kinesthetic';
  } else if (auditory >= visual && auditory >= kinesthetic) {
    primary = 'auditory';
    secondary = visual >= kinesthetic ? 'visual' : 'kinesthetic';
  } else {
    primary = 'kinesthetic';
    secondary = visual >= auditory ? 'visual' : 'auditory';
  }
  
  // Créer des recommandations basées sur le style primaire
  const recommendations = [];
  
  if (primary === 'visual') {
    recommendations.push(
      "Utiliser des supports visuels comme des schémas et des graphiques",
      "Prendre des notes colorées avec des symboles",
      "Visualiser les informations à mémoriser"
    );
  } else if (primary === 'auditory') {
    recommendations.push(
      "Participer à des discussions de groupe",
      "Lire à haute voix les informations importantes",
      "Enregistrer et réécouter les cours"
    );
  } else {
    recommendations.push(
      "Apprendre par la pratique et l'expérimentation",
      "Utiliser des jeux de rôle et des simulations",
      "Étudier tout en marchant ou en bougeant"
    );
  }
  
  return {
    visual,
    auditory,
    kinesthetic,
    primary,
    secondary,
    dominantStyle: primary,
    recommendedStrategies: recommendations,
    recommendations,
    confidenceScore: 85
  };
}
