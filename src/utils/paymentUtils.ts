
import { toast } from "sonner";

interface PaymentOptions {
  amount: number;
  currency?: string;
  phoneNumber: string;
  provider: 'mtn' | 'airtel';
  description?: string;
  customerName?: string;
  reference?: string;
  callbackUrl?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  reference?: string;
  message: string;
  status?: string;
  providerResponse?: any;
}

/**
 * Initiate mobile money payment
 */
export async function initiatePayment(options: PaymentOptions): Promise<PaymentResponse> {
  const {
    amount,
    currency = "XAF",
    phoneNumber,
    provider,
    description = "Paiement pour services",
    customerName = "",
    reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    callbackUrl = `${window.location.origin}/payment/callback`
  } = options;

  // Validation de base
  if (!phoneNumber) {
    return {
      success: false,
      message: "Le numéro de téléphone est requis"
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      message: "Le montant doit être supérieur à 0"
    };
  }

  try {
    // Format phone number - remove spaces and ensure country code
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Endpoint basé sur le fournisseur
    const endpoint = provider === 'mtn' 
      ? '/api/payments/mtn-momo/initiate'
      : '/api/payments/airtel-money/initiate';
    
    // Préparation de la charge pour l'API
    const payload = {
      amount,
      currency,
      phone: formattedPhone, 
      description,
      customer_name: customerName,
      reference,
      callback_url: callbackUrl
    };
    
    // Effectuer la requête API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'initiation du paiement');
    }
    
    return {
      success: true,
      transactionId: data.transaction_id,
      reference: data.reference,
      message: `Paiement initié avec succès. Veuillez confirmer sur votre téléphone ${formattedPhone}`,
      status: data.status,
      providerResponse: data
    };

  } catch (error) {
    console.error("Erreur de paiement:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur s'est produite lors du paiement"
    };
  }
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatus(transactionId: string, provider: 'mtn' | 'airtel'): Promise<PaymentResponse> {
  try {
    const endpoint = provider === 'mtn'
      ? `/api/payments/mtn-momo/status/${transactionId}`
      : `/api/payments/airtel-money/status/${transactionId}`;
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la vérification du statut');
    }
    
    const isSuccessful = data.status === 'SUCCESSFUL' || data.status === 'COMPLETED';
    
    return {
      success: isSuccessful,
      transactionId,
      message: isSuccessful 
        ? 'Paiement réussi' 
        : `Statut du paiement: ${data.status}`,
      status: data.status,
      providerResponse: data
    };
    
  } catch (error) {
    console.error("Erreur de vérification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de la vérification du statut"
    };
  }
}

/**
 * Format phone number for mobile money payments
 */
function formatPhoneNumber(phone: string): string {
  // Supprimer tous les caractères non numériques
  let cleaned = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 0, le remplacer par le code pays +242 (Congo)
  if (cleaned.startsWith('0')) {
    cleaned = '242' + cleaned.substring(1);
  }
  
  // Si le numéro ne contient pas de code pays, ajouter +242
  if (cleaned.length === 9) {
    cleaned = '242' + cleaned;
  }
  
  // Si le numéro commence déjà par 242, s'assurer qu'il a le bon format
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}
