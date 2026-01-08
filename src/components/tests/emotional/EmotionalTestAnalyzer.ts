
import { EmotionalResults } from "@/types/test";

export const analyzeEmotionalResults = (answers: number[]): EmotionalResults => {
  // Calculer les résultats pour chaque dimension
  const selfAwareness = Math.round((answers[0] / 5) * 100);
  const selfRegulation = Math.round((answers[1] / 5) * 100);
  const motivation = 70; // valeur par défaut
  const empathy = Math.round((answers[2] / 5) * 100);
  const socialSkills = 65; // valeur par défaut
  const dominantTrait = determineDominantTrait(answers);
  const overallScore = Math.round((answers.reduce((sum, val) => sum + val, 0) / (answers.length * 5)) * 100);
  
  return {
    selfAwareness,
    selfRegulation,
    motivation,
    empathy,
    socialSkills,
    dominantTrait,
    overallScore,
    strengths: ['Conscience de soi', 'Gestion des émotions'],
    areasToImprove: ['Communication émotionnelle'],
    confidenceScore: 85
  };
};

// Fonction pour déterminer le trait dominant
export const determineDominantTrait = (answers: number[]): string => {
  const traits = ["Conscience de soi", "Auto-régulation", "Empathie"];
  const index = answers.indexOf(Math.max(...answers));
  return traits[index] || "Équilibré";
};
