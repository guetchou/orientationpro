
import React from 'react';
import { AIEnhancedAnalysis } from '@/types/test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AIInsightsPanelProps {
  analysis: AIEnhancedAnalysis;
  testType: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ analysis, testType }) => {
  if (!analysis) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Analyse IA en cours de génération</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nos algorithmes sont en train d'analyser vos résultats pour générer des insights personnalisés.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.error) {
    return (
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600">Analyse IA indisponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nous n'avons pas pu générer une analyse pour ce test. Veuillez réessayer ultérieurement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl font-semibold">Analyse IA de votre profil {testType}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {analysis.dominantTraits && analysis.dominantTraits.length > 0 && (
          <div className="mb-5">
            <h4 className="font-medium text-lg mb-2">Traits dominants</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.dominantTraits.map((trait, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="mb-5">
            <h4 className="font-medium text-lg mb-2">Vos forces</h4>
            <ul className="space-y-1 list-disc pl-5">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <div className="mb-5">
            <h4 className="font-medium text-lg mb-2">Axes d'amélioration</h4>
            <ul className="space-y-1 list-disc pl-5">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mb-0">
            <h4 className="font-medium text-lg mb-2">Recommandations personnalisées</h4>
            <ul className="space-y-1 list-disc pl-5">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
