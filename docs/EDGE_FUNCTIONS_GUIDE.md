# Guide des Edge Functions - Orientation Pro Congo

## 🚀 Vue d'ensemble

Les Edge Functions permettent d'exécuter du code côté serveur pour gérer la logique métier complexe de l'application Orientation Pro Congo.

## 📋 Fonctions disponibles

### 1. **test-analysis**
- **URL**: `/functions/v1/test-analysis`
- **Fonction**: Analyse les résultats de tests RIASEC et génère des recommandations personnalisées
- **Entrée**: 
  ```json
  {
    "test_data": {
      "test_type": "riasec",
      "results": {
        "R": 85, "I": 72, "A": 68, "S": 90, "E": 75, "C": 60
      }
    },
    "profile_id": "uuid"
  }
  ```
- **Sortie**: Analyse complète avec type de personnalité, recommandations de carrière, etc.

### 2. **appointment-reminder**
- **URL**: `/functions/v1/appointment-reminder`
- **Fonction**: Envoie des rappels automatiques pour les rendez-vous
- **Déclencheur**: Appelé manuellement ou via cron job
- **Actions**: 
  - Crée des notifications in-app
  - Envoie des SMS (si configuré)
  - Envoie des emails de rappel

### 3. **cv-optimizer**
- **URL**: `/functions/v1/cv-optimizer`
- **Fonction**: Optimise les CV selon les critères ATS
- **Entrée**:
  ```json
  {
    "cv_data": {
      "content": "contenu du CV",
      "target_position": "developer",
      "target_industry": "technology",
      "profile_id": "uuid"
    }
  }
  ```
- **Sortie**: Score ATS, mots-clés manquants, suggestions d'amélioration

### 4. **email-notifications**
- **URL**: `/functions/v1/email-notifications`
- **Fonction**: Gère l'envoi d'emails avec templates personnalisés
- **Templates disponibles**:
  - `welcome`: Email de bienvenue
  - `test_completed`: Résultats de test
  - `appointment_reminder`: Rappel de rendez-vous
  - `cv_optimized`: CV optimisé
  - `payment_confirmation`: Confirmation de paiement

## 🛠️ Installation et configuration

### Prérequis
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login
```

### Variables d'environnement requises
```bash
# Dans le fichier .env de chaque fonction
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key  # Pour les emails
SMS_API_KEY=your_sms_api_key        # Pour les SMS
```

### Déploiement local
```bash
# Démarrer Supabase localement
supabase start

# Démarrer les Edge Functions
supabase functions serve

# Tester une fonction
curl -X POST 'http://localhost:54321/functions/v1/test-analysis' \
  -H 'Authorization: Bearer your_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{"test_data": {...}}'
```

### Déploiement en production
```bash
# Déployer toutes les fonctions
supabase functions deploy test-analysis
supabase functions deploy appointment-reminder
supabase functions deploy cv-optimizer
supabase functions deploy email-notifications
```

## 📊 Utilisation dans l'application

### Frontend (React)
```typescript
import { supabase } from '@/integrations/supabase/client'

// Appeler une Edge Function
const { data, error } = await supabase.functions.invoke('test-analysis', {
  body: {
    test_data: {
      test_type: 'riasec',
      results: { R: 85, I: 72, A: 68, S: 90, E: 75, C: 60 }
    },
    profile_id: user.id
  }
})
```

### Backend (Node.js)
```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(url, serviceKey)

// Appeler une fonction
const { data, error } = await supabase.functions.invoke('cv-optimizer', {
  body: {
    cv_data: {
      content: cvContent,
      target_position: 'developer',
      profile_id: userId
    }
  }
})
```

## 🔧 Configuration avancée

### Cron Jobs pour les rappels
```bash
# Ajouter dans crontab
0 8 * * * curl -X POST 'https://your-project.supabase.co/functions/v1/appointment-reminder' \
  -H 'Authorization: Bearer your_service_role_key'
```

### Intégration SMS
```typescript
// Dans appointment-reminder/index.ts
async function sendSMSReminder(phone: string, data: any) {
  // Intégration avec Africa's Talking, Twilio, etc.
  const response = await fetch('https://api.africastalking.com/rest/messaging', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apiKey': Deno.env.get('AFRICASTALKING_API_KEY')
    },
    body: JSON.stringify({
      username: 'your_username',
      to: phone,
      message: `Rappel: Rendez-vous ${data.appointment_type} le ${data.scheduled_at}`
    })
  })
}
```

### Templates d'emails personnalisés
```typescript
// Ajouter de nouveaux templates dans email-notifications/index.ts
function generateCustomTemplate(data: any): string {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Template personnalisé</h2>
      <p>Contenu personnalisé: ${data.custom_field}</p>
    </div>
  `
}
```

## 🧪 Tests

### Test unitaire d'une fonction
```bash
# Créer un fichier de test
cat > test-function.js << 'EOF'
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient('http://localhost:54321', 'your_anon_key')

async function testFunction() {
  const { data, error } = await supabase.functions.invoke('test-analysis', {
    body: {
      test_data: {
        test_type: 'riasec',
        results: { R: 85, I: 72, A: 68, S: 90, E: 75, C: 60 }
      },
      profile_id: 'test-id'
    }
  })
  
  console.log('Résultat:', data)
  console.log('Erreur:', error)
}

testFunction()
EOF

# Exécuter le test
node test-function.js
```

## 📈 Monitoring et logs

### Voir les logs des fonctions
```bash
# Logs en temps réel
supabase functions logs --follow

# Logs d'une fonction spécifique
supabase functions logs test-analysis
```

### Métriques de performance
- Temps de réponse moyen
- Taux d'erreur
- Utilisation de la mémoire
- Nombre d'appels par jour

## 🔒 Sécurité

### Authentification
```typescript
// Vérifier l'authentification dans chaque fonction
const authHeader = req.headers.get('Authorization')
if (!authHeader) {
  return new Response('Unauthorized', { status: 401 })
}
```

### Validation des données
```typescript
// Valider les données d'entrée
function validateTestData(data: any): boolean {
  return data.test_type && data.results && data.profile_id
}
```

## 🚨 Dépannage

### Erreurs communes
1. **503 Service Unavailable**: Fonction non déployée
2. **401 Unauthorized**: Clé API manquante ou invalide
3. **400 Bad Request**: Données d'entrée invalides

### Solutions
```bash
# Redémarrer les fonctions
supabase functions serve --debug

# Vérifier les logs
supabase functions logs --follow

# Tester la connectivité
curl -X POST 'http://localhost:54321/functions/v1/hello-world' \
  -H 'Authorization: Bearer your_anon_key'
```

## 📚 Ressources

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Exemples de templates](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Guide Deno](https://deno.land/manual)
- [API Resend pour emails](https://resend.com/docs/api-reference/emails/send-email)

## 🤝 Contribution

Pour ajouter une nouvelle Edge Function :

1. Créer la fonction : `supabase functions new function-name`
2. Implémenter la logique dans `index.ts`
3. Ajouter les tests
4. Documenter l'API
5. Déployer et tester

---

**Orientation Pro Congo** - Edge Functions v1.0 