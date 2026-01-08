
import { MultipleIntelligenceResults } from "@/types/test";

export const analyzeMultipleIntelligence = (responses: string[]): MultipleIntelligenceResults => {
  // Initialiser tous les scores à un niveau de base
  let linguistic = 30;
  let logical = 30;
  let spatial = 30;
  let musical = 30;
  let bodily = 30;
  let interpersonal = 30;
  let intrapersonal = 30;
  let naturalist = 30;

  // Analyser les réponses pour ajuster les scores
  responses.forEach((response, index) => {
    if (index === 0) {
      // Question 1: Comment préférez-vous apprendre ?
      if (response.includes("lisant")) linguistic += 20;
      else if (response.includes("écoutant")) musical += 20;
      else if (response.includes("manipulant")) bodily += 20;
      else if (response.includes("observant")) spatial += 20;
    } else if (index === 1) {
      // Question 2: Quelle activité vous attire ?
      if (response.includes("énigmes")) logical += 20;
      else if (response.includes("instrument")) musical += 20;
      else if (response.includes("sport")) bodily += 20;
      else if (response.includes("dessiner")) spatial += 20;
    } else if (index === 2) {
      // Question 3: Organisation des idées
      if (response.includes("listes")) logical += 20;
      else if (response.includes("cartes mentales")) intrapersonal += 20;
      else if (response.includes("discutant")) interpersonal += 20;
      else if (response.includes("croquis")) spatial += 20;
    }
  });

  // Trouver les intelligences dominantes
  const intelligences = [
    { name: "Linguistique", score: linguistic },
    { name: "Logico-mathématique", score: logical },
    { name: "Spatiale", score: spatial },
    { name: "Musicale", score: musical },
    { name: "Corporelle-kinesthésique", score: bodily },
    { name: "Interpersonnelle", score: interpersonal },
    { name: "Intrapersonnelle", score: intrapersonal },
    { name: "Naturaliste", score: naturalist }
  ];
  
  intelligences.sort((a, b) => b.score - a.score);
  const dominantIntelligences = intelligences.slice(0, 3).map(i => i.name);

  return {
    linguistic,
    logical,
    spatial,
    musical,
    bodily,
    interpersonal,
    intrapersonal,
    naturalist,
    dominantIntelligences,
    confidenceScore: 80
  };
};
