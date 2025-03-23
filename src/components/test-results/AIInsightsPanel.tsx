
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
          {data.strengths && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Points forts</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.strengths) ? data.strengths.map((strength: string, index: number) => (
                  <li key={index}>{strength}</li>
                )) : <li>{data.strengths}</li>}
              </ul>
            </div>
          )}
          
          {data.weaknesses && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Points à améliorer</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.weaknesses) ? data.weaknesses.map((weakness: string, index: number) => (
                  <li key={index}>{weakness}</li>
                )) : <li>{data.weaknesses}</li>}
              </ul>
            </div>
          )}
          
          {data.recommendations && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Recommandations</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.recommendations) ? data.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                )) : <li>{data.recommendations}</li>}
              </ul>
            </div>
          )}
          
          {data.careerSuggestions && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Suggestions de carrière</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                {Array.isArray(data.careerSuggestions) ? data.careerSuggestions.map((career: string, index: number) => (
                  <li key={index}>{career}</li>
                )) : <li>{data.careerSuggestions}</li>}
              </ul>
            </div>
          )}
          
          {data.analysis && (
            <div>
              <h4 className="text-md font-semibold text-purple-700">Analyse détaillée</h4>
              <p className="text-sm text-gray-600 mt-1">{data.analysis}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
