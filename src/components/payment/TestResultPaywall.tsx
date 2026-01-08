
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, FileText, CreditCard, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TestResultPaywallProps {
  testType: string;
  testId: string;
  partialResults: any;
}

export const TestResultPaywall = ({ testType, testId, partialResults }: TestResultPaywallProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async (planId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Veuillez vous connecter pour continuer");
        navigate("/login");
        return;
      }
      
      // Create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          plan_id: planId,
          test_id: testId,
          test_type: testType,
          user_id: user.id
        }
      });
      
      if (error) throw error;
      
      // Redirect to payment page or process payment
      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error("Erreur lors de la création du paiement");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Erreur de paiement: " + (error.message || "Veuillez réessayer"));
    } finally {
      setLoading(false);
    }
  };

  const getTestName = () => {
    switch (testType) {
      case "riasec":
      case "RIASEC":
        return "Test RIASEC";
      case "emotional":
        return "Test d'Intelligence Émotionnelle";
      case "multiple_intelligence":
        return "Test des Intelligences Multiples";
      case "learning_style":
        return "Test de Style d'Apprentissage";
      default:
        return "Test d'orientation";
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
          Résultats partiels
        </Badge>
        <h2 className="text-2xl font-bold">Débloquez votre rapport complet de {getTestName()}</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Accédez à une analyse détaillée de vos résultats et des recommandations personnalisées pour votre orientation
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle>Rapport Partiel</CardTitle>
            <CardDescription>Aperçu des résultats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-medium">Inclus:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Résultats de base
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Graphique simple
                </li>
              </ul>
            </div>
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Ce que vous voyez actuellement:</p>
              {partialResults && (
                <div className="text-sm">
                  {Object.entries(partialResults).slice(0, 3).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="capitalize">{key}</span>
                      <span className="font-semibold">{typeof value === 'number' ? Math.round(value * 100) / 100 : value}</span>
                    </div>
                  ))}
                  {Object.keys(partialResults).length > 3 && (
                    <div className="flex items-center justify-center mt-2">
                      <Lock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-400">{Object.keys(partialResults).length - 3} éléments masqués</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500 w-full text-center">Gratuit</p>
          </CardFooter>
        </Card>

        <Card className="border-2 border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold">
            Recommandé
          </div>
          <CardHeader>
            <CardTitle>Rapport Complet</CardTitle>
            <CardDescription>Analyse détaillée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-medium">Tout ce qui est inclus:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Analyse détaillée des résultats
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Graphiques avancés
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Recommandations personnalisées
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Métiers et formations recommandés
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Export PDF de qualité
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Accès à un conseiller
                </li>
              </ul>
            </div>
            <div className="text-center pt-2">
              <p className="text-3xl font-bold">3500 FC</p>
              <p className="text-sm text-gray-500">Paiement unique</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment("premium_report")}
              disabled={loading}
            >
              {loading ? "Traitement..." : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Débloquer mon rapport complet
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <p>
            Les rapports complets sont générés par notre algorithme d'intelligence artificielle
            en se basant sur vos réponses. Vous pourrez y accéder à tout moment depuis votre tableau de bord.
          </p>
        </div>
      </div>
    </div>
  );
};
