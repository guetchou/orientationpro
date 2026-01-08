
import { CareerTransitionResults } from "@/types/test";

export const analyzeCareerTransitionResults = (responses: number[]): CareerTransitionResults => {
  // Calcul des scores pour chaque dimension
  const currentSatisfaction = responses[0] || 50;
  const skillTransferability = responses[1] || 50;
  const adaptability = responses[2] || 50;
  const riskTolerance = responses[3] || 50;
  const learningCapacity = responses[4] || 50;

  // Calcul du score de préparation à la transition
  const transitionReadiness = Math.round(
    (currentSatisfaction * 0.1) + // moins on est satisfait, plus on est prêt à changer
    (skillTransferability * 0.25) +
    (adaptability * 0.25) +
    (riskTolerance * 0.2) +
    (learningCapacity * 0.2)
  );

  // Recommandations de secteurs basées sur les réponses
  const recommendedSectors: string[] = [];
  if (skillTransferability > 70 && learningCapacity > 70) {
    recommendedSectors.push("Technologie", "Conseil", "Formation");
  } else if (adaptability > 70 && riskTolerance > 70) {
    recommendedSectors.push("Entrepreneuriat", "Vente", "Marketing");
  } else if (currentSatisfaction < 30) {
    recommendedSectors.push("Services sociaux", "Éducation", "Environnement");
  } else {
    recommendedSectors.push("Gestion de projet", "Ressources humaines", "Administration");
  }
  
  // Recommandations de parcours basées sur les réponses
  const recommendedPaths: string[] = [];
  if (learningCapacity > 70) {
    recommendedPaths.push("Formation continue", "Reconversion académique");
  } else if (riskTolerance > 70) {
    recommendedPaths.push("Entrepreneuriat", "Freelance");
  } else {
    recommendedPaths.push("Évolution interne", "Changement progressif");
  }

  // Niveau de confiance basé sur la cohérence des réponses
  const confidenceScore = 85; // valeur par défaut, à affiner si nécessaire

  return {
    currentSatisfaction,
    skillTransferability,
    adaptability,
    riskTolerance,
    learningCapacity,
    recommendedSectors,
    recommendedPaths,
    transitionReadiness,
    confidenceScore
  };
};
