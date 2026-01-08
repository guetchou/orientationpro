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

interface CVData {
  content: string
  target_position?: string
  target_industry?: string
  profile_id: string
}

interface OptimizationResult {
  ats_score: number
  keyword_matches: string[]
  missing_keywords: string[]
  suggestions: string[]
  optimized_content: string
  readability_score: number
  structure_score: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cv_data } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Analyze and optimize CV
    const optimization = await optimizeCV(cv_data)

    // Save optimization result
    const { error: saveError } = await supabase
      .from('documents')
      .insert({
        profile_id: cv_data.profile_id,
        document_type: 'cv_optimized',
        title: 'CV Optimisé ATS',
        file_url: '', // Will be updated with actual file
        metadata: optimization
      })

    if (saveError) {
      throw new Error(`Failed to save optimization: ${saveError.message}`)
    }

    // Send notification
    await sendNotification(supabase, cv_data.profile_id, 'cv_optimized', {
      ats_score: optimization.ats_score,
      suggestions_count: optimization.suggestions.length
    })

    return new Response(
      JSON.stringify({
        success: true,
        optimization,
        message: 'CV optimization completed successfully'
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

async function optimizeCV(cvData: CVData): Promise<OptimizationResult> {
  const { content, target_position, target_industry } = cvData

  // Keywords for different industries and positions
  const industryKeywords = {
    'technology': ['développement', 'programmation', 'technologie', 'informatique', 'software', 'digital'],
    'healthcare': ['santé', 'médical', 'soins', 'patient', 'clinique', 'hôpital'],
    'finance': ['finance', 'comptabilité', 'budget', 'analyse', 'investissement', 'banque'],
    'education': ['enseignement', 'éducation', 'formation', 'pédagogie', 'apprentissage'],
    'marketing': ['marketing', 'communication', 'publicité', 'stratégie', 'campagne', 'média']
  }

  const positionKeywords = {
    'developer': ['développeur', 'programmeur', 'code', 'logiciel', 'application', 'web'],
    'manager': ['gestion', 'management', 'équipe', 'projet', 'leadership', 'stratégie'],
    'analyst': ['analyse', 'données', 'rapport', 'recherche', 'statistiques', 'évaluation'],
    'designer': ['design', 'créatif', 'conception', 'graphique', 'visuel', 'art'],
    'consultant': ['conseil', 'consultation', 'expertise', 'stratégie', 'optimisation']
  }

  // Get relevant keywords
  const relevantKeywords = [
    ...(target_industry ? industryKeywords[target_industry.toLowerCase()] || [] : []),
    ...(target_position ? positionKeywords[target_position.toLowerCase()] || [] : [])
  ]

  // Analyze content
  const contentLower = content.toLowerCase()
  const foundKeywords = relevantKeywords.filter(keyword => 
    contentLower.includes(keyword.toLowerCase())
  )
  const missingKeywords = relevantKeywords.filter(keyword => 
    !contentLower.includes(keyword.toLowerCase())
  )

  // Calculate ATS score
  const keywordScore = (foundKeywords.length / relevantKeywords.length) * 40
  const readabilityScore = calculateReadability(content) * 30
  const structureScore = calculateStructureScore(content) * 30
  const atsScore = Math.min(keywordScore + readabilityScore + structureScore, 100)

  // Generate suggestions
  const suggestions = generateSuggestions(content, missingKeywords, atsScore)

  // Optimize content
  const optimizedContent = optimizeContent(content, missingKeywords, suggestions)

  return {
    ats_score: Math.round(atsScore),
    keyword_matches: foundKeywords,
    missing_keywords: missingKeywords,
    suggestions,
    optimized_content: optimizedContent,
    readability_score: Math.round(readabilityScore),
    structure_score: Math.round(structureScore)
  }
}

function calculateReadability(content: string): number {
  const sentences = content.split(/[.!?]+/).length
  const words = content.split(/\s+/).length
  const avgWordsPerSentence = words / sentences

  // Score based on average words per sentence (ideal: 15-20 words)
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    return 1.0
  } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
    return 0.8
  } else {
    return 0.5
  }
}

function calculateStructureScore(content: string): number {
  let score = 0

  // Check for clear sections
  const sections = ['expérience', 'formation', 'compétences', 'projet']
  const hasSections = sections.some(section => 
    content.toLowerCase().includes(section)
  )
  if (hasSections) score += 0.3

  // Check for bullet points
  const hasBulletPoints = content.includes('•') || content.includes('-')
  if (hasBulletPoints) score += 0.2

  // Check for action verbs
  const actionVerbs = ['développé', 'géré', 'créé', 'implémenté', 'optimisé', 'analysé']
  const hasActionVerbs = actionVerbs.some(verb => 
    content.toLowerCase().includes(verb)
  )
  if (hasActionVerbs) score += 0.3

  // Check for metrics/numbers
  const hasMetrics = /\d+%|\d+%|\d+ personnes|\d+ projets/.test(content)
  if (hasMetrics) score += 0.2

  return Math.min(score, 1.0)
}

function generateSuggestions(content: string, missingKeywords: string[], atsScore: number): string[] {
  const suggestions = []

  if (atsScore < 70) {
    suggestions.push('Ajoutez plus de mots-clés spécifiques à votre secteur')
  }

  if (missingKeywords.length > 0) {
    suggestions.push(`Intégrez ces mots-clés: ${missingKeywords.slice(0, 5).join(', ')}`)
  }

  if (!content.includes('•') && !content.includes('-')) {
    suggestions.push('Utilisez des puces pour améliorer la lisibilité')
  }

  if (!/\d+%|\d+%|\d+ personnes|\d+ projets/.test(content)) {
    suggestions.push('Ajoutez des métriques quantifiables')
  }

  if (content.split(/\s+/).length < 200) {
    suggestions.push('Développez davantage vos expériences')
  }

  return suggestions
}

function optimizeContent(content: string, missingKeywords: string[], suggestions: string[]): string {
  let optimized = content

  // Add missing keywords naturally
  missingKeywords.slice(0, 3).forEach(keyword => {
    // Add keyword in a natural way if not present
    if (!optimized.toLowerCase().includes(keyword.toLowerCase())) {
      optimized += `\n\nCompétences en ${keyword}`
    }
  })

  // Ensure proper structure
  if (!optimized.includes('Expérience')) {
    optimized = 'Expérience\n' + optimized
  }

  if (!optimized.includes('Formation')) {
    optimized += '\n\nFormation'
  }

  return optimized
}

async function sendNotification(supabase: any, profile_id: string, type: string, data: any) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      profile_id,
      title: 'CV optimisé avec succès',
      message: `Votre CV a été optimisé avec un score ATS de ${data.ats_score}%`,
      notification_type: type,
      event_data: data
    })

  if (error) {
    console.error('Failed to send notification:', error)
  }
}
