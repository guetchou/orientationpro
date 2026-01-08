
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Phone, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'airtel' | 'mtn' | 'card' | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const transactionId = searchParams.get('transaction_id');
  const amount = searchParams.get('amount');
  
  useEffect(() => {
    if (transactionId) {
      fetchPaymentDetails();
    }
  }, [transactionId]);
  
  const fetchPaymentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();
        
      if (error) throw error;
      setPaymentData(data);
      
      // Check if payment is already completed
      if (data.status === 'COMPLETED' || data.status === 'SUCCESSFUL') {
        setStatus('success');
      } else if (data.status === 'FAILED') {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error("Impossible de récupérer les détails du paiement");
    }
  };
  
  const processCardPayment = async () => {
    setStatus('processing');
    setLoading(true);
    
    try {
      // Call card payment processor function
      const { data, error } = await supabase.functions.invoke('card-payment', {
        body: {
          transaction_id: transactionId,
          card_details: { /* Normally this would contain card details */ }
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setStatus('success');
        toast.success("Paiement par carte réussi !");
      } else {
        setStatus('failed');
        toast.error(data.message || "Échec du paiement par carte");
      }
    } catch (error) {
      console.error('Card payment error:', error);
      setStatus('failed');
      toast.error("Erreur lors du traitement du paiement par carte");
    } finally {
      setLoading(false);
    }
  };
  
  const processMobilePayment = async (provider: 'airtel' | 'mtn') => {
    setStatus('processing');
    setLoading(true);
    
    try {
      // Call mobile money function based on provider
      const functionName = provider === 'airtel' ? 'airtel-money' : 'mtn-momo';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          transaction_id: transactionId,
          phone_number: '0123456789' // In a real app, this would be collected from user
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        setStatus('success');
        toast.success(`Paiement ${provider} réussi !`);
      } else {
        setStatus('failed');
        toast.error(data?.message || `Échec du paiement ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} payment error:`, error);
      setStatus('failed');
      toast.error(`Erreur lors du traitement du paiement ${provider}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error("Veuillez sélectionner une méthode de paiement");
      return;
    }
    
    if (paymentMethod === 'card') {
      processCardPayment();
    } else if (paymentMethod === 'airtel' || paymentMethod === 'mtn') {
      processMobilePayment(paymentMethod);
    }
  };
  
  const handleRetry = () => {
    setStatus('pending');
    setPaymentMethod(null);
  };
  
  const navigateToResults = () => {
    navigate('/dashboard/results');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Paiement</h1>
          
          {status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Finaliser votre achat</CardTitle>
                <CardDescription>
                  Rapport d'orientation personnalisé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-semibold">{amount || '3500'} FC</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">Choisissez une méthode de paiement</p>
                  
                  <div 
                    className={`border rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors
                      ${paymentMethod === 'airtel' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setPaymentMethod('airtel')}
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <Phone className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">Airtel Money</p>
                      <p className="text-sm text-gray-500">Payer avec votre compte Airtel</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors
                      ${paymentMethod === 'mtn' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setPaymentMethod('mtn')}
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Phone className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">MTN Mobile Money</p>
                      <p className="text-sm text-gray-500">Payer avec votre compte MTN</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors
                      ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CreditCard className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Carte bancaire</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, etc.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={!paymentMethod || loading}
                >
                  {loading ? "Traitement en cours..." : "Payer maintenant"}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {status === 'processing' && (
            <Card>
              <CardHeader className="text-center pb-0">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
                <CardTitle>Traitement du paiement...</CardTitle>
                <CardDescription>
                  Veuillez patienter pendant que nous traitons votre paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Ne fermez pas cette fenêtre et n'actualisez pas la page
                </p>
              </CardContent>
            </Card>
          )}
          
          {status === 'success' && (
            <Card>
              <CardHeader className="text-center pb-0">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle>Paiement réussi !</CardTitle>
                <CardDescription>
                  Votre paiement a été traité avec succès
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Numéro de transaction</span>
                      <span className="font-mono font-medium">{transactionId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Montant</span>
                      <span className="font-medium">{amount || '3500'} FC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Méthode</span>
                      <span className="font-medium">
                        {paymentMethod === 'airtel' ? 'Airtel Money' : 
                         paymentMethod === 'mtn' ? 'MTN Mobile Money' : 
                         paymentMethod === 'card' ? 'Carte bancaire' : 'Paiement en ligne'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-green-50 p-3 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-800">Paiement sécurisé et confirmé</p>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600">
                    Vous pouvez maintenant accéder à votre rapport complet d'orientation
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={navigateToResults}>
                  Voir mon rapport complet
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {status === 'failed' && (
            <Card>
              <CardHeader className="text-center pb-0">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle>Échec du paiement</CardTitle>
                <CardDescription>
                  Votre paiement n'a pas pu être traité
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Nous n'avons pas pu traiter votre paiement. Veuillez vérifier vos informations et réessayer.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Payment;
