
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initiatePayment, checkPaymentStatus } from "@/utils/paymentUtils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  amount?: number;
  productName?: string;
  onPaymentComplete?: (success: boolean, data: any) => void;
}

export function PaymentForm({ amount = 0, productName = "", onPaymentComplete }: PaymentFormProps) {
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiated" | "success" | "failed">("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleInitiatePayment = async () => {
    if (!phoneNumber) {
      toast.error("Veuillez entrer un numéro de téléphone");
      return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Le montant doit être supérieur à 0");
      return;
    }

    setLoading(true);
    try {
      const response = await initiatePayment({
        amount: paymentAmount,
        phoneNumber,
        provider,
        description: productName || "Paiement de service",
      });

      if (response.success && response.transactionId) {
        setTransactionId(response.transactionId);
        setPaymentStatus("initiated");
        setStatusMessage(response.message);
        toast.success(response.message);
        
        // Démarrer la vérification du statut toutes les 5 secondes
        const statusCheckInterval = setInterval(async () => {
          if (!response.transactionId) {
            clearInterval(statusCheckInterval);
            return;
          }
          
          const statusResponse = await checkPaymentStatus(response.transactionId, provider);
          
          if (statusResponse.status === "COMPLETED" || statusResponse.status === "SUCCESSFUL") {
            setPaymentStatus("success");
            setStatusMessage("Paiement réussi ! Merci pour votre achat.");
            clearInterval(statusCheckInterval);
            
            if (onPaymentComplete) {
              onPaymentComplete(true, statusResponse);
            }
          } else if (statusResponse.status === "FAILED" || statusResponse.status === "DECLINED") {
            setPaymentStatus("failed");
            setStatusMessage("Le paiement a échoué. Veuillez réessayer.");
            clearInterval(statusCheckInterval);
            
            if (onPaymentComplete) {
              onPaymentComplete(false, statusResponse);
            }
          }
        }, 5000); // Vérifier toutes les 5 secondes
        
        // Arrêter les vérifications après 2 minutes
        setTimeout(() => {
          clearInterval(statusCheckInterval);
          if (paymentStatus === "initiated") {
            setPaymentStatus("failed");
            setStatusMessage("Le paiement a expiré. Veuillez réessayer.");
            
            if (onPaymentComplete) {
              onPaymentComplete(false, { message: "Timeout" });
            }
          }
        }, 120000);
      } else {
        setPaymentStatus("failed");
        setStatusMessage(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      setPaymentStatus("failed");
      setStatusMessage("Une erreur s'est produite lors du paiement");
      toast.error("Une erreur s'est produite lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const resetPayment = () => {
    setPaymentStatus("idle");
    setTransactionId(null);
    setStatusMessage("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Paiement Mobile</CardTitle>
        <CardDescription>
          Payez en utilisant MTN Mobile Money ou Airtel Money
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {paymentStatus === "idle" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                min={100}
                disabled={!!amount}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0x xx xx xx xx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Exemple: 074123456 (MTN) ou 068123456 (Airtel)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Opérateur</Label>
              <RadioGroup 
                value={provider} 
                onValueChange={(value) => setProvider(value as "mtn" | "airtel")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn" className="cursor-pointer">MTN Mobile Money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="airtel" id="airtel" />
                  <Label htmlFor="airtel" className="cursor-pointer">Airtel Money</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            {paymentStatus === "initiated" && (
              <div className="flex flex-col items-center space-y-3">
                <Clock className="h-12 w-12 text-yellow-500 animate-pulse" />
                <h3 className="text-lg font-semibold">Paiement en cours</h3>
                <p className="text-gray-600 text-sm">{statusMessage}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Veuillez confirmer le paiement sur votre téléphone.
                  <br />Si vous ne recevez pas de notification, vérifiez vos messages.
                </p>
              </div>
            )}
            
            {paymentStatus === "success" && (
              <div className="flex flex-col items-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h3 className="text-lg font-semibold text-green-700">Paiement réussi !</h3>
                <p className="text-gray-600">{statusMessage}</p>
                {transactionId && (
                  <p className="text-xs text-gray-500">
                    ID de transaction: {transactionId}
                  </p>
                )}
              </div>
            )}
            
            {paymentStatus === "failed" && (
              <div className="flex flex-col items-center space-y-3">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700">Paiement échoué</h3>
                <p className="text-gray-600">{statusMessage}</p>
                <Button variant="outline" size="sm" onClick={resetPayment}>
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {paymentStatus === "idle" && (
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            onClick={handleInitiatePayment}
            disabled={loading}
          >
            {loading ? "Traitement en cours..." : `Payer ${paymentAmount} FCFA`}
          </Button>
        )}
        
        {paymentStatus === "success" && (
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-green-600"
            onClick={() => window.location.href = "/dashboard"}
          >
            Retour au tableau de bord
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
