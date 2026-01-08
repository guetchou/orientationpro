
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration pour l'API MTN MoMo
const MTN_API_URL = "https://sandbox.momodeveloper.mtn.com"; // URL de sandbox pour les tests
const COLLECTION_PRIMARY_KEY = Deno.env.get("MTN_COLLECTION_PRIMARY_KEY") || "";
const API_USER = Deno.env.get("MTN_API_USER") || "";
const API_KEY = Deno.env.get("MTN_API_KEY") || "";
const CALLBACK_HOST = Deno.env.get("CALLBACK_HOST") || "https://azikiiztfejmywbhtuak.supabase.co";

// Fonction pour générer un UUID v4
function uuidv4() {
  return crypto.randomUUID();
}

// Fonction pour obtenir un token d'accès MTN MoMo
async function getMtnToken() {
  const credentials = btoa(`${API_USER}:${API_KEY}`);
  
  const response = await fetch(`${MTN_API_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': COLLECTION_PRIMARY_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get MTN token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Fonction pour initier un paiement MTN MoMo
async function initiateMomoPayment(params: any) {
  try {
    // Obtenir un token d'accès
    const token = await getMtnToken();
    
    // Préparer la requête de paiement
    const referenceId = uuidv4();
    const requestBody = {
      amount: params.amount,
      currency: params.currency || "XAF",
      externalId: params.reference || uuidv4(),
      payer: {
        partyIdType: "MSISDN",
        partyId: params.phone
      },
      payerMessage: params.description || "Payment for services",
      payeeNote: params.description || "Payment for services"
    };

    // Effectuer la requête de paiement
    const response = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': COLLECTION_PRIMARY_KEY,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initiate payment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Enregistrer la transaction dans la base de données
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('payments')
      .insert({
        transaction_id: referenceId,
        external_reference: params.reference || requestBody.externalId,
        amount: params.amount,
        currency: params.currency || "XAF",
        status: 'PENDING',
        payment_method: 'MTN_MOMO',
        phone_number: params.phone,
        description: params.description,
        user_id: params.user_id,
        provider_data: requestBody
      });

    if (error) {
      console.error('Error saving payment to database:', error);
    }

    return {
      success: true,
      transaction_id: referenceId,
      reference: requestBody.externalId,
      status: 'PENDING',
      message: 'Payment initiated successfully'
    };
  } catch (error) {
    console.error('Error initiating MTN MoMo payment:', error);
    return {
      success: false,
      message: error.message || 'Failed to initiate payment'
    };
  }
}

// Fonction pour vérifier le statut d'un paiement MTN MoMo
async function checkMomoPaymentStatus(transactionId: string) {
  try {
    // Obtenir un token d'accès
    const token = await getMtnToken();
    
    // Vérifier le statut de la transaction
    const response = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': COLLECTION_PRIMARY_KEY,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check payment status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Mettre à jour le statut dans la base de données
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('payments')
      .update({ 
        status: data.status,
        updated_at: new Date().toISOString(),
        provider_data: data
      })
      .eq('transaction_id', transactionId);

    if (error) {
      console.error('Error updating payment status:', error);
    }

    return {
      success: true,
      status: data.status,
      transaction_id: transactionId,
      details: data
    };
  } catch (error) {
    console.error('Error checking MTN MoMo payment status:', error);
    return {
      success: false,
      message: error.message || 'Failed to check payment status'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Endpoint pour initier un paiement
    if (path === '/api/payments/mtn-momo/initiate' && req.method === 'POST') {
      const params = await req.json();
      const result = await initiateMomoPayment(params);
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    }
    
    // Endpoint pour vérifier le statut d'un paiement
    if (path.startsWith('/api/payments/mtn-momo/status/') && req.method === 'GET') {
      const transactionId = path.split('/').pop() || '';
      const result = await checkMomoPaymentStatus(transactionId);
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    }

    // Endpoint par défaut si aucun autre ne correspond
    return new Response(
      JSON.stringify({ success: false, message: 'Endpoint not found' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
