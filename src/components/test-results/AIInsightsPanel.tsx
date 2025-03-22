
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIEnhancedAnalysis } from "@/types/test";
import { Skeleton } from "@/components/ui/skeleton";

interface AIInsightsPanelProps {
  analysis: AIEnhancedAnalysis | null;
  loading: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analyse IA</CardTitle>
          <CardDescription>
            {analysis?.error || "Aucune analyse IA disponible pour ce test."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Veuillez compléter le test pour recevoir une analyse approfondie.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyse IA avancée</CardTitle>
        <CardDescription>Basée sur vos réponses et notre modèle d'intelligence artificielle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Traits dominants</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.dominantTraits.map((trait, index) => (
                <li key={index} className="text-sm">{trait}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Combinaisons de traits significatives</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.traitCombinations.length > 0 
                ? analysis.traitCombinations.join(', ') 
                : "Aucune combinaison significative détectée."}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Recommandations personnalisées</h3>
            <p className="text-sm text-muted-foreground">
              Basées sur votre profil {analysis.testType}, nous vous recommandons d'explorer les domaines où vos traits dominants peuvent s'épanouir.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
