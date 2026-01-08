
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testType, results } = await req.json();
    console.log(`Analyzing ${testType} test results:`, JSON.stringify(results).substring(0, 200) + "...");

    // Initialize analysis data structure
    const analysis = {
      personalityInsights: [],
      careerRecommendations: [],
      learningPathways: [],
      strengthWeaknessAnalysis: [],
      developmentSuggestions: [],
      confidenceScore: results.confidenceScore || 75
    };

    // Analyze based on test type and results
    switch (testType) {
      case 'RIASEC':
        return analyzeRiasecResults(results, analysis);
      case 'emotional':
        return analyzeEmotionalResults(results, analysis);
      case 'learning_style':
        return analyzeLearningStyleResults(results, analysis);
      case 'multiple_intelligence':
        return analyzeMultipleIntelligenceResults(results, analysis);
      case 'career_transition':
        return analyzeCareerTransitionResults(results, analysis);
      case 'retirement_readiness':
        return analyzeRetirementReadinessResults(results, analysis);
      case 'senior_employment':
        return analyzeSeniorEmploymentResults(results, analysis);
      case 'no_diploma_career':
        return analyzeNoDiplomaCareerResults(results, analysis);
      default:
        throw new Error(`Unsupported test type: ${testType}`);
    }
  } catch (error) {
    console.error(`Error analyzing test results:`, error);
    return new Response(
      JSON.stringify({
        personalityInsights: ["Une erreur est survenue lors de l'analyse de vos résultats."],
        careerRecommendations: ["Essayez de refaire le test ou contactez notre support."],
        confidenceScore: 50,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzeRiasecResults(results, baseAnalysis) {
  const { realistic, investigative, artistic, social, enterprising, conventional } = results;
  const dominantTypes = getDominantTypes(results);
  
  // Enhanced personality insights
  if (dominantTypes.includes('R') && dominantTypes.includes('I')) {
    baseAnalysis.personalityInsights.push("Vous avez un profil technique et analytique, vous aimez résoudre des problèmes concrets.");
    baseAnalysis.personalityInsights.push("Vous préférez travailler avec des données et des objets plutôt qu'avec des personnes.");
  } else if (dominantTypes.includes('A') && dominantTypes.includes('S')) {
    baseAnalysis.personalityInsights.push("Vous avez un profil créatif et social, vous aimez exprimer vos idées et aider les autres.");
    baseAnalysis.personalityInsights.push("Vous êtes à l'aise dans les environnements collaboratifs et expressifs.");
  } else if (dominantTypes.includes('E') && dominantTypes.includes('C')) {
    baseAnalysis.personalityInsights.push("Vous avez un profil organisé et entrepreneurial, vous aimez diriger et structurer.");
    baseAnalysis.personalityInsights.push("Vous excellez dans la gestion de projets et l'optimisation de processus.");
  }

  // Career recommendations based on dominant types
  if (realistic > 70) {
    baseAnalysis.careerRecommendations.push("Métiers techniques: ingénieur, mécanicien, électricien");
    baseAnalysis.careerRecommendations.push("Secteurs: construction, industrie, agriculture");
  }
  if (investigative > 70) {
    baseAnalysis.careerRecommendations.push("Métiers scientifiques: chercheur, analyste de données, médecin");
    baseAnalysis.careerRecommendations.push("Secteurs: recherche, santé, technologies");
  }
  if (artistic > 70) {
    baseAnalysis.careerRecommendations.push("Métiers créatifs: designer, artiste, écrivain");
    baseAnalysis.careerRecommendations.push("Secteurs: arts, culture, communication");
  }

  // Learning pathways
  baseAnalysis.learningPathways.push(`Privilégiez des formations qui correspondent à vos types dominants: ${dominantTypes.join(', ')}`);
  baseAnalysis.learningPathways.push("Explorez des certifications professionnelles dans vos domaines d'intérêt");

  // Strengths and weaknesses
  const strengths = getStrengthsFromRiasec(results);
  const weaknesses = getWeaknessesFromRiasec(results);
  baseAnalysis.strengthWeaknessAnalysis = [...strengths, ...weaknesses];

  // Development suggestions
  baseAnalysis.developmentSuggestions.push("Renforcez vos compétences dans vos domaines dominants par des projets personnels");
  baseAnalysis.developmentSuggestions.push("Développez des compétences complémentaires pour équilibrer votre profil");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeEmotionalResults(results, baseAnalysis) {
  const { selfAwareness, selfRegulation, motivation, empathy, socialSkills } = results;
  
  // Personality insights
  baseAnalysis.personalityInsights.push(`Votre intelligence émotionnelle est caractérisée par une forte ${getHighestEmotionalDimension(results)}`);
  if (selfAwareness > 70 && selfRegulation > 70) {
    baseAnalysis.personalityInsights.push("Vous gérez efficacement vos émotions et comprenez bien leur impact sur vous-même et les autres.");
  } else if (empathy > 70 && socialSkills > 70) {
    baseAnalysis.personalityInsights.push("Vous excellez dans les relations interpersonnelles et la compréhension des autres.");
  }

  // Career recommendations
  if (empathy > 70) {
    baseAnalysis.careerRecommendations.push("Métiers d'aide: psychologue, travailleur social, conseiller");
    baseAnalysis.careerRecommendations.push("Secteurs: santé, éducation, services sociaux");
  }
  if (selfRegulation > 70 && motivation > 70) {
    baseAnalysis.careerRecommendations.push("Métiers de leadership: manager, coach, entrepreneur");
    baseAnalysis.careerRecommendations.push("Secteurs: management, conseil, entrepreneuriat");
  }

  // Development suggestions
  if (selfAwareness < 60) {
    baseAnalysis.developmentSuggestions.push("Pratiquez la réflexion personnelle quotidienne pour améliorer votre conscience de soi");
  }
  if (selfRegulation < 60) {
    baseAnalysis.developmentSuggestions.push("Explorez des techniques de méditation pour mieux gérer vos émotions");
  }

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeLearningStyleResults(results, baseAnalysis) {
  const { visual, auditory, kinesthetic, reading } = results;
  const primaryStyle = getPrimaryLearningStyle(results);
  
  // Personality insights
  baseAnalysis.personalityInsights.push(`Votre style d'apprentissage dominant est ${primaryStyle}`);
  baseAnalysis.personalityInsights.push("Vous assimilez mieux l'information lorsqu'elle est présentée de manière compatible avec votre style");

  // Learning pathways
  baseAnalysis.learningPathways.push(`Privilégiez des méthodes d'apprentissage ${primaryStyle.toLowerCase()}`);
  if (visual > 70) {
    baseAnalysis.learningPathways.push("Utilisez des schémas, des graphiques et des vidéos pour apprendre");
  }
  if (auditory > 70) {
    baseAnalysis.learningPathways.push("Préférez les podcasts, discussions et explications verbales");
  }
  if (kinesthetic > 70) {
    baseAnalysis.learningPathways.push("Apprenez par la pratique et l'expérimentation");
  }
  if (reading > 70) {
    baseAnalysis.learningPathways.push("Privilégiez la lecture et la prise de notes");
  }

  // Development suggestions
  baseAnalysis.developmentSuggestions.push("Diversifiez vos méthodes d'apprentissage pour développer vos styles secondaires");
  baseAnalysis.developmentSuggestions.push("Communiquez votre style d'apprentissage à vos formateurs pour optimiser votre progression");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeMultipleIntelligenceResults(results, baseAnalysis) {
  const dominantIntelligences = getDominantIntelligences(results);
  
  // Personality insights
  baseAnalysis.personalityInsights.push(`Vos intelligences dominantes sont: ${dominantIntelligences.join(', ')}`);
  baseAnalysis.personalityInsights.push("Vous possédez un profil cognitif diversifié avec des forces dans plusieurs domaines");

  // Career recommendations
  if (results.linguistic > 70) {
    baseAnalysis.careerRecommendations.push("Métiers de communication: journaliste, écrivain, traducteur");
  }
  if (results.logical > 70) {
    baseAnalysis.careerRecommendations.push("Métiers analytiques: programmeur, économiste, mathématicien");
  }
  if (results.spatial > 70) {
    baseAnalysis.careerRecommendations.push("Métiers visuels: architecte, designer, pilote");
  }

  // Learning pathways
  baseAnalysis.learningPathways.push("Adaptez vos méthodes d'étude à vos intelligences dominantes");
  baseAnalysis.learningPathways.push("Explorez des domaines qui combinent plusieurs de vos intelligences fortes");

  // Development suggestions
  baseAnalysis.developmentSuggestions.push("Développez vos intelligences moins dominantes par des activités ciblées");
  baseAnalysis.developmentSuggestions.push("Utilisez vos intelligences fortes comme leviers pour progresser dans d'autres domaines");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeCareerTransitionResults(results, baseAnalysis) {
  const { currentSatisfaction, skillTransferability, adaptability, riskTolerance } = results;
  
  // Personality insights
  if (currentSatisfaction < 40) {
    baseAnalysis.personalityInsights.push("Votre insatisfaction professionnelle actuelle indique un besoin de changement");
  }
  baseAnalysis.personalityInsights.push(`Votre niveau d'adaptabilité au changement est ${getAdaptabilityLevel(adaptability)}`);

  // Career recommendations
  if (skillTransferability > 70) {
    baseAnalysis.careerRecommendations.push("Vos compétences sont transférables dans de nombreux secteurs");
    baseAnalysis.careerRecommendations.push("Secteurs recommandés: conseil, formation, gestion de projet");
  } else {
    baseAnalysis.careerRecommendations.push("Envisagez une transition progressive avec formation complémentaire");
  }

  // Learning pathways
  baseAnalysis.learningPathways.push("Identifiez les compétences clés à développer pour votre secteur cible");
  baseAnalysis.learningPathways.push("Suivez des formations courtes pour acquérir des compétences spécifiques");

  // Development suggestions
  baseAnalysis.developmentSuggestions.push("Développez votre réseau dans le secteur visé");
  baseAnalysis.developmentSuggestions.push("Commencez par des projets parallèles avant une transition complète");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeRetirementReadinessResults(results, baseAnalysis) {
  const { financialPreparation, healthPlanning, socialConnections, purposeClarity } = results;
  
  // Personality insights
  baseAnalysis.personalityInsights.push(`Votre niveau de préparation globale à la retraite est ${getReadinessLevel(results)}`);
  
  // Areas of focus
  if (financialPreparation < 60) {
    baseAnalysis.strengthWeaknessAnalysis.push("Votre préparation financière nécessite une attention particulière");
  }
  if (purposeClarity < 60) {
    baseAnalysis.strengthWeaknessAnalysis.push("Réfléchissez davantage à comment donner du sens à votre retraite");
  }

  // Development suggestions
  baseAnalysis.developmentSuggestions.push("Établissez un plan financier détaillé pour votre retraite");
  baseAnalysis.developmentSuggestions.push("Développez des centres d'intérêt et activités pour maintenir votre vitalité");
  baseAnalysis.developmentSuggestions.push("Cultivez vos relations sociales hors du cadre professionnel");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeSeniorEmploymentResults(results, baseAnalysis) {
  const { experienceValue, technologyAdaptation, workLifeBalance, mentorshipPotential } = results;
  
  // Personality insights
  baseAnalysis.personalityInsights.push(`Votre expérience professionnelle représente un atout majeur valorisable`);
  
  // Career recommendations
  baseAnalysis.careerRecommendations.push("Rôles de mentor ou conseiller dans votre domaine d'expertise");
  if (technologyAdaptation > 60) {
    baseAnalysis.careerRecommendations.push("Postes techniques nécessitant à la fois expertise et expérience");
  }
  if (workLifeBalance > 70) {
    baseAnalysis.careerRecommendations.push("Postes à temps partiel ou en freelance dans votre secteur");
  }

  // Development suggestions
  if (technologyAdaptation < 60) {
    baseAnalysis.developmentSuggestions.push("Suivez des formations pour mettre à jour vos compétences numériques");
  }
  baseAnalysis.developmentSuggestions.push("Mettez en avant votre expérience comme valeur ajoutée unique");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeNoDiplomaCareerResults(results, baseAnalysis) {
  const { practicalSkills, entrepreneurialAptitude, tradeInterest, selfLearningCapacity } = results;
  
  // Personality insights
  baseAnalysis.personalityInsights.push(`Vous avez des compétences pratiques valorisables sur le marché du travail`);
  
  // Career recommendations
  if (practicalSkills > 70) {
    baseAnalysis.careerRecommendations.push("Métiers manuels: artisanat, service, technique");
  }
  if (entrepreneurialAptitude > 70) {
    baseAnalysis.careerRecommendations.push("Création d'entreprise dans un domaine où vous avez de l'expérience");
  }
  if (tradeInterest > 70) {
    baseAnalysis.careerRecommendations.push("Métiers en apprentissage: plomberie, électricité, cuisine");
  }

  // Learning pathways
  baseAnalysis.learningPathways.push("Visez des certifications professionnelles reconnues dans votre secteur");
  baseAnalysis.learningPathways.push("Développez un portfolio de réalisations concrètes");

  // Development suggestions
  baseAnalysis.developmentSuggestions.push("Valorisez votre expérience et vos compétences pratiques");
  baseAnalysis.developmentSuggestions.push("Construisez un réseau professionnel dans votre domaine cible");

  return new Response(
    JSON.stringify(baseAnalysis),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function getDominantTypes(results) {
  const types = [
    { code: 'R', value: results.realistic },
    { code: 'I', value: results.investigative },
    { code: 'A', value: results.artistic },
    { code: 'S', value: results.social },
    { code: 'E', value: results.enterprising },
    { code: 'C', value: results.conventional }
  ];
  
  // Sort by value (highest first)
  types.sort((a, b) => b.value - a.value);
  
  // Return top 3 types
  return types.slice(0, 3).map(t => t.code);
}

function getStrengthsFromRiasec(results) {
  const strengths = [];
  if (results.realistic > 70) strengths.push("Force: Compétences techniques et manuelles");
  if (results.investigative > 70) strengths.push("Force: Capacités d'analyse et de résolution de problèmes");
  if (results.artistic > 70) strengths.push("Force: Créativité et expression");
  if (results.social > 70) strengths.push("Force: Communication et empathie");
  if (results.enterprising > 70) strengths.push("Force: Leadership et persuasion");
  if (results.conventional > 70) strengths.push("Force: Organisation et attention aux détails");
  return strengths;
}

function getWeaknessesFromRiasec(results) {
  const weaknesses = [];
  if (results.realistic < 30) weaknesses.push("À améliorer: Compétences pratiques et manuelles");
  if (results.investigative < 30) weaknesses.push("À améliorer: Analyse logique et résolution de problèmes");
  if (results.artistic < 30) weaknesses.push("À améliorer: Expression créative");
  if (results.social < 30) weaknesses.push("À améliorer: Compétences relationnelles");
  if (results.enterprising < 30) weaknesses.push("À améliorer: Leadership et prise d'initiative");
  if (results.conventional < 30) weaknesses.push("À améliorer: Organisation et gestion de détails");
  return weaknesses;
}

function getHighestEmotionalDimension(results) {
  const dimensions = [
    { name: "conscience de soi", value: results.selfAwareness },
    { name: "maîtrise de soi", value: results.selfRegulation },
    { name: "motivation", value: results.motivation },
    { name: "empathie", value: results.empathy },
    { name: "compétences sociales", value: results.socialSkills }
  ];
  
  dimensions.sort((a, b) => b.value - a.value);
  return dimensions[0].name;
}

function getPrimaryLearningStyle(results) {
  const styles = [
    { name: "Visuel", value: results.visual },
    { name: "Auditif", value: results.auditory },
    { name: "Kinesthésique", value: results.kinesthetic },
    { name: "Lecture/Écriture", value: results.reading }
  ];
  
  styles.sort((a, b) => b.value - a.value);
  return styles[0].name;
}

function getDominantIntelligences(results) {
  const intelligences = [
    { name: "Linguistique", value: results.linguistic },
    { name: "Logico-mathématique", value: results.logical },
    { name: "Spatiale", value: results.spatial },
    { name: "Musicale", value: results.musical },
    { name: "Corporelle-kinesthésique", value: results.bodily },
    { name: "Interpersonnelle", value: results.interpersonal },
    { name: "Intrapersonnelle", value: results.intrapersonal },
    { name: "Naturaliste", value: results.naturalist }
  ];
  
  intelligences.sort((a, b) => b.value - a.value);
  return intelligences.slice(0, 3).map(i => i.name);
}

function getAdaptabilityLevel(adaptability) {
  if (adaptability > 80) return "très élevé";
  if (adaptability > 60) return "élevé";
  if (adaptability > 40) return "moyen";
  if (adaptability > 20) return "faible";
  return "très faible";
}

function getReadinessLevel(results) {
  const average = (results.financialPreparation + results.healthPlanning + 
                  results.socialConnections + results.purposeClarity + 
                  results.leisureInterests) / 5;
  
  if (average > 80) return "excellent";
  if (average > 60) return "bon";
  if (average > 40) return "moyen";
  if (average > 20) return "faible";
  return "très faible";
}
