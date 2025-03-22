
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import ResultsSkeleton from '@/components/test-results/ResultsSkeleton';
import ResultsError from '@/components/test-results/ResultsError';
import ResultsNotFound from '@/components/test-results/ResultsNotFound';
import TestResultsView from '@/components/test-results/TestResultsView';

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

  return (
    <TestResultsView
      testResults={testResults}
      hasPaid={hasPaid}
      isProcessingPayment={isProcessingPayment}
      onPayment={handlePayment}
    />
  );
};

export default TestResults;
