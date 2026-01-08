
import { LearningStyleResults, EmotionalTestResults, TestResult, RiasecResults, MultipleIntelligenceResults } from "@/types/dashboard";
import { supabase } from "@/lib/supabaseClient";

export function analyzeLearningStyle(answers: Record<string, number>): LearningStyleResults {
  // Calculer les scores pour chaque style d'apprentissage
  let visual = 0;
  let auditory = 0;
  let kinesthetic = 0;

  // Supposons que les questions sont réparties par style
  Object.entries(answers).forEach(([questionId, value]) => {
    if (questionId.startsWith('v')) visual += value;
    else if (questionId.startsWith('a')) auditory += value;
    else if (questionId.startsWith('k')) kinesthetic += value;
  });

  // Déterminer les styles primaire et secondaire
  const styles = [
    { type: 'visual', score: visual },
    { type: 'auditory', score: auditory },
    { type: 'kinesthetic', score: kinesthetic }
  ].sort((a, b) => b.score - a.score);

  return {
    visual,
    auditory,
    kinesthetic,
    primary: styles[0].type,
    secondary: styles[1].type
  };
}

export function analyzeEmotionalIntelligence(answers: Record<string, number>): EmotionalTestResults {
  // Calculer les scores pour chaque compétence émotionnelle
  let selfAwareness = 0;
  let selfRegulation = 0;
  let motivation = 0;
  let empathy = 0;
  let socialSkills = 0;

  // Supposons que les questions sont catégorisées par compétence
  Object.entries(answers).forEach(([questionId, value]) => {
    if (questionId.startsWith('sa')) selfAwareness += value;
    else if (questionId.startsWith('sr')) selfRegulation += value;
    else if (questionId.startsWith('mo')) motivation += value;
    else if (questionId.startsWith('em')) empathy += value;
    else if (questionId.startsWith('ss')) socialSkills += value;
  });

  // Calculer le score global
  const overallScore = (selfAwareness + selfRegulation + motivation + empathy + socialSkills) / 5;

  return {
    selfAwareness,
    selfRegulation,
    motivation,
    empathy,
    socialSkills,
    overallScore
  };
}

export function analyzeTestResults(testType: string, answers: Record<string, number>): TestResult {
  switch(testType) {
    case 'learning-style':
      return {
        type: 'learning-style',
        data: analyzeLearningStyle(answers)
      };
    case 'emotional':
      return {
        type: 'emotional',
        data: analyzeEmotionalIntelligence(answers)
      };
    case 'riasec':
      // We'll return a placeholder for RIASEC tests
      return {
        type: 'riasec',
        data: {
          realistic: calculateCategoryScore(answers, 'r'),
          investigative: calculateCategoryScore(answers, 'i'),
          artistic: calculateCategoryScore(answers, 'a'),
          social: calculateCategoryScore(answers, 's'),
          enterprising: calculateCategoryScore(answers, 'e'),
          conventional: calculateCategoryScore(answers, 'c')
        }
      };
    case 'multiple-intelligence':
      // Placeholder for multiple intelligence
      return {
        type: 'multiple-intelligence',
        data: {
          linguistic: calculateCategoryScore(answers, 'ling'),
          logical: calculateCategoryScore(answers, 'log'),
          spatial: calculateCategoryScore(answers, 'spat'),
          musical: calculateCategoryScore(answers, 'mus'),
          bodily: calculateCategoryScore(answers, 'bod'),
          interpersonal: calculateCategoryScore(answers, 'inter'),
          intrapersonal: calculateCategoryScore(answers, 'intra'),
          naturalist: calculateCategoryScore(answers, 'nat')
        }
      };
    default:
      throw new Error(`Unknown test type: ${testType}`);
  }
}

