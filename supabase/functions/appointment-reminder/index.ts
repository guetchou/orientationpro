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

interface Appointment {
  id: string
  profile_id: string
  consultant_id: string
  scheduled_at: string
  appointment_type: string
  status: string
  notes?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get upcoming appointments (next 24 hours)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles!appointments_profile_id_fkey(email, full_name, phone),
        consultant:profiles!appointments_consultant_id_fkey(full_name, phone)
      `)
      .eq('status', 'confirmed')
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', tomorrow.toISOString())

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`)
    }

    const reminders = []

    for (const appointment of appointments || []) {
      const reminder = await sendAppointmentReminder(supabase, appointment)
      reminders.push(reminder)
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: reminders.length,
        appointments: appointments?.length || 0,
        message: `Sent ${reminders.length} appointment reminders`
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

async function sendAppointmentReminder(supabase: any, appointment: any) {
  const { profile_id, consultant_id, scheduled_at, appointment_type } = appointment
  const student = appointment.profiles
  const consultant = appointment.consultant

  // Create notification for student
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      profile_id,
      title: 'Rappel de rendez-vous',
      message: `Votre rendez-vous ${appointment_type} avec ${consultant.full_name} est prévu pour ${formatDateTime(scheduled_at)}`,
      notification_type: 'appointment_reminder',
      event_data: {
        appointment_id: appointment.id,
        scheduled_at,
        appointment_type,
        consultant_name: consultant.full_name
      }
    })

  if (notificationError) {
    console.error('Failed to create notification:', notificationError)
  }

  // Send SMS reminder (if phone number available)
  if (student.phone) {
    await sendSMSReminder(student.phone, {
      appointment_type,
      consultant_name: consultant.full_name,
      scheduled_at,
      student_name: student.full_name
    })
  }

  // Send email reminder
  if (student.email) {
    await sendEmailReminder(student.email, {
      appointment_type,
      consultant_name: consultant.full_name,
      scheduled_at,
      student_name: student.full_name
    })
  }

  return {
    appointment_id: appointment.id,
    student_id: profile_id,
    consultant_id,
    reminder_sent: true
  }
}

async function sendSMSReminder(phone: string, data: any) {
  // Intégration avec un service SMS (ex: Twilio, Africa's Talking)
  // Pour l'instant, on simule l'envoi
  console.log(`SMS reminder sent to ${phone} for appointment on ${data.scheduled_at}`)
  
  // Exemple avec un service SMS local
  try {
    const response = await fetch('https://api.sms-service.cg/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SMS_API_KEY')}`
      },
      body: JSON.stringify({
        to: phone,
        message: `Rappel: Votre rendez-vous ${data.appointment_type} avec ${data.consultant_name} est prévu pour ${formatDateTime(data.scheduled_at)}. Orientation Pro Congo`
      })
    })

    if (!response.ok) {
      console.error('SMS sending failed:', response.statusText)
    }
  } catch (error) {
    console.error('SMS sending error:', error)
  }
}

async function sendEmailReminder(email: string, data: any) {
  // Intégration avec un service email (ex: Resend, SendGrid)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'noreply@orientationpro.cg',
        to: email,
        subject: 'Rappel de rendez-vous - Orientation Pro Congo',
        html: generateEmailTemplate(data)
      })
    })

    if (!response.ok) {
      console.error('Email sending failed:', response.statusText)
    }
  } catch (error) {
    console.error('Email sending error:', error)
  }
}

function generateEmailTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Rappel de rendez-vous</h2>
      <p>Bonjour ${data.student_name},</p>
      <p>Ceci est un rappel pour votre rendez-vous prévu :</p>
      <ul>
        <li><strong>Type :</strong> ${data.appointment_type}</li>
        <li><strong>Consultant :</strong> ${data.consultant_name}</li>
        <li><strong>Date et heure :</strong> ${formatDateTime(data.scheduled_at)}</li>
      </ul>
      <p>Merci de vous assurer d'être disponible à l'heure prévue.</p>
      <p>Cordialement,<br>L'équipe Orientation Pro Congo</p>
    </div>
  `
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
