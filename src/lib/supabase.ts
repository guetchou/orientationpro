import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// Configuration Supabase pour Orientation Pro Congo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:55508'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Client Supabase principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Client Supabase avec service role (pour les Edge Functions)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

// Types pour les données Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          birth_date: string | null
          gender: string | null
          education_level: string | null
          current_job: string | null
          experience_years: number | null
          interests: string[] | null
          goals: string[] | null
          avatar_url: string | null
          linkedin_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          education_level?: string | null
          current_job?: string | null
          experience_years?: number | null
          interests?: string[] | null
          goals?: string[] | null
          avatar_url?: string | null
          linkedin_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          birth_date?: string | null
          gender?: string | null
          education_level?: string | null
          current_job?: string | null
          experience_years?: number | null
          interests?: string[] | null
          goals?: string[] | null
          avatar_url?: string | null
          linkedin_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          profile_id: string
          test_type: string
          test_data: any
          results: any
          score: number | null
          interpretation: string | null
          recommendations: string[] | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          test_type: string
          test_data: any
          results: any
          score?: number | null
          interpretation?: string | null
          recommendations?: string[] | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          test_type?: string
          test_data?: any
          results?: any
          score?: number | null
          interpretation?: string | null
          recommendations?: string[] | null
          completed_at?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          profile_id: string
          consultant_id: string | null
          appointment_type: string
          status: string
          scheduled_at: string
          duration_minutes: number
          notes: string | null
          meeting_link: string | null
          is_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          consultant_id?: string | null
          appointment_type: string
          status?: string
          scheduled_at: string
          duration_minutes?: number
          notes?: string | null
          meeting_link?: string | null
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          consultant_id?: string | null
          appointment_type?: string
          status?: string
          scheduled_at?: string
          duration_minutes?: number
          notes?: string | null
          meeting_link?: string | null
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          profile_id: string
          appointment_id: string | null
          amount: number
          currency: string
          payment_method: string
          status: string
          transaction_id: string | null
          payment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          appointment_id?: string | null
          amount: number
          currency: string
          payment_method: string
          status?: string
          transaction_id?: string | null
          payment_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          appointment_id?: string | null
          amount?: number
          currency?: string
          payment_method?: string
          status?: string
          transaction_id?: string | null
          payment_date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Utilitaires Supabase
export const supabaseUtils = {
  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Obtenir la session actuelle
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Se connecter
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // S'inscrire
  async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Se déconnecter
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Réinitialiser le mot de passe
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  // Mettre à jour le profil
  async updateProfile(profileId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single()
    return { data, error }
  },

  // Obtenir le profil d'un utilisateur
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }
}

// Hook personnalisé pour l'authentification
export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtenir l'utilisateur initial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// Export par défaut
export default supabase 