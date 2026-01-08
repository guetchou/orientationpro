#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:55508'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Créer le client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Comptes de test à créer
const TEST_ACCOUNTS = [
  {
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    full_name: 'Utilisateur Test',
    avatar_url: null,
    phone: '+24200000001',
    bio: 'Utilisateur standard pour les tests',
    location: 'Brazzaville, Congo',
    website: null,
    is_verified: true,
    is_active: true
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    full_name: 'Administrateur Test',
    avatar_url: null,
    phone: '+24200000002',
    bio: 'Administrateur avec tous les droits',
    location: 'Brazzaville, Congo',
    website: null,
    is_verified: true,
    is_active: true
  },
  {
    email: 'conseiller@example.com',
    password: 'conseiller123',
    role: 'conseiller',
    full_name: 'Conseiller Test',
    avatar_url: null,
    phone: '+24200000003',
    bio: 'Conseiller professionnel certifié',
    location: 'Brazzaville, Congo',
    website: null,
    is_verified: true,
    is_active: true,
    specializations: ['Orientation scolaire', 'Insertion professionnelle'],
    experience_years: 5,
    hourly_rate: 25000
  },
  {
    email: 'superadmin@example.com',
    password: 'superadmin123',
    role: 'super_admin',
    full_name: 'Super Administrateur',
    avatar_url: null,
    phone: '+24200000004',
    bio: 'Super administrateur avec tous les droits',
    location: 'Brazzaville, Congo',
    website: null,
    is_verified: true,
    is_active: true
  }
]

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test...\n')

  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`📝 Création du compte: ${account.email}`)

      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          role: account.role,
          full_name: account.full_name
        }
      })

      if (authError) {
        console.log(`⚠️  Erreur lors de la création de l'utilisateur ${account.email}:`, authError.message)
        continue
      }

      console.log(`✅ Utilisateur créé: ${account.email}`)

      // 2. Créer le profil dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: account.email,
          full_name: account.full_name,
          avatar_url: account.avatar_url,
          phone: account.phone,
          bio: account.bio,
          location: account.location,
          website: account.website,
          role: account.role,
          is_verified: account.is_verified,
          is_active: account.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.log(`⚠️  Erreur lors de la création du profil ${account.email}:`, profileError.message)
      } else {
        console.log(`✅ Profil créé: ${account.email}`)
      }

      // 3. Si c'est un conseiller, créer le profil conseiller
      if (account.role === 'conseiller') {
        const { error: conseillerError } = await supabase
          .from('conseillers')
          .insert({
            user_id: authData.user.id,
            specializations: account.specializations,
            experience_years: account.experience_years,
            hourly_rate: account.hourly_rate,
            is_available: true,
            rating: 4.5,
            total_sessions: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (conseillerError) {
          console.log(`⚠️  Erreur lors de la création du profil conseiller ${account.email}:`, conseillerError.message)
        } else {
          console.log(`✅ Profil conseiller créé: ${account.email}`)
        }
      }

      console.log(`🎉 Compte ${account.email} créé avec succès!\n`)

    } catch (error) {
      console.error(`❌ Erreur lors de la création du compte ${account.email}:`, error)
    }
  }

  console.log('📋 Résumé des comptes de test:')
  console.log('===============================')
  TEST_ACCOUNTS.forEach(account => {
    console.log(`👤 ${account.role.toUpperCase()}: ${account.email} / ${account.password}`)
  })
  console.log('\n✅ Création des comptes de test terminée!')
}

// Fonction pour vérifier si les comptes existent déjà
async function checkExistingAccounts() {
  console.log('🔍 Vérification des comptes existants...\n')

  for (const account of TEST_ACCOUNTS) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', account.email)
        .single()

      if (data) {
        console.log(`⚠️  Le compte ${account.email} existe déjà`)
      } else {
        console.log(`✅ Le compte ${account.email} n'existe pas encore`)
      }
    } catch (error) {
      console.log(`✅ Le compte ${account.email} n'existe pas encore`)
    }
  }
}

// Fonction pour supprimer les comptes de test
async function deleteTestAccounts() {
  console.log('🗑️  Suppression des comptes de test...\n')

  for (const account of TEST_ACCOUNTS) {
    try {
      // Récupérer l'ID de l'utilisateur
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', account.email)
        .single()

      if (profileData) {
        // Supprimer l'utilisateur de Supabase Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(profileData.id)
        
        if (authError) {
          console.log(`⚠️  Erreur lors de la suppression de l'utilisateur ${account.email}:`, authError.message)
        } else {
          console.log(`✅ Compte ${account.email} supprimé`)
        }
      }
    } catch (error) {
      console.log(`⚠️  Erreur lors de la suppression du compte ${account.email}:`, error.message)
    }
  }

  console.log('\n✅ Suppression des comptes de test terminée!')
}

// Fonction principale
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'check':
      await checkExistingAccounts()
      break
    case 'delete':
      await deleteTestAccounts()
      break
    case 'create':
    default:
      await createTestAccounts()
      break
  }
}

// Exécuter le script
main().catch(console.error) 