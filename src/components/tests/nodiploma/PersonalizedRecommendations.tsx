
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NoDiplomaCareerResults } from "@/types/test";
import { AIEnhancedAnalysis } from "@/types/test";
import { Lightbulb, ChevronDown, ChevronUp, List, MessageSquare } from "lucide-react";

interface PersonalizedRecommendationsProps {
  results: NoDiplomaCareerResults;
  aiInsights?: AIEnhancedAnalysis;
}

export const PersonalizedRecommendations = ({ results, aiInsights }: PersonalizedRecommendationsProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("strengths");

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const recommendations = aiInsights?.recommendations || [
    "Développez un portfolio de projets personnels pour démontrer vos compétences pratiques",
    "Recherchez des certifications professionnelles courtes dans des domaines techniques",
    "Explorez les possibilités d'apprentissage en alternance pour acquérir une expérience pratique",
    "Construisez votre réseau professionnel en rejoignant des communautés en ligne dans votre domaine d'intérêt",
    "Développez vos compétences entrepreneuriales à travers des micro-projets"
  ];

  const strengths = aiInsights?.strengths || [
    "Bonnes compétences pratiques et manuelles",
    "Capacité d'auto-apprentissage élevée",
    "Bonne intelligence sociale et relationnelle",
    "Niveau de résilience appréciable",
    "Créativité applicable dans divers contextes professionnels"
  ];

  const weaknesses = aiInsights?.weaknesses || [
    "Manque de diplôme formel pouvant limiter certaines opportunités",
    "Besoin de renforcer les compétences entrepreneuriales",
    "Portefeuille d'expérience à développer davantage",
    "Nécessité de structurer l'approche d'auto-formation"
  ];

  const careerPotentialLevel = () => {
    const score = results.careerPotential || 60;
    if (score >= 80) return { level: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (score >= 65) return { level: "Bon", color: "text-blue-600 dark:text-blue-400" };
    if (score >= 50) return { level: "Moyen", color: "text-yellow-600 dark:text-yellow-400" };
    return { level: "À développer", color: "text-orange-600 dark:text-orange-400" };
  };

  const potentialInfo = careerPotentialLevel();

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-900/30 dark:to-yellow-900/30">
        <CardTitle className="text-xl text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommandations personnalisées
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-lg font-medium mb-2">
            Potentiel professionnel: <span className={potentialInfo.color}>{potentialInfo.level}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Score: {results.careerPotential || 60}/100
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full"
              style={{ width: `${results.careerPotential || 60}%` }}
            ></div>
          </div>
        </div>

        <Button
          variant="ghost" 
          className="w-full text-left justify-between p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 mb-2"
          onClick={() => toggleSection("strengths")}
        >
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">Vos points forts</span>
          </div>
          {expandedSection === "strengths" ? <ChevronUp /> : <ChevronDown />}
        </Button>
        
        {expandedSection === "strengths" && (
          <div className="pl-10 pr-4 pb-4">
            <ul className="list-disc space-y-1 text-gray-600 dark:text-gray-400">
              {strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Button
          variant="ghost" 
          className="w-full text-left justify-between p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 mb-2"
          onClick={() => toggleSection("weaknesses")}
        >
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">Points à améliorer</span>
          </div>
          {expandedSection === "weaknesses" ? <ChevronUp /> : <ChevronDown />}
        </Button>
        
        {expandedSection === "weaknesses" && (
          <div className="pl-10 pr-4 pb-4">
            <ul className="list-disc space-y-1 text-gray-600 dark:text-gray-400">
              {weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Button
          variant="ghost" 
          className="w-full text-left justify-between p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 mb-2"
          onClick={() => toggleSection("recommendations")}
        >
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">Actions recommandées</span>
          </div>
          {expandedSection === "recommendations" ? <ChevronUp /> : <ChevronDown />}
        </Button>
        
        {expandedSection === "recommendations" && (
          <div className="pl-10 pr-4 pb-4">
            <ol className="list-decimal space-y-2 text-gray-600 dark:text-gray-400">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ol>
          </div>
        )}

        <Separator className="my-6" />
        
        <Button variant="outline" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Discuter avec un conseiller
        </Button>
      </CardContent>
    </Card>
  );
};
