# ⚡ Supabase Edge Functions - Orientation Pro Congo

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Fonctions disponibles](#-fonctions-disponibles)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Monitoring](#-monitoring)
- [Troubleshooting](#-troubleshooting)

## 🎯 Vue d'ensemble

Les Edge Functions de Supabase permettent d'exécuter du code côté serveur sans gérer d'infrastructure. Elles sont parfaites pour la logique métier complexe d'Orientation Pro Congo.

### Avantages
- ✅ **Serverless** : Pas de gestion d'infrastructure
- ✅ **Global** : Déployées dans le monde entier
- ✅ **Sécurisé** : Intégration native avec Supabase Auth
- ✅ **Performant** : Temps de réponse < 100ms
- ✅ **Scalable** : Auto-scaling automatique

### Technologies utilisées
- **Runtime** : Deno 1.45.2
- **Language** : TypeScript
- **Database** : PostgreSQL via Supabase
- **Auth** : Supabase Auth
- **Storage** : Supabase Storage

## 🏗️ Architecture

### Structure des fonctions

```
supabase/functions/
├── test-analysis/             # Analyse des tests RIASEC
│   ├── index.ts              # Point d'entrée
│   ├── types.ts              # Types TypeScript
│   ├── analysis.ts           # Logique d'analyse
│   └── recommendations.ts    # Génération de recommandations
├── appointment-reminder/      # Rappels automatiques
│   ├── index.ts
│   ├── templates.ts          # Templates de notifications
│   └── notifications.ts      # Logique d'envoi
├── cv-optimizer/             # Optimisation CV ATS
│   ├── index.ts
│   ├── keywords.ts           # Base de mots-clés
│   └── optimization.ts       # Logique d'optimisation
├── email-notifications/      # Envoi d'emails
│   ├── index.ts
│   ├── templates.ts          # Templates d'emails
│   └── resend.ts            # Intégration Resend
├── payment-webhook/          # Webhooks de paiement
│   ├── index.ts
│   └── processors.ts         # Traitement des paiements
└── shared/                   # Code partagé
    ├── types.ts              # Types communs
    ├── database.ts           # Utilitaires DB
    └── validation.ts         # Validation des données
```

### Pattern commun

```typescript
// Pattern standard pour toutes les Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validation de l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // 3. Initialisation Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 4. Validation du token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // 5. Logique métier
    const body = await req.json()
    const result = await processRequest(supabase, user, body)

    // 6. Réponse
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

## 🔧 Fonctions disponibles

### 1. Test Analysis (`test-analysis`)

Analyse les résultats des tests RIASEC et génère des recommandations personnalisées.

#### Endpoint
```
POST /functions/v1/test-analysis
```

#### Body
```json
{
  "test_data": {
    "test_type": "riasec",
    "results": {
      "R": 85,
      "I": 72,
      "A": 68,
      "S": 90,
      "E": 75,
      "C": 60
    }
  },
  "profile_id": "user_uuid"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "analysis": {
      "dominant_type": "S",
      "personality_type": "Social",
      "career_recommendations": [
        "Enseignant",
        "Conseiller",
        "Psychologue",
        "Infirmier",
        "Travailleur social"
      ],
      "skills_to_develop": [
        "Communication",
        "Empathie",
        "Leadership"
      ],
      "confidence_score": 0.92,
      "detailed_analysis": {
        "strengths": ["Empathie", "Communication", "Collaboration"],
        "weaknesses": ["Conformité", "Organisation"],
        "opportunities": ["Développement leadership", "Formation continue"],
        "threats": ["Stress", "Épuisement professionnel"]
      }
    },
    "recommendations": {
      "immediate": [
        "Explorer les métiers de l'enseignement",
        "Développer vos compétences en communication"
      ],
      "short_term": [
        "Suivre une formation en psychologie",
        "Participer à des ateliers de leadership"
      ],
      "long_term": [
        "Obtenir une certification en conseil",
        "Développer votre réseau professionnel"
      ]
    }
  }
}
```

#### Code source
```typescript
// test-analysis/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { analyzeRIASEC } from './analysis.ts'
import { generateRecommendations } from './recommendations.ts'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { test_data, profile_id } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Analyse des résultats
    const analysis = await analyzeRIASEC(test_data.results)
    
    // Génération des recommandations
    const recommendations = await generateRecommendations(analysis, profile_id)

    // Sauvegarde en base
    const { error } = await supabase
      .from('test_results')
      .insert({
        profile_id,
        test_type: test_data.test_type,
        results: test_data.results,
        analysis: analysis,
        score: analysis.confidence_score
      })

    if (error) throw error

    // Envoi de notification
    await sendTestCompletedNotification(supabase, profile_id, analysis)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { analysis, recommendations } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

### 2. Appointment Reminder (`appointment-reminder`)

Envoie des rappels automatiques pour les rendez-vous.

#### Endpoint
```
POST /functions/v1/appointment-reminder
```

#### Trigger
Exécuté automatiquement via cron job toutes les heures.

#### Code source
```typescript
// appointment-reminder/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendSMS } from './notifications.ts'
import { sendEmail } from './email.ts'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer les rendez-vous dans les prochaines 24h
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles!inner(email, full_name, phone),
        profiles!consultant_id(full_name)
      `)
      .eq('status', 'confirmed')
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', tomorrow.toISOString())

    if (error) throw error

    // Envoyer les rappels
    for (const appointment of appointments) {
      const hoursUntilAppointment = Math.floor(
        (new Date(appointment.scheduled_at).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      )

      if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 0) {
        // SMS de rappel
        await sendSMS(
          appointment.profiles.phone,
          `Rappel: Rendez-vous avec ${appointment.profiles_consultant_id.full_name} dans ${hoursUntilAppointment}h. ${appointment.meeting_link || ''}`
        )

        // Email de rappel
        await sendEmail(
          appointment.profiles.email,
          'Rappel de rendez-vous',
          generateReminderEmail(appointment)
        )

        // Notification in-app
        await supabase
          .from('notifications')
          .insert({
            profile_id: appointment.profile_id,
            type: 'appointment_reminder',
            title: 'Rappel de rendez-vous',
            message: `Votre rendez-vous est dans ${hoursUntilAppointment} heures`,
            data: { appointment_id: appointment.id }
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: appointments.length 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400 }
    )
  }
})
```

### 3. CV Optimizer (`cv-optimizer`)

Optimise les CV pour passer les filtres ATS.

#### Endpoint
```
POST /functions/v1/cv-optimizer
```

#### Body
```json
{
  "content": "CV content here...",
  "target_position": "developer",
  "target_industry": "technology",
  "target_company": "Google"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "ats_score": 78,
    "keyword_matches": ["JavaScript", "React", "Node.js"],
    "missing_keywords": ["TypeScript", "Docker", "AWS"],
    "suggestions": [
      "Ajoutez plus de mots-clés techniques",
      "Utilisez des métiers quantifiables",
      "Optimisez la structure du CV"
    ],
    "readability_score": 85,
    "structure_score": 72,
    "optimized_content": "CV optimisé...",
    "keyword_density": {
      "technical": 0.15,
      "soft_skills": 0.08,
      "metrics": 0.12
    }
  }
}
```

### 4. Email Notifications (`email-notifications`)

Gère l'envoi d'emails transactionnels.

#### Endpoint
```
POST /functions/v1/email-notifications
```

#### Body
```json
{
  "to": "user@example.com",
  "template": "test_completed",
  "data": {
    "user_name": "John Doe",
    "test_type": "RIASEC",
    "results_url": "https://..."
  }
}
```

## 🛠️ Développement

### Configuration locale

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Initialiser le projet
supabase init

# 3. Démarrer l'environnement local
supabase start

# 4. Servir les fonctions localement
supabase functions serve
```

