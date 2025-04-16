
import { supabase } from "@/integrations/supabase/client";
import { AIEnhancedAnalysis } from "@/types/test";

/**
 * Obtient l'analyse avancée des résultats de tests par IA
 * @param testType Le type de test
 * @param results Les résultats du test à analyser
 */
export async function getAIEnhancedAnalysis(
  testType: string, 
  results: any
): Promise<AIEnhancedAnalysis> {
  try {
    console.log(`Generating AI analysis for ${testType} test...`);

    // Tente d'appeler la fonction Edge de Supabase pour l'analyse
    let data: any;
    try {
      const response = await supabase.functions.invoke("analyze-test-results", {
        body: { testType, results }
      });
      
      if (response.error) throw new Error(response.error.message);
      data = response.data;
    } catch (error) {
      console.warn("Edge function error, using fallback analysis", error);
      // Génération d'analyse de secours
      data = generateLocalAnalysis(testType, results);
    }
    
    // Format the received analysis
    const formattedAnalysis: AIEnhancedAnalysis = {
      strengths: data.personalityInsights || data.strengths || [],
      weaknesses: data.weaknesses || 
        data.strengthWeaknessAnalysis?.filter((item: string) => 
          item.toLowerCase().includes("améliorer")
        ) || [],
      recommendations: data.careerRecommendations || data.recommendations || [],
      developmentSuggestions: data.developmentSuggestions || [],
      learningPathways: data.learningPathways || [],
      analysis: data.analysis || `Analyse basée sur vos résultats du test ${testType.toUpperCase()}. Cette analyse a identifié vos forces principales et axes d'amélioration, avec des recommandations personnalisées.`,
      confidenceScore: data.confidenceScore || 85
    };
    
    // Ajouter des recommandations spécifiques basées sur le type de test
    enhanceAnalysisWithTestSpecificData(formattedAnalysis, testType, results);
    
    return formattedAnalysis;
  } catch (error) {
    console.error("Error in AI analysis:", error);
    
    // Fournit une analyse par défaut pour éviter les erreurs
    return {
      strengths: ["Force : adaptabilité", "Force : curiosité intellectuelle"],
      weaknesses: ["Point à améliorer : confiance en soi", "Point à améliorer : organisation"],
      recommendations: ["Explorer des formations dans votre domaine d'intérêt", "Consulter un conseiller professionnel"],
      developmentSuggestions: ["Suivre des cours en ligne", "Rejoindre des groupes professionnels"],
      learningPathways: ["Formation autodidacte", "Mentorat"],
      analysis: `Analyse basée sur vos résultats du test ${testType.toUpperCase()}. Nous avons identifié vos forces et axes d'amélioration principaux.`,
      confidenceScore: 75
    };
  }
}

/**
 * Génère une analyse simple des résultats sans accès à l'API
 */
