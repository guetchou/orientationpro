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

    // Parse the request body
    const data = await req.json();
    console.log('Webhook data received:', data);

    // Validate request data
    if (!data.transaction_id || !data.status) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid webhook data - missing required fields' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Update payment status in database
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: data.status,
        updated_at: new Date().toISOString(),
        provider_data: data
      })
      .eq('transaction_id', data.transaction_id);

    if (error) {
      console.error('Error updating payment:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error updating payment' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // If payment is successful, handle post-payment actions
    if (data.status === 'SUCCESSFUL' || data.status === 'COMPLETED') {
      // Get the payment details to determine what action to take
      const { data: paymentData, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', data.transaction_id)
        .single();

      if (fetchError || !paymentData) {
        console.error('Error fetching payment details:', fetchError);
      } else {
        // Handle different payment types
        if (paymentData.payment_type === 'subscription') {
          // Update user subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: paymentData.user_id,
              plan_id: paymentData.item_id,
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
              payment_id: paymentData.id
            });

          if (subError) {
            console.error('Error creating subscription:', subError);
          }
        } 
        else if (paymentData.payment_type === 'test_result') {
          // No additional action needed - the payment status itself will be used
          // to determine if the user has access to full test results
          console.log(`Test result payment completed for user: ${paymentData.user_id}, test: ${paymentData.metadata?.test_id}`);
        }
        // Other payment types can be handled here
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
})
