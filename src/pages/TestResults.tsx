
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";
import axios from 'axios';
import ResultsSkeleton from '@/components/test-results/ResultsSkeleton';
import ResultsError from '@/components/test-results/ResultsError';
import ResultsNotFound from '@/components/test-results/ResultsNotFound';
import TestResultsView from '@/components/test-results/TestResultsView';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const TestResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Get testId from URL parameters
  const testId = searchParams.get('testId');
  
  // Check if we have test results directly from the state (used when coming from completing a test)
  const stateResults = location.state?.results;
  const stateTestType = location.state?.testType;

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          navigate('/login', { state: { redirectAfterLogin: location.pathname + location.search } });
          return;
        }
        
        // If we have results in the state and no testId in URL, use those
        if (stateResults && stateTestType && !testId) {
          setTestResults({
            id: 'temp-id',
            user_id: user.id,
            test_type: stateTestType,
            results: stateResults,
            answers: [],
            created_at: new Date().toISOString()
          });
          return;
        }
        
        // If no testId was provided, redirect to dashboard
        if (!testId) {
          throw new Error("Aucun identifiant de test spécifié");
        }

        // Check if the user has paid for this test result
        try {
          const { data: paymentData } = await axios.get(`${backendUrl}/api/payments/check`, {
            params: {
              user_id: user.id,
              item_id: testId,
            },
            withCredentials: true
          });
          
          if (paymentData && paymentData.status === 'COMPLETED') {
            setHasPaid(true);
          }
        } catch (paymentError) {
          console.warn('Erreur lors de la vérification du paiement:', paymentError);
          // Continue even if payment check fails
        }

        // Fetch the test results
        const { data } = await axios.get(`${backendUrl}/api/test-results/${testId}`, {
          withCredentials: true
        });

        if (!data) {
          throw new Error("Résultats de test non trouvés");
        }

        setTestResults(data);
      } catch (error: any) {
        console.error("Error fetching test results:", error);
        setError(error.message || "Impossible de charger les résultats du test.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [navigate, testId, user, stateResults, stateTestType, location.pathname, location.search]);

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      if (!user || !testId) {
        toast.error("Informations utilisateur ou test manquantes");
        return;
      }

      // Create a payment request
      const response = await axios.post(`${backendUrl}/api/payments/create`, {
        plan_id: 'premium_report',
        test_id: testId,
        test_type: testResults?.test_type || 'orientation',
        user_id: user.id
      }, {
        withCredentials: true
      });

      const data = response.data;
      
      if (!data || !data.payment_url) {
        throw new Error("Aucune URL de paiement reçue");
      }

      if (data.payment_url) {
        // Redirect to payment page
        navigate(`/payment?transaction_id=${data.transaction_id}&amount=${3500}`);
      } else {
        throw new Error("Aucune URL de paiement reçue");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Échec du traitement du paiement");
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
