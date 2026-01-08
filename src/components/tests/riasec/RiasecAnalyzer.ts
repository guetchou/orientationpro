
import { RiasecResults } from "@/types/test";
import { questions } from "@/data/riasecQuestions";

export const analyzeRiasecResults = (responses: number[]): RiasecResults => {
  // Initialize the scores RIASEC
  let realistic = 0;
  let investigative = 0;
  let artistic = 0;
  let social = 0;
  let enterprising = 0;
  let conventional = 0;
  
  // Attribuer les réponses aux différentes catégories
  responses.forEach((response, index) => {
    const category = questions[index].category;
    
    switch (category) {
      case 'R':
        realistic += response;
        break;
      case 'I':
        investigative += response;
        break;
      case 'A':
        artistic += response;
        break;
      case 'S':
        social += response;
        break;
      case 'E':
        enterprising += response;
        break;
      case 'C':
        conventional += response;
        break;
    }
  });
  
  // Normaliser les scores sur 100
  const totalResponses = questions.filter(q => q.category === 'R').length;
  realistic = Math.round((realistic / (totalResponses * 5)) * 100);
  investigative = Math.round((investigative / (totalResponses * 5)) * 100);
  artistic = Math.round((artistic / (totalResponses * 5)) * 100);
  social = Math.round((social / (totalResponses * 5)) * 100);
  enterprising = Math.round((enterprising / (totalResponses * 5)) * 100);
  conventional = Math.round((conventional / (totalResponses * 5)) * 100);
  
  // Déterminer les types dominants
  const types = [
    { code: 'R', value: realistic },
    { code: 'I', value: investigative },
    { code: 'A', value: artistic },
    { code: 'S', value: social },
    { code: 'E', value: enterprising },
    { code: 'C', value: conventional }
  ];
  
  types.sort((a, b) => b.value - a.value);
  const dominantTypes = types.slice(0, 3).map(t => t.code);
  const personalityCode = dominantTypes.join('');
  
  return {
    realistic,
    investigative,
    artistic,
    social,
    enterprising,
    conventional,
    dominantTypes,
    personalityCode,
    confidenceScore: 85
  };
};
