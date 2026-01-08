
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AIInsightsPanelProps {
  testType: string;
  analysis?: any;
  insights?: any;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ testType, analysis, insights }) => {
  // Utiliser insights ou analysis selon ce qui est fourni
  const data = insights || analysis || {};
  
  return (
    <Card className="mt-4 border border-purple-200">
      <CardContent className="p-4 text-left">
        <div className="space-y-3">
          {data.strengths && data.strengths.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Points forts</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.strengths) ? data.strengths.map((strength: string, index: number) => (
                  <li key={index}>{strength}</li>
                )) : <li>{data.strengths}</li>}
              </ul>
            </div>
          )}
          
          {data.weaknesses && data.weaknesses.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Points à améliorer</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.weaknesses) ? data.weaknesses.map((weakness: string, index: number) => (
                  <li key={index}>{weakness}</li>
                )) : <li>{data.weaknesses}</li>}
              </ul>
            </div>
          )}
          
          {data.recommendations && data.recommendations.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Recommandations</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.recommendations) ? data.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                )) : <li>{data.recommendations}</li>}
              </ul>
            </div>
          )}
          
          {data.careerSuggestions && data.careerSuggestions.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Suggestions de carrière</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.careerSuggestions) ? data.careerSuggestions.map((career: string, index: number) => (
                  <li key={index}>{career}</li>
                )) : <li>{data.careerSuggestions}</li>}
              </ul>
            </div>
          )}
          
          {data.developmentSuggestions && data.developmentSuggestions.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Suggestions de développement</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.developmentSuggestions) ? data.developmentSuggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                )) : <li>{data.developmentSuggestions}</li>}
              </ul>
            </div>
          )}
          
          {data.learningPathways && data.learningPathways.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Parcours d'apprentissage</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.learningPathways) ? data.learningPathways.map((pathway: string, index: number) => (
                  <li key={index}>{pathway}</li>
                )) : <li>{data.learningPathways}</li>}
              </ul>
            </div>
          )}
          
          {/* Affichage des recommendedStrategies si disponible */}
          {data.recommendedStrategies && data.recommendedStrategies.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Stratégies recommandées</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.recommendedStrategies) ? data.recommendedStrategies.map((strategy: string, index: number) => (
                  <li key={index}>{strategy}</li>
                )) : <li>{data.recommendedStrategies}</li>}
              </ul>
            </div>
          )}
          
          {data.analysis && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Analyse détaillée</h4>
              <p className="text-sm text-gray-600 mt-1">{data.analysis}</p>
            </div>
          )}
          
          {data.confidenceScore && (
            <div className="mt-4 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                Indice de confiance de l'analyse : {data.confidenceScore}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
