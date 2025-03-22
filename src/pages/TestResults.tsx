import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ResultsSkeleton from '@/components/test-results/ResultsSkeleton';
import ResultsError from '@/components/test-results/ResultsError';
import ResultsNotFound from '@/components/test-results/ResultsNotFound';
import ResultItem from '@/components/test-results/ResultItem';
import PaymentPrompt from '@/components/test-results/PaymentPrompt';
import ResultsActions from '@/components/test-results/ResultsActions';

const TestResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const testId = new URLSearchParams(location.search).get('testId');

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          navigate('/login');
          return;
        }

        // Convert user.id to string if it's a number
        const userId = typeof user.id === 'number' ? String(user.id) : user.id;

        // Check if the user has paid for this test result
        if (testId) {
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .eq('item_id', testId)
            .eq('status', 'COMPLETED')
            .single();

          if (paymentError && paymentError.code !== 'PGRST116') {
            console.error('Error checking payment status:', paymentError);
          }

          // If payment exists and is completed, show full results
          if (paymentData) {
            setHasPaid(true);
          }
        }

        const { data, error } = await supabase
          .from('test_results')
          .select('*')
          .eq('user_id', userId)
          .eq('id', testId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setTestResults(data);
      } catch (error: any) {
        console.error("Error fetching test results:", error);
        setError(error.message || "Failed to load test results.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();

    // Cleanup function
    return () => {
      setTestResults(null);
      setLoading(false);
      setError(null);
    };
  }, [user, testId, navigate]);

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      if (!user || !testId) {
        toast.error("Informations utilisateur ou test manquantes");
        return;
      }

      // Create a payment request
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          plan_id: 'premium_report',
          test_id: testId,
          test_type: testResults?.test_type || 'orientation',
          user_id: user.id
        }
      });

      if (error) {
        throw new Error(error.message || "Échec de la création du paiement");
      }

      if (data?.payment_url) {
        // Redirect to payment page
        navigate(`/payment?transaction_id=${data.transaction_id}&amount=${3500}`);
      } else {
        throw new Error("Aucune URL de paiement reçue");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Échec du traitement du paiement");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (error) {
    return <ResultsError error={error} />;
  }

  if (!testResults) {
    return <ResultsNotFound />;
  }

  const results = testResults.results || {};

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Résultats du Test</CardTitle>
          <CardDescription>
            {hasPaid 
              ? "Voici vos résultats détaillés complets." 
              : "Voici un aperçu de vos résultats. Obtenez l'analyse complète en débloquant le rapport."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(results).map(([key, value]: [string, any], index) => (
            <ResultItem 
              key={key} 
              itemKey={key} 
              value={value} 
              index={index} 
              hasPaid={hasPaid} 
            />
          ))}

          {!hasPaid && (
            <PaymentPrompt 
              isProcessingPayment={isProcessingPayment} 
              onPayment={handlePayment}
            />
          )}

          {hasPaid && <ResultsActions />}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResults;
