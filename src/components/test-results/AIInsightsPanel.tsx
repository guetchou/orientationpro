
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIEnhancedAnalysis } from '@/types/test';
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Brain, BookOpen, TrendingUp, Users, Sparkles } from "lucide-react";

interface AIInsightsPanelProps {
  insights: AIEnhancedAnalysis;
  testType: string;
}

const AIInsightsPanel = ({ insights, testType }: AIInsightsPanelProps) => {
  if (!insights) return null;

  const getIcon = (section: string) => {
    switch (section) {
      case 'personalityInsights':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'careerRecommendations':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'learningPathways':
        return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'strengthWeaknessAnalysis':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'developmentSuggestions':
        return <Lightbulb className="h-5 w-5 text-orange-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTitle = (section: string): string => {
    switch (section) {
      case 'personalityInsights':
        return 'Analyse de personnalité';
      case 'careerRecommendations':
        return 'Recommandations de carrière';
      case 'learningPathways':
        return 'Parcours d\'apprentissage';
      case 'strengthWeaknessAnalysis':
        return 'Forces et faiblesses';
      case 'developmentSuggestions':
        return 'Suggestions de développement';
      default:
        return section;
    }
  };

  const sections = [
    'personalityInsights',
    'careerRecommendations',
    'learningPathways',
    'strengthWeaknessAnalysis',
    'developmentSuggestions'
  ].filter(section => 
    Array.isArray(insights[section as keyof AIEnhancedAnalysis]) && 
    (insights[section as keyof AIEnhancedAnalysis] as string[]).length > 0
  );

  return (
    <Card className="mb-8 bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Analyse IA Avancée
          </CardTitle>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-slate-700">
            {insights.confidenceScore}% de confiance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section} className="mb-4">
              <div className="flex items-center mb-2">
                {getIcon(section)}
                <h3 className="font-medium text-lg ml-2">{getTitle(section)}</h3>
              </div>
              <ul className="list-disc pl-10 space-y-2">
                {(insights[section as keyof AIEnhancedAnalysis] as string[]).map((item, i) => (
                  <li key={i} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