// Renamed function to avoid duplicate declaration
export async function analyzeUserTestResults(userId: string) {
  try {
    // Fetch all test results for the user
    const { data: testData, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Calculate strengths based on test results
    const strengths: string[] = [];
    let riasecProfile: any = null;
    let learningProfile: any = null;
    
    testData?.forEach(test => {
      if (test.test_type === 'RIASEC' || test.test_type === 'riasec') {
        riasecProfile = test.results;
        // Get top two RIASEC categories
        const sorted = Object.entries(test.results).sort((a: any, b: any) => b[1] - a[1]);
        if (sorted.length >= 1) {
          const topCategory = sorted[0][0];
          const strengthMap: Record<string, string> = {
            realistic: "Aptitudes pratiques et manuelles",
            investigative: "Capacités d'analyse et de recherche",
            artistic: "Créativité et expression artistique",
            social: "Compétences interpersonnelles et d'aide",
            enterprising: "Leadership et persuasion",
            conventional: "Organisation et attention aux détails"
          };
          
          if (strengthMap[topCategory]) {
            strengths.push(strengthMap[topCategory]);
          }
        }
      }
      
      if (test.test_type === 'learning_style') {
        learningProfile = test.results;
        const topStyle = Object.entries(test.results).sort((a: any, b: any) => b[1] - a[1])[0][0];
        const learningMap: Record<string, string> = {
          visual: "Apprentissage par l'observation et les supports visuels",
          auditory: "Apprentissage par l'écoute et les discussions",
          reading: "Apprentissage par la lecture et l'écriture",
          kinesthetic: "Apprentissage par la pratique et l'expérience"
        };
        
        if (learningMap[topStyle]) {
          strengths.push(learningMap[topStyle]);
        }
      }
      
      if (test.test_type === 'emotional') {
        const sorted = Object.entries(test.results).sort((a: any, b: any) => b[1] - a[1]);
        if (sorted.length >= 1) {
          const topSkill = sorted[0][0];
          const emotionalMap: Record<string, string> = {
            selfAwareness: "Forte conscience de soi et introspection",
            selfRegulation: "Excellente maîtrise émotionnelle",
            motivation: "Motivation et persévérance",
            empathy: "Grande capacité d'empathie",
            socialSkills: "Compétences sociales développées"
          };
          
          if (emotionalMap[topSkill]) {
            strengths.push(emotionalMap[topSkill]);
          }
        }
      }
    });
    
    // Generate recommendations based on profiles
    const recommendations = [];
    
    if (riasecProfile) {
      const topCategories = Object.entries(riasecProfile)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 2)
        .map(entry => entry[0]);
      
      // Basic field recommendations based on RIASEC combinations
      const fieldRecommendations: Record<string, any> = {
        'realistic-investigative': {
          field: "Sciences de l'ingénieur",
          reason: "Vos compétences pratiques et analytiques vous prédisposent aux métiers techniques nécessitant rigueur et résolution de problèmes.",
          matchingProfiles: Math.floor(Math.random() * 500) + 300
        },
        'artistic-social': {
          field: "Enseignement des arts",
          reason: "Votre créativité et vos aptitudes sociales vous permettraient d'exceller dans la transmission de connaissances artistiques.",
          matchingProfiles: Math.floor(Math.random() * 500) + 200
        },
        'social-enterprising': {
          field: "Gestion des ressources humaines",
          reason: "Vos compétences relationnelles et de leadership sont idéales pour comprendre et diriger des équipes.",
          matchingProfiles: Math.floor(Math.random() * 500) + 400
        },
        'investigative-artistic': {
          field: "Recherche et innovation",
          reason: "Votre esprit analytique couplé à votre créativité vous permet d'aborder les problèmes avec originalité.",
          matchingProfiles: Math.floor(Math.random() * 500) + 250
        }
      };
      
      // Generate a recommendation based on top categories
      const key = `${topCategories[0]}-${topCategories[1]}`;
      const altKey = `${topCategories[1]}-${topCategories[0]}`;
      
      if (fieldRecommendations[key]) {
        recommendations.push({
          ...fieldRecommendations[key],
          score: Math.random() * 0.3 + 0.7 // Random score between 70% and 100%
        });
      } else if (fieldRecommendations[altKey]) {
        recommendations.push({
          ...fieldRecommendations[altKey],
          score: Math.random() * 0.3 + 0.7
        });
      } else {
        // Fallback recommendation
        recommendations.push({
          field: "Développement professionnel",
          reason: "Votre profil unique suggère que vous pourriez exceller dans des domaines variés. Envisagez d'explorer des carrières qui combinent vos principaux intérêts.",
          matchingProfiles: Math.floor(Math.random() * 300) + 100,
          score: Math.random() * 0.3 + 0.6
        });
      }
    }
    
    return {
      strengths: [...new Set(strengths)], // Remove duplicates
      recommendations
    };
  } catch (error) {
    console.error("Error analyzing test results:", error);
    return {
      strengths: ["Aucune donnée suffisante pour l'analyse"],
      recommendations: []
    };
  }
}

function calculateCategoryScore(answers: Record<string, number>, prefix: string): number {
  let score = 0;
  let count = 0;
  
  Object.entries(answers).forEach(([questionId, value]) => {
    if (questionId.startsWith(prefix)) {
      score += value;
      count++;
    }
  });
  
  return count > 0 ? score / count : 0;
}
