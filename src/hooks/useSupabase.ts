import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

// Hook pour l'authentification
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtenir la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading }
}

// Hook pour les profils utilisateurs
export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateProfile = async (updates: any) => {
    if (!userId) return { error: 'ID utilisateur requis' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  return { profile, loading, error, updateProfile }
}

// Hook pour les tests
export const useTests = () => {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTests = async (userId?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('test_results')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('profile_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      setTests(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tests')
    } finally {
      setLoading(false)
    }
  }

  const createTestResult = async (testData: any) => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert(testData)
        .select()
        .single()

      if (error) throw error
      setTests(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du test'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  return { tests, loading, error, fetchTests, createTestResult }
}

// Hook pour les rendez-vous
export const useAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = async (userId?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('appointments')
        .select(`
          *,
          profiles!inner(full_name, email, phone),
          profiles!consultant_id(full_name, email)
        `)
        .order('scheduled_at', { ascending: true })

      if (userId) {
        query = query.eq('profile_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des rendez-vous')
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()

      if (error) throw error
      setAppointments(prev => [...prev, data])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du rendez-vous'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateAppointment = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAppointments(prev => prev.map(apt => apt.id === id ? data : apt))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du rendez-vous'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  return { 
    appointments, 
    loading, 
    error, 
    fetchAppointments, 
    createAppointment, 
    updateAppointment 
  }
}

// Hook pour les paiements
export const usePayments = () => {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async (userId?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('profile_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paiements')
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (paymentData: any) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) throw error
      setPayments(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du paiement'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  return { payments, loading, error, fetchPayments, createPayment }
}

// Hook pour les notifications en temps réel
export const useRealtime = (table: string, filter?: string) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          console.log('Change received!', payload)
          // Mettre à jour les données selon le type d'événement
          if (payload.eventType === 'INSERT') {
            setData(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter])

  return { data, loading }
}

// Export des hooks
export { supabase } 