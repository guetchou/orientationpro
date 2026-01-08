
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration pour l'API Airtel Money
const AIRTEL_API_URL = "https://openapiuat.airtel.africa"; // URL de sandbox pour les tests
const CLIENT_ID = Deno.env.get("AIRTEL_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("AIRTEL_CLIENT_SECRET") || "";
const CALLBACK_HOST = Deno.env.get("CALLBACK_HOST") || "https://azikiiztfejmywbhtuak.supabase.co";

// Fonction pour générer un ID de transaction unique
function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

// Fonction pour obtenir un token d'accès Airtel
async function getAirtelToken() {
  const response = await fetch(`${AIRTEL_API_URL}/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get Airtel token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Fonction pour initier un paiement Airtel Money
async function initiateAirtelPayment(params: any) {
  try {
    // Obtenir un token d'accès
    const token = await getAirtelToken();
    
    // Générer un ID de transaction unique
    const transactionId = generateTransactionId();
    
    // Préparer la requête de paiement
    const requestBody = {
      reference: params.reference || transactionId,
      subscriber: {
        country: "CG",
        currency: params.currency || "XAF",
        msisdn: params.phone
      },
      transaction: {
        amount: params.amount,
        country: "CG",
        currency: params.currency || "XAF",
        id: transactionId
      }
    };

    // Effectuer la requête de paiement
    const response = await fetch(`${AIRTEL_API_URL}/merchant/v1/payments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Country': 'CG',
        'X-Currency': params.currency || "XAF"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initiate payment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    
    // Enregistrer la transaction dans la base de données
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase
      .from('payments')
      .insert({
        transaction_id: transactionId,
        external_reference: params.reference || requestBody.reference,
        amount: params.amount,
        currency: params.currency || "XAF",
        status: responseData.status || 'PENDING',
        payment_method: 'AIRTEL_MONEY',
        phone_number: params.phone,
        description: params.description,
        user_id: params.user_id,
        provider_data: responseData
      });

    if (error) {
      console.error('Error saving payment to database:', error);
    }

    return {
      success: true,
      transaction_id: transactionId,
      reference: requestBody.reference,
      status: responseData.status || 'PENDING',
      message: 'Payment initiated successfully',
      airtel_data: responseData
    };
  } catch (error) {
    console.error('Error initiating Airtel Money payment:', error);
    return {
      success: false,
      message: error.message || 'Failed to initiate payment'
    };
  }
}

// Fonction pour vérifier le statut d'un paiement Airtel Money
async function checkAirtelPaymentStatus(transactionId: string) {
  try {
    // Obtenir un token d'accès
    const token = await getAirtelToken();
    
    // Vérifier le statut de la transaction
    const response = await fetch(`${AIRTEL_API_URL}/standard/v1/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Country': 'CG',
        'X-Currency': 'XAF'
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
    console.error('Error checking Airtel Money payment status:', error);
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
    if (path === '/api/payments/airtel-money/initiate' && req.method === 'POST') {
      const params = await req.json();
      const result = await initiateAirtelPayment(params);
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    }
    
    // Endpoint pour vérifier le statut d'un paiement
    if (path.startsWith('/api/payments/airtel-money/status/') && req.method === 'GET') {
      const transactionId = path.split('/').pop() || '';
      const result = await checkAirtelPaymentStatus(transactionId);
      
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