### Structure de développement

```typescript
// shared/types.ts
export interface TestData {
  test_type: 'riasec' | 'personality' | 'skills';
  results: Record<string, number>;
}

export interface AnalysisResult {
  dominant_type: string;
  personality_type: string;
  career_recommendations: string[];
  skills_to_develop: string[];
  confidence_score: number;
}

export interface Appointment {
  id: string;
  profile_id: string;
  consultant_id: string;
  scheduled_at: string;
  appointment_type: string;
  status: string;
}
```

### Tests des fonctions

```typescript
// test-analysis/test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { analyzeRIASEC } from "./analysis.ts"

Deno.test("RIASEC Analysis", async () => {
  const results = {
    R: 85,
    I: 72,
    A: 68,
    S: 90,
    E: 75,
    C: 60
  }

  const analysis = await analyzeRIASEC(results)
  
  assertEquals(analysis.dominant_type, "S")
  assertEquals(analysis.personality_type, "Social")
  assertEquals(analysis.confidence_score > 0.8, true)
})
```

### Variables d'environnement

```bash
# .env.local
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=OrientationPro
```

## 🚀 Déploiement

### Déploiement automatique

```bash
# Déployer toutes les fonctions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy test-analysis

# Déployer avec variables d'environnement
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set SMS_API_KEY=your_key
```

