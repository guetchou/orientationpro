
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClipboardCopy, Lock, PanelRightOpen } from "lucide-react";
import { toast } from "sonner";
import AIInsightsPanel from './AIInsightsPanel';

interface ResultItemProps {
  itemKey: string;
  value: any;
  index: number;
  hasPaid: boolean;
  testType?: string;
}

const ResultItem = ({ itemKey, value, index, hasPaid, testType }: ResultItemProps) => {
  const [showAiInsights, setShowAiInsights] = React.useState(false);

  const getBadgeColor = (score: number): string => {
    if (score >= 80) return "text-green-700 bg-green-100 border-green-300";
    if (score >= 60) return "text-blue-700 bg-blue-100 border-blue-300";
    if (score >= 40) return "text-yellow-700 bg-yellow-100 border-yellow-300";
    return "text-red-700 bg-red-100 border-red-300";
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Vérifier si nous avons des insights IA pour cet élément
  const hasAiInsights = itemKey === 'aiInsights' && value;

  // Style spécial pour la section IA
  const isAiSection = itemKey === 'aiInsights';

  return (
    <div className={`space-y-2 relative ${!hasPaid && index > 1 ? 'opacity-50' : ''} ${isAiSection ? 'mt-8 pt-4 border-t border-gray-200' : ''}`}>
      {!isAiSection ? (
        // Affichage standard pour les résultats normaux
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize">{itemKey.replace(/_/g, ' ')}</h3>
            {typeof value === 'number' && (
              <Badge className={getBadgeColor(value)} variant="outline">
                {value}%
              </Badge>
            )}
          </div>
          {typeof value === 'number' && <Progress value={value} />}
          {typeof value === 'string' && (
            <p className="text-sm text-gray-500">
              {hasPaid || index <= 1 
                ? value 
                : index === 2 
                  ? value.substring(0, 100) + '...' 
                  : '••••••••••••••••••••••••••••••••••'}
            </p>
          )}
          {value?.description && (
            <p className="text-sm text-gray-500">
              {hasPaid || index <= 1 
                ? value.description 
                : index === 2 
                  ? value.description.substring(0, 100) + '...' 
                  : '••••••••••••••••••••••••••••••••••'}
            </p>
          )}
          {value?.details && hasPaid && (
            <div className="mt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => copyToClipboard(value.details, "Détails copiés!")}
              >
                <ClipboardCopy className="h-4 w-4 mr-2" />
                Afficher les détails
              </Button>
            </div>
          )}
        </>
      ) : (
        // Affichage spécial pour la section d'insights IA
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Insights IA Avancés
            </h3>
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700"
            >
              {value.confidenceScore || 85}% de confiance
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">
            Notre système d'IA a analysé vos réponses pour vous fournir des insights personnalisés
          </p>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowAiInsights(!showAiInsights)}
          >
            <PanelRightOpen className="h-4 w-4 mr-2" />
            {showAiInsights ? "Masquer les insights IA" : "Afficher les insights IA"}
          </Button>
          
          {showAiInsights && testType && (
            <AIInsightsPanel analysis={value} insights={value} testType={testType} />
          )}
        </div>
      )}
      
      {!hasPaid && index > 1 && !isAiSection && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default ResultItem;
