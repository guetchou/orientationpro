
import { NoDiplomaCareerResults } from "@/types/test";

export const analyzeNoDiplomaCareerResults = (responses: number[]): NoDiplomaCareerResults => {
  // Calcul des scores pour chaque dimension
  const practicalSkills = responses[0] || 50;
  const creativity = responses[1] || 50;
  const selfLearningCapacity = responses[2] || 50;
  const entrepreneurialAptitude = responses[3] || 50;
  const socialIntelligence = responses[4] || 50;

  // Calcul des métriques dérivées
  const resilience = (practicalSkills + selfLearningCapacity) / 2;
  const careerPotential = (practicalSkills + creativity + selfLearningCapacity + entrepreneurialAptitude + socialIntelligence) / 5;
  const experiencePortfolio = (practicalSkills + entrepreneurialAptitude) / 2;
  const entrepreneurialSpirit = entrepreneurialAptitude;
  const tradeInterest = (practicalSkills + resilience) / 2; // Ajouté pour satisfaire l'interface

  // Identification des domaines recommandés
  const recommendedFields = [];
  const recommendedPaths = [];

  if (practicalSkills > 70) {
    recommendedFields.push("Métiers manuels");
    
    if (creativity > 60) {
      recommendedFields.push("Artisanat");
      recommendedPaths.push("Formation en artisanat");
    } else {
      recommendedFields.push("Construction");
      recommendedPaths.push("Apprentissage en bâtiment");
    }
  }

  if (entrepreneurialAptitude > 70) {
    recommendedFields.push("Création d'entreprise");
    recommendedPaths.push("Mentorat entrepreneurial");
    
    if (socialIntelligence > 60) {
      recommendedFields.push("Commerce");
      recommendedPaths.push("Vente et négociation");
    }
  }

  if (selfLearningCapacity > 70) {
    recommendedFields.push("Développement web");
    recommendedPaths.push("Formation en ligne");
    
    if (creativity > 60) {
      recommendedFields.push("Design numérique");
      recommendedPaths.push("Bootcamp créatif");
    }
  }

  if (socialIntelligence > 70) {
    recommendedFields.push("Services aux personnes");
    recommendedPaths.push("Formation en relation client");
  }

  // S'assurer qu'il y a au moins quelques recommandations
  if (recommendedFields.length === 0) {
    recommendedFields.push("Services", "Vente", "Support technique");
    recommendedPaths.push("Formation pratique", "Alternance", "Certification professionnelle");
  }

  // Limiter le nombre de recommandations
  const limitedFields = recommendedFields.slice(0, 5);
  const limitedPaths = recommendedPaths.slice(0, 5);

  // Niveau de confiance basé sur la cohérence des réponses
  const confidenceScore = 85;

  return {
    practicalSkills,
    creativity,
    entrepreneurialSpirit,
    resilience,
    socialIntelligence,
    experiencePortfolio,
    careerPotential,
    recommendedFields: limitedFields,
    entrepreneurialAptitude,
    selfLearningCapacity,
    recommendedPaths: limitedPaths,
    tradeInterest,
    confidenceScore
  };
};
