
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This is a mock payment processor
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
    const { transaction_id, card_details } = await req.json();
    
    if (!transaction_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing transaction_id' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }
    
    console.log(`Processing card payment for transaction: ${transaction_id}`);
    
    // In a real implementation, this would connect to a payment gateway
    // For now, we'll simulate a successful payment
    
    // Get the payment details
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching payment details:', fetchError);
      throw new Error('Payment not found');
    }
    
    // Simulate payment processing (success 90% of the time)
    const isSuccessful = Math.random() < 0.9;
    
    if (isSuccessful) {
      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'COMPLETED',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transaction_id);
        
      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw updateError;
      }
      
      // Call the payment webhook to process post-payment actions
      await fetch(`${Deno.env.get('SUPABASE_FUNCTIONS_URL')}/payment-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          transaction_id,
          status: 'SUCCESSFUL',
          processor: 'card',
          amount: paymentData.amount,
          processor_response: {
            success: true,
            message: 'Payment processed successfully'
          }
        })
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'FAILED',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transaction_id);
        
      if (updateError) {
        console.error('Error updating payment status:', updateError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment processing failed. Please try again.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }
    
  } catch (error) {
    console.error('Error processing card payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Internal server error processing payment' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
})
