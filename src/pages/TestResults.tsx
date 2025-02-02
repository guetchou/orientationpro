import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types/json";

interface TestResult {
  id: string;
  test_type: string;
  results: Json;
  answers: Json;
  created_at: string;
  user_id: string;
  detailed_analysis?: Json;
  recommendations?: Json;
}

const TestResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchResults = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Fetched test results:", data);
        setResults(data || []);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Erreur lors de la récupération des résultats");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchResults();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const prepareChartData = (results: Json) => {
    if (typeof results === "object" && results !== null) {
      return Object.entries(results as Record<string, number>).map(([name, value]) => ({
        name,
        value,
      }));
    }
    return [];
  };

  const getTestTitle = (testType: string) => {
    switch (testType) {
      case 'RIASEC':
        return 'Test RIASEC - Orientation Professionnelle';
      case 'EMOTIONAL_INTELLIGENCE':
        return 'Test d\'Intelligence Émotionnelle';
      case 'MULTIPLE_INTELLIGENCE':
        return 'Test des Intelligences Multiples';
      case 'LEARNING_STYLE':
        return 'Test de Style d\'Apprentissage';
      default:
        return testType;
    }
  };

  const renderChart = (result: TestResult) => {
    const chartData = prepareChartData(result.results);

    switch (result.test_type) {
      case 'RIASEC':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="var(--color-primary)" />
              <ChartTooltip />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'MULTIPLE_INTELLIGENCE':
      case 'EMOTIONAL_INTELLIGENCE':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar dataKey="value" fill="var(--color-primary)" fillOpacity={0.6} />
              <ChartTooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="var(--color-primary)" />
              <ChartTooltip />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Résultats</h1>
        <div className="space-x-4">
          <Button onClick={() => navigate("/test-riasec")}>
            Test RIASEC
          </Button>
          <Button onClick={() => navigate("/test-emotional")}>
            Test Intelligence Émotionnelle
          </Button>
          <Button onClick={() => navigate("/test-multiple")}>
            Test Intelligences Multiples
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Vous n'avez pas encore passé de test
            </p>
            <Button onClick={() => navigate("/test-riasec")}>
              Passer mon premier test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <CardTitle>{getTestTitle(result.test_type)}</CardTitle>
                <CardDescription>
                  Passé le {formatDate(result.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {renderChart(result)}
                  
                  {result.detailed_analysis && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Analyse Détaillée</h3>
                      <div className="prose">
                        {typeof result.detailed_analysis === 'string' 
                          ? result.detailed_analysis
                          : JSON.stringify(result.detailed_analysis, null, 2)}
                      </div>
                    </div>
                  )}
                  
                  {result.recommendations && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Recommandations</h3>
                      <div className="prose">
                        {typeof result.recommendations === 'string'
                          ? result.recommendations
                          : JSON.stringify(result.recommendations, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestResults;