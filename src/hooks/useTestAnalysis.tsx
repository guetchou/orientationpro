
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIEnhancedAnalysis } from "@/types/test";

interface TestAnalysisOptions {
  testId?: string;
  testType: string;
  results: any;
}

export function useTestAnalysis({ testId, testType, results }: TestAnalysisOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIEnhancedAnalysis | null>(null);
  
  const generateAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      // Simulate AI analysis if test Edge Function doesn't respond
      let data: any;
      
      try {
        // Essayer d'appeler la fonction Edge de Supabase pour analyser les résultats
        const response = await supabase.functions.invoke("analyze-test-results", {
          body: { testType, results }
        });
        
        if (response.error) throw new Error(response.error.message);
        data = response.data;
      } catch (error) {
        console.log("Edge function error, using fallback analysis generation", error);
        // Génération de repli si la fonction Edge échoue
        data = generateFallbackAnalysis(testType, results);
      }
      
      // Format the received or generated analysis
      const formattedAnalysis: AIEnhancedAnalysis = {
        strengths: data.personalityInsights || data.strengths || [],
        weaknesses: data.weaknesses || data.areas_to_improve || 
          data.strengthWeaknessAnalysis?.filter((item: string) => 
            item.toLowerCase().includes("améliorer")
          ) || [],
        recommendations: data.careerRecommendations || data.recommendations || [],
        developmentSuggestions: data.developmentSuggestions || data.learning_pathways || [],
        learningPathways: data.learningPathways || [],
        analysis: data.analysis || `Analyse basée sur vos résultats du test ${testType.toUpperCase()}. Cette analyse a identifié vos forces et axes d'amélioration, avec des recommandations personnalisées.`,
        confidenceScore: data.confidenceScore || 85
      };
      
      setAnalysis(formattedAnalysis);
      
      // Si nous avons un ID de test, mettre à jour le résultat du test avec l'analyse
      if (testId) {
        const { error: updateError } = await supabase
          .from('test_results')
          .update({ 
            results: {
              ...results,
              aiInsights: formattedAnalysis 
            }
          })
          .eq('id', testId);
          
        if (updateError) {
          console.error("Error updating test results with analysis:", updateError);
          toast.error("Erreur lors de la mise à jour des résultats du test");
        } else {
          toast.success("Analyse générée avec succès");
        }
      }
      
      return formattedAnalysis;
    } catch (error: any) {
      console.error("Error generating AI analysis:", error);
      toast.error("Erreur lors de la génération de l'analyse");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Fonction de repli pour générer une analyse si l'API échoue
  const generateFallbackAnalysis = (testType: string, results: any) => {
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];
    const developmentSuggestions = [];
    
    // Analyser les scores dans les résultats
    Object.entries(results).forEach(([key, value]) => {
      if (typeof value === 'number' && !key.includes('confidence') && !key.includes('score')) {
        const score = value as number;
        if (score > 70) {
          strengths.push(`Bonne maîtrise de ${key.replace(/_/g, ' ')}`);
        } else if (score < 50) {
          weaknesses.push(`Potentiel d'amélioration en ${key.replace(/_/g, ' ')}`);
        }
      }
    });
    
    // Ajouter des recommandations génériques basées sur le type de test
    switch (testType) {
      case 'riasec':
        recommendations.push(
          "Explorer des métiers alignés avec vos types dominants",
          "Rencontrer des professionnels exerçant dans les domaines suggérés",
          "Suivre des cours en ligne pour développer vos compétences"
        );
        break;
        
      case 'emotional':
        recommendations.push(
          "Pratiquer la pleine conscience pour améliorer votre intelligence émotionnelle",
          "Tenir un journal de vos émotions quotidiennes",
          "Lire des livres sur le développement personnel"
        );
        break;
        
      case 'learning_style':
        recommendations.push(
          "Adapter vos méthodes d'étude à votre style d'apprentissage dominant",
          "Expérimenter avec différentes techniques d'apprentissage",
          "Utiliser des outils adaptés à votre style préférentiel"
        );
        break;
        
      case 'career_transition':
        recommendations.push(
          "Créer un plan de transition de carrière progressif",
          "Acquérir de nouvelles compétences dans le domaine visé",
          "Effectuer du réseautage dans votre nouveau secteur d'intérêt"
        );
        break;
        
      case 'multiple_intelligence':
        recommendations.push(
          "Développer des activités qui stimulent vos intelligences dominantes",
          "Explorer des métiers qui valorisent vos intelligences naturelles",
          "Travailler sur vos intelligences moins développées avec des exercices ciblés"
        );
        break;
        
      case 'no_diploma_career':
        recommendations.push(
          "Explorer des formations professionnelles courtes dans vos domaines d'intérêt",
          "Développer un portfolio de compétences pratiques",
          "Rechercher des mentors dans votre domaine d'intérêt"
        );
        break;
        
      default:
        recommendations.push(
          "Approfondir vos connaissances dans vos domaines de prédilection",
          "Travailler sur vos points d'amélioration progressivement",
          "Consulter un conseiller en orientation pour affiner votre parcours"
        );
    }
    
    // Ajouter quelques suggestions de développement génériques
    developmentSuggestions.push(
      "Suivre des formations en ligne sur des plateformes comme Coursera ou OpenClassrooms",
      "Rejoindre des groupes professionnels liés à vos intérêts",
      "Participer à des événements de réseautage dans votre secteur"
    );
    
    return {
      personalityInsights: strengths,
      strengthWeaknessAnalysis: [...strengths, ...weaknesses],
      careerRecommendations: recommendations,
      developmentSuggestions,
      learningPathways: developmentSuggestions,
      analysis: `Analyse générée pour vos résultats du test ${testType.toUpperCase()}.`,
      confidenceScore: 80
    };
  };
  
  return {
    generateAnalysis,
    isAnalyzing,
    analysis
  };
}