### Script de déploiement

```bash
#!/bin/bash
# deploy-functions.sh

echo "🚀 Déploiement des Edge Functions..."

# Vérifier les variables d'environnement
if [ -z "$RESEND_API_KEY" ]; then
  echo "❌ RESEND_API_KEY manquante"
  exit 1
fi

if [ -z "$SMS_API_KEY" ]; then
  echo "❌ SMS_API_KEY manquante"
  exit 1
fi

# Déployer les fonctions
echo "📦 Déploiement des fonctions..."
supabase functions deploy test-analysis
supabase functions deploy appointment-reminder
supabase functions deploy cv-optimizer
supabase functions deploy email-notifications

# Configurer les secrets
echo "🔐 Configuration des secrets..."
supabase secrets set RESEND_API_KEY=$RESEND_API_KEY
supabase secrets set SMS_API_KEY=$SMS_API_KEY
supabase secrets set SMS_SENDER_ID="OrientationPro"

# Vérifier le déploiement
echo "✅ Vérification du déploiement..."
supabase functions list

echo "🎉 Déploiement terminé !"
```

### CI/CD avec GitHub Actions

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy Functions
        run: |
          supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          SMS_API_KEY: ${{ secrets.SMS_API_KEY }}
```

## 📊 Monitoring

### Logs des fonctions

```bash
# Voir les logs en temps réel
supabase functions logs --follow

# Voir les logs d'une fonction spécifique
supabase functions logs test-analysis --follow

# Voir les logs d'erreur
supabase functions logs --level error
```

### Métriques de performance

```typescript
// Monitoring des performances
const startTime = Date.now()

try {
  // Logique de la fonction
  const result = await processData(data)
  
  // Log de performance
  console.log(`Function completed in ${Date.now() - startTime}ms`)
  
  return result
} catch (error) {
  // Log d'erreur avec contexte
  console.error(`Function failed after ${Date.now() - startTime}ms:`, error)
  throw error
}
```

### Alertes automatiques

```typescript
// Système d'alertes
const sendAlert = async (level: 'info' | 'warning' | 'error', message: string) => {
  const webhook = Deno.env.get('SLACK_WEBHOOK_URL')
  
  if (webhook) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${level.toUpperCase()}] ${message}`,
        color: level === 'error' ? 'danger' : level === 'warning' ? 'warning' : 'good'
      })
    })
  }
}
```

## 🔧 Troubleshooting

### Problèmes courants

#### 1. Erreur d'authentification
```bash
# Vérifier les clés
supabase status

# Régénérer les clés
supabase db reset
```

#### 2. Fonction ne répond pas
```bash
# Vérifier les logs
supabase functions logs function-name

# Redéployer la fonction
supabase functions deploy function-name
```

#### 3. Erreur de variables d'environnement
```bash
# Lister les secrets
supabase secrets list

# Définir un secret
supabase secrets set KEY_NAME=value
```

#### 4. Problème de performance
```typescript
// Optimiser les requêtes
const { data, error } = await supabase
  .from('table')
  .select('column1, column2')  // Sélectionner seulement les colonnes nécessaires
  .limit(100)                  // Limiter les résultats
  .order('created_at', { ascending: false })
```

### Debug avancé

```typescript
// Debug mode
const DEBUG = Deno.env.get('DEBUG') === 'true'

if (DEBUG) {
  console.log('Request body:', body)
  console.log('User:', user)
  console.log('Environment:', {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
    RESEND_API_KEY: Deno.env.get('RESEND_API_KEY') ? 'SET' : 'NOT_SET'
  })
}
```

## 📚 Ressources

### Documentation officielle
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/manual)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

### Exemples et templates
- [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)
- [Edge Functions Templates](https://github.com/supabase/edge-runtime)

### Support
- **Discord** : https://discord.supabase.com
- **GitHub Issues** : https://github.com/supabase/supabase/issues
- **Documentation** : https://supabase.com/docs

---

**Orientation Pro Congo** - Edge Functions Documentation v1.0 