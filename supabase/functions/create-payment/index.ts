
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Parse request body
    const { plan_id, test_id, test_type, user_id } = await req.json();
    
    if (!plan_id || !test_id || !test_type || !user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }
    
    // Get price for the requested plan
    const planPrices = {
      'premium_report': 3500, // FCFA (Francs CFA)
      'premium_subscription': 15000, // Monthly subscription
      'enterprise_plan': 50000 // Enterprise plan
    };
    
    const amount = planPrices[plan_id as keyof typeof planPrices];
    
    if (!amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid plan id' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }
    
    // Generate a unique transaction ID
    const transaction_id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Create a payment record in the database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user_id,
        amount: amount,
        currency: 'FCFA',
        status: 'PENDING',
        payment_type: 'test_result',
        transaction_id: transaction_id,
        item_id: plan_id,
        metadata: {
          test_id,
          test_type
        }
      })
      .select()
      .single();
      
    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw paymentError;
    }
    
    // For this example, we'll use a simulated payment gateway
    // In a real implementation, you would redirect to or integrate with your payment provider
    const payment_url = `${Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:3000'}/payment?transaction_id=${transaction_id}&amount=${amount}`;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: paymentData.id,
        transaction_id: transaction_id,
        payment_url: payment_url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error processing payment request:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
})
