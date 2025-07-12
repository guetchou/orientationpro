
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
if (!backendUrl) throw new Error('VITE_BACKEND_URL doit être défini dans .env');

interface TestResult {
  id: string;
  test_type: string;
  created_at: string;
  results: any;
}

export const RecentTests = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecentTests = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/test-results/user/${user.id}`, {
          withCredentials: true
        });
        
        if (response.data) {
          setTests(response.data.slice(0, 5)); // Show only the last 5 tests
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tests récents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentTests();
  }, [user]);
  
  const getFormattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  const getTestName = (testType: string) => {
    const testNames: Record<string, string> = {
      'riasec': 'Test RIASEC',
      'emotional': 'Test d\'Intelligence Émotionnelle',
      'learning_style': 'Test de Styles d\'Apprentissage',
      'multiple_intelligence': 'Test des Intelligences Multiples',
      'career_transition': 'Test de Reconversion Professionnelle',
      'no_diploma_career': 'Test d\'Orientation Sans Diplôme',
      'entrepreneurial': 'Test d\'Aptitude Entrepreneuriale',
      'senior_employment': 'Test d\'Emploi Senior'
    };
    
    return testNames[testType] || `Test ${testType}`;
  };
  
  const getTestScore = (testType: string, results: any) => {
    switch (testType) {
      case 'riasec':
        return results.personalityCode || 'Profil RIASEC';
      case 'emotional':
        return results.overallScore ? `${results.overallScore}/100` : 'Score EQ';
      case 'learning_style':
        return results.primary || 'Style dominant';
      case 'multiple_intelligence':
        return results.dominantIntelligence || 'Intelligence dominante';
      default:
        return results.confidenceScore ? `${results.confidenceScore}%` : 'Résultats disponibles';
    }
  };

  const viewTestResult = (testId: string) => {
    navigate(`/test-results?testId=${testId}`);
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tests Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tests Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore passé de test</p>
            <Button onClick={() => navigate('/tests')} size="sm">
              Découvrir les tests
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tests Récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-md transition-colors"
              onClick={() => viewTestResult(test.id)}
            >
              <div>
                <p className="font-medium">{getTestName(test.test_type)}</p>
                <p className="text-sm text-gray-500">{getFormattedDate(test.created_at)}</p>
              </div>
              <div className="text-sm font-medium text-primary">{getTestScore(test.test_type, test.results)}</div>
            </div>
          ))}
          
          {tests.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/results')}
              >
                Voir tous mes résultats
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
