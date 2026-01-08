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

interface TestResult {
  test_type: string
  answers: any[]
  results: any
  profile_id: string
}

interface AnalysisResult {
  personality_type: string
  career_recommendations: string[]
  skills_to_develop: string[]
  industries_to_explore: string[]
  confidence_score: number
  detailed_analysis: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { test_data, profile_id } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Analyze test results based on type
    let analysis: AnalysisResult

    if (test_data.test_type === 'riasec') {
      analysis = await analyzeRIASEC(test_data.results)
    } else if (test_data.test_type === 'personality') {
      analysis = await analyzePersonality(test_data.results)
    } else {
      analysis = await analyzeGeneric(test_data.results)
    }

    // Save analysis to database
    const { error: saveError } = await supabase
      .from('test_results')
      .insert({
        profile_id,
        test_type: test_data.test_type,
        test_data: test_data,
        results: analysis,
        score: analysis.confidence_score,
        interpretation: JSON.stringify(analysis.detailed_analysis),
        recommendations: analysis.career_recommendations
      })

    if (saveError) {
      throw new Error(`Failed to save analysis: ${saveError.message}`)
    }

    // Send notification to user
    await sendNotification(supabase, profile_id, 'test_completed', {
      test_type: test_data.test_type,
      personality_type: analysis.personality_type
    })

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        message: 'Test analysis completed successfully'
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

async function analyzeRIASEC(results: any): Promise<AnalysisResult> {
  const { R, I, A, S, E, C } = results
  
  // Determine dominant personality type
  const scores = { R, I, A, S, E, C }
  const dominant = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)
  
  const personalityTypes = {
    R: 'Réaliste',
    I: 'Investigatif', 
    A: 'Artistique',
    S: 'Social',
    E: 'Entreprenant',
    C: 'Conventionnel'
  }

  const careerRecommendations = {
    R: ['Ingénieur', 'Technicien', 'Mécanicien', 'Architecte', 'Géologue'],
    I: ['Scientifique', 'Chercheur', 'Médecin', 'Psychologue', 'Analyste'],
    A: ['Designer', 'Artiste', 'Écrivain', 'Musicien', 'Photographe'],
    S: ['Enseignant', 'Conseiller', 'Psychologue', 'Infirmier', 'Travailleur social'],
    E: ['Entrepreneur', 'Manager', 'Commercial', 'Avocat', 'Politicien'],
    C: ['Comptable', 'Administrateur', 'Bibliothécaire', 'Secrétaire', 'Analyste financier']
  }

  const skillsToDevelop = {
    R: ['Résolution de problèmes techniques', 'Précision', 'Travail manuel'],
    I: ['Analyse critique', 'Recherche', 'Pensée logique'],
    A: ['Créativité', 'Expression artistique', 'Innovation'],
    S: ['Communication', 'Empathie', 'Leadership'],
    E: ['Gestion de projet', 'Négociation', 'Prise de décision'],
    C: ['Organisation', 'Attention aux détails', 'Fiabilité']
  }

  return {
    personality_type: personalityTypes[dominant[0]],
    career_recommendations: careerRecommendations[dominant[0]],
    skills_to_develop: skillsToDevelop[dominant[0]],
    industries_to_explore: ['Technologie', 'Santé', 'Éducation', 'Finance'],
    confidence_score: Math.min(dominant[1] / 100, 0.95),
    detailed_analysis: {
      dominant_type: dominant[0],
      scores,
      secondary_types: Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(1, 3)
        .map(([type]) => type)
    }
  }
}

async function analyzePersonality(results: any): Promise<AnalysisResult> {
  // Analyse de personnalité basique
  return {
    personality_type: 'Analytique',
    career_recommendations: ['Analyste', 'Chercheur', 'Consultant'],
    skills_to_develop: ['Analyse', 'Pensée critique', 'Communication'],
    industries_to_explore: ['Consulting', 'Recherche', 'Technologie'],
    confidence_score: 0.8,
    detailed_analysis: results
  }
}

async function analyzeGeneric(results: any): Promise<AnalysisResult> {
  // Analyse générique pour autres types de tests
  return {
    personality_type: 'Général',
    career_recommendations: ['Développement personnel', 'Formation continue'],
    skills_to_develop: ['Adaptabilité', 'Apprentissage continu'],
    industries_to_explore: ['Formation', 'Développement personnel'],
    confidence_score: 0.7,
    detailed_analysis: results
  }
}

async function sendNotification(supabase: any, profile_id: string, type: string, data: any) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      profile_id,
      title: 'Résultats de test disponibles',
      message: `Votre analyse de test ${data.test_type} est prête !`,
      notification_type: type,
      event_data: data
    })

  if (error) {
    console.error('Failed to send notification:', error)
  }
}
