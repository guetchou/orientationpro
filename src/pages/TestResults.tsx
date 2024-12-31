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
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface TestResult {
  id: string;
  test_type: string;
  results: Record<string, number>;
  answers: number[];
  created_at: string;
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

  const prepareChartData = (results: Record<string, number>) => {
    return Object.entries(results).map(([name, value]) => ({
      name,
      value,
    }));
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
        <Button onClick={() => navigate("/test-riasec")}>
          Passer un nouveau test
        </Button>
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
                <CardTitle>Test RIASEC</CardTitle>
                <CardDescription>
                  Passé le {formatDate(result.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    className="w-full"
                    config={{
                      R: { label: "Réaliste" },
                      I: { label: "Investigateur" },
                      A: { label: "Artistique" },
                      S: { label: "Social" },
                      E: { label: "Entreprenant" },
                      C: { label: "Conventionnel" },
                    }}
                  >
                    <BarChart data={prepareChartData(result.results)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="value" fill="var(--color-primary)" />
                      <ChartTooltip />
                    </BarChart>
                  </ChartContainer>
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