function generateLocalAnalysis(testType: string, results: any) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  // Analyser les scores dans les résultats
  Object.entries(results).forEach(([key, value]) => {
    if (typeof value === 'number' && !key.includes('confidence') && !key.includes('score')) {
      const score = value as number;
      if (score > 70) {
        strengths.push(`Bonne maîtrise de ${key.replace(/_/g, ' ')}`);
      } else if (score < 50) {
        weaknesses.push(`Point à améliorer : ${key.replace(/_/g, ' ')}`);
      }
    }
  });
  
  // Ajouter des recommandations spécifiques selon le type de test
  if (testType === 'riasec') {
    recommendations.push(
      "Explorer des métiers liés à vos types dominants",
      "Développer vos compétences dans vos domaines d'intérêt",
      "Rencontrer des professionnels exerçant dans les domaines suggérés"
    );
  } else if (testType === 'learning_style') {
    recommendations.push(
      "Adapter vos méthodes d'étude à votre style d'apprentissage",
      "Utiliser des outils et ressources adaptés à votre style préférentiel",
      "Explorer différentes techniques d'apprentissage"
    );
  } else if (testType === 'emotional') {
    recommendations.push(
      "Pratiquer la pleine conscience pour améliorer votre intelligence émotionnelle",
      "Développer votre empathie par des exercices quotidiens",
      "Tenir un journal de vos émotions"
    );
  } else if (testType === 'multiple_intelligence') {
    recommendations.push(
      "Cultiver vos intelligences dominantes par des activités ciblées",
      "Explorer des carrières qui valorisent vos intelligences naturelles",
      "Équilibrer votre développement personnel en travaillant sur vos différentes intelligences"
    );
  } else if (testType === 'no_diploma_career') {
    recommendations.push(
      "Identifier des formations courtes dans vos domaines d'intérêt",
      "Développer un portfolio de compétences pratiques",
      "Explorer les certifications professionnelles accessibles sans diplôme"
    );
  } else {
    recommendations.push(
      "Approfondir vos connaissances dans vos domaines de prédilection",
      "Travailler sur vos points d'amélioration progressivement",
      "Consulter un conseiller en orientation pour affiner votre parcours"
    );
  }
  
  const developmentSuggestions = [
    "Suivre des formations en ligne pour développer vos compétences",
    "Rejoindre des groupes professionnels liés à vos intérêts",
    "Construire un portfolio de projets personnels"
  ];
  
  return {
    personalityInsights: strengths,
    strengthWeaknessAnalysis: [...strengths, ...weaknesses],
    careerRecommendations: recommendations,
    developmentSuggestions,
    learningPathways: developmentSuggestions,
    analysis: `Analyse générée localement pour vos résultats du test ${testType.toUpperCase()}.`,
    confidenceScore: 80
  };
}

/**
 * Enrichit l'analyse avec des données spécifiques au type de test
 */
function enhanceAnalysisWithTestSpecificData(analysis: AIEnhancedAnalysis, testType: string, results: any) {
  // Ajouter des informations spécifiques selon le type de test
  switch (testType) {
    case 'riasec':
      if (results.dominantTypes && results.dominantTypes.length > 0) {
        const riasecMap: Record<string, string> = {
          'R': 'Réaliste - préférence pour les activités pratiques et manuelles',
          'I': 'Investigateur - intérêt pour la recherche et l'analyse',
          'A': 'Artistique - attirance pour la création et l'expression',
          'S': 'Social - facilité à aider et communiquer avec les autres',
          'E': 'Entreprenant - aptitude à diriger et influencer',
          'C': 'Conventionnel - goût pour l'organisation et la structure'
        };
        
        const dominantTypesExplanation = results.dominantTypes
          .map((type: string) => riasecMap[type] || type)
          .filter(Boolean);
        
        analysis.analysis = `Votre profil RIASEC est caractérisé par une dominante ${dominantTypesExplanation.join(', ')}. ${analysis.analysis}`;
      }
      break;
      
    case 'learning_style':
      if (results.primary) {
        const styleMap: Record<string, string> = {
          'visual': 'apprenant visuel, vous assimilez mieux l\'information par des supports graphiques',
          'auditory': 'apprenant auditif, vous apprenez mieux en écoutant et en discutant',
          'kinesthetic': 'apprenant kinesthésique, vous apprenez mieux par l\'expérimentation et la pratique',
          'reading': 'apprenant par lecture/écriture, vous préférez les informations textuelles'
        };
        
        analysis.analysis = `Vous êtes principalement un ${styleMap[results.primary] || results.primary}. ${analysis.analysis}`;
      }
      break;
  }
  
  // Enrichir les recommandations si elles sont trop génériques
  if (analysis.recommendations.length < 3) {
    switch (testType) {
      case 'emotional':
        analysis.recommendations.push(
          "Pratiquer des exercices de respiration pour gérer le stress",
          "Développer votre vocabulaire émotionnel pour mieux exprimer vos ressentis"
        );
        break;
        
      case 'multiple_intelligence':
        analysis.recommendations.push(
          "Choisir des activités qui combinent plusieurs de vos intelligences dominantes",
          "Explorer des méthodes d'apprentissage adaptées à votre profil"
        );
        break;
    }
  }
}
