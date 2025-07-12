// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  to: string
  subject: string
  template: string
  data: any
  profile_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email_data } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Send email
    const emailResult = await sendEmail(email_data)

    // Log email sending
    if (email_data.profile_id) {
      await logEmailActivity(supabase, email_data.profile_id, email_data)
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: true,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function sendEmail(emailData: EmailData) {
  const { to, subject, template, data } = emailData

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'noreply@orientationpro.cg',
        to,
        subject,
        html: generateEmailTemplate(template, data)
      })
    })

    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

function generateEmailTemplate(template: string, data: any): string {
  const templates = {
    'welcome': generateWelcomeTemplate,
    'test_completed': generateTestCompletedTemplate,
    'appointment_reminder': generateAppointmentReminderTemplate,
    'cv_optimized': generateCVOptimizedTemplate,
    'payment_confirmation': generatePaymentConfirmationTemplate
  }

  const templateFunction = templates[template] || generateDefaultTemplate
  return templateFunction(data)
}

function generateWelcomeTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bienvenue chez Orientation Pro Congo !</h2>
      <p>Bonjour ${data.name},</p>
      <p>Nous sommes ravis de vous accueillir sur notre plateforme d'orientation professionnelle.</p>
      <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
      <ul>
        <li>Passer des tests d'orientation</li>
        <li>Optimiser votre CV</li>
        <li>Prendre rendez-vous avec nos consultants</li>
        <li>Accéder à nos ressources</li>
      </ul>
      <p>Commencez votre parcours dès maintenant !</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

function generateTestCompletedTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Vos résultats de test sont prêts !</h2>
      <p>Bonjour ${data.name},</p>
      <p>Votre test ${data.test_type} a été analysé avec succès.</p>
      <p><strong>Type de personnalité :</strong> ${data.personality_type}</p>
      <p>Consultez vos résultats détaillés et recommandations personnalisées sur votre tableau de bord.</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

function generateAppointmentReminderTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Rappel de rendez-vous</h2>
      <p>Bonjour ${data.student_name},</p>
      <p>Ceci est un rappel pour votre rendez-vous prévu :</p>
      <ul>
        <li><strong>Type :</strong> ${data.appointment_type}</li>
        <li><strong>Consultant :</strong> ${data.consultant_name}</li>
        <li><strong>Date et heure :</strong> ${data.scheduled_at}</li>
      </ul>
      <p>Merci de vous assurer d'être disponible à l'heure prévue.</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

function generateCVOptimizedTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Votre CV a été optimisé !</h2>
      <p>Bonjour ${data.name},</p>
      <p>Votre CV a été optimisé avec succès pour les systèmes ATS.</p>
      <p><strong>Score ATS :</strong> ${data.ats_score}%</p>
      <p>Consultez les améliorations suggérées et téléchargez votre CV optimisé.</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

function generatePaymentConfirmationTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Confirmation de paiement</h2>
      <p>Bonjour ${data.name},</p>
      <p>Nous confirmons la réception de votre paiement.</p>
      <p><strong>Montant :</strong> ${data.amount} ${data.currency}</p>
      <p><strong>Service :</strong> ${data.service}</p>
      <p>Merci pour votre confiance !</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

function generateDefaultTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Orientation Pro Congo</h2>
      <p>Bonjour,</p>
      <p>Vous avez reçu une notification de notre plateforme.</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

async function logEmailActivity(supabase: any, profile_id: string, emailData: EmailData) {
  const { error } = await supabase
    .from('logs')
    .insert({
      event_type: 'email_sent',
      event_data: {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        profile_id
      }
    })

  if (error) {
    console.error('Failed to log email activity:', error)
  }
}
