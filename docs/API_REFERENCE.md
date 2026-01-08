# 📚 API Reference - Orientation Pro Congo

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Authentification](#-authentification)
- [Endpoints](#-endpoints)
- [Modèles de données](#-modèles-de-données)
- [Codes d'erreur](#-codes-derreur)
- [Exemples](#-exemples)

## 🎯 Vue d'ensemble

L'API Orientation Pro Congo fournit un accès programmatique à toutes les fonctionnalités de la plateforme via REST et GraphQL.

### Base URL
- **Production** : `https://api.orientationpro.cg`
- **Staging** : `https://staging-api.orientationpro.cg`
- **Local** : `http://localhost:6465`

### Format des réponses
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Headers requis
```http
Content-Type: application/json
Authorization: Bearer <token>
X-API-Version: v1
```

## 🔐 Authentification

### OAuth 2.0 avec JWT

```bash
# Obtenir un token
curl -X POST https://api.orientationpro.cg/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user"
    }
  }
}
```

### Rôles et permissions

| Rôle | Permissions |
|------|-------------|
| `user` | Tests, CV, Rendez-vous personnels |
| `consultant` | Gestion rendez-vous, conseils |
| `admin` | Gestion utilisateurs, analytics |
| `super_admin` | Toutes les permissions |

## 📡 Endpoints

### 🔐 Authentification

#### POST /auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+242 06 123 4567",
  "birth_date": "1990-01-15",
  "gender": "male",
  "education_level": "bachelor",
  "interests": ["technology", "education"],
  "goals": ["career_change", "skill_development"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "jwt_token"
  }
}
```

#### POST /auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/refresh
Renouveler le token d'accès.

**Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### POST /auth/logout
Déconnexion.

**Headers:**
```http
Authorization: Bearer <access_token>
```

### 🧠 Tests d'Orientation

#### GET /tests
Récupérer la liste des tests disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "riasec",
      "name": "Test RIASEC",
      "description": "Découvrez votre type de personnalité professionnelle",
      "duration": 15,
      "questions_count": 60,
      "is_available": true
    },
    {
      "id": "personality",
      "name": "Test de Personnalité",
      "description": "Analyse approfondie de votre personnalité",
      "duration": 20,
      "questions_count": 80,
      "is_available": true
    }
  ]
}
```

#### POST /tests/riasec/start
Commencer un test RIASEC.

**Body:**
```json
{
  "profile_id": "user_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session_uuid",
    "questions": [
      {
        "id": 1,
        "text": "J'aime travailler avec des outils et des machines",
        "category": "R",
        "options": [
          {"value": 1, "text": "Pas du tout d'accord"},
          {"value": 2, "text": "Pas d'accord"},
          {"value": 3, "text": "Neutre"},
          {"value": 4, "text": "D'accord"},
          {"value": 5, "text": "Tout à fait d'accord"}
        ]
      }
    ],
    "total_questions": 60,
    "estimated_duration": 15
  }
}
```

#### POST /tests/riasec/submit
Soumettre les réponses du test RIASEC.

**Body:**
```json
{
  "session_id": "session_uuid",
  "answers": [
    {"question_id": 1, "value": 4},
    {"question_id": 2, "value": 3},
    {"question_id": 3, "value": 5}
  ],
  "profile_id": "user_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "R": 85,
      "I": 72,
      "A": 68,
      "S": 90,
      "E": 75,
      "C": 60
    },
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
      "confidence_score": 0.92
    }
  }
}
```

#### GET /tests/results/:id
Récupérer les résultats d'un test.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "result_uuid",
    "test_type": "riasec",
    "results": { ... },
    "analysis": { ... },
    "completed_at": "2024-01-15T10:45:00Z",
    "score": 0.92
  }
}
```

### 📅 Rendez-vous

#### GET /appointments
Récupérer la liste des rendez-vous.

**Query Parameters:**
- `status` : pending, confirmed, cancelled, completed
- `date_from` : YYYY-MM-DD
- `date_to` : YYYY-MM-DD
- `consultant_id` : uuid

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "appointment_uuid",
      "profile_id": "user_uuid",
      "consultant_id": "consultant_uuid",
      "consultant_name": "Dr. Marie Kimboula",
      "appointment_type": "orientation",
      "status": "confirmed",
      "scheduled_at": "2024-01-20T14:00:00Z",
      "duration_minutes": 60,
      "notes": "Première consultation",
      "meeting_link": "https://meet.google.com/abc-defg-hij",
      "is_paid": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

#### POST /appointments
Créer un nouveau rendez-vous.

**Body:**
```json
{
  "consultant_id": "consultant_uuid",
  "appointment_type": "orientation",
  "scheduled_at": "2024-01-20T14:00:00Z",
  "notes": "Première consultation",
  "duration_minutes": 60
}
```

#### PUT /appointments/:id
Modifier un rendez-vous.

**Body:**
```json
{
  "scheduled_at": "2024-01-21T15:00:00Z",
  "notes": "Reporté à la demande du client"
}
```

#### DELETE /appointments/:id
Annuler un rendez-vous.

#### GET /appointments/consultants
Récupérer la liste des consultants disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "consultant_uuid",
      "full_name": "Dr. Marie Kimboula",
      "specialization": "Orientation scolaire",
      "experience_years": 8,
      "rating": 4.8,
      "reviews_count": 45,
      "hourly_rate": 25000,
      "currency": "XAF",
      "availabilities": [
        {
          "day_of_week": 1,
          "start_time": "09:00",
          "end_time": "17:00"
        }
      ]
    }
  ]
}
```

### 📄 CV Optimizer

#### POST /cv/analyze
Analyser un CV pour l'optimisation ATS.

**Body:**
```json
{
  "content": "CV content here...",
  "target_position": "developer",
  "target_industry": "technology",
  "target_company": "Google"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ats_score": 78,
    "keyword_matches": ["JavaScript", "React", "Node.js"],
    "missing_keywords": ["TypeScript", "Docker", "AWS"],
    "suggestions": [
      "Ajoutez plus de mots-clés techniques",
      "Utilisez des métriques quantifiables",
      "Optimisez la structure du CV"
    ],
    "readability_score": 85,
    "structure_score": 72,
    "optimized_content": "CV optimisé..."
  }
}
```

#### POST /cv/optimize
Optimiser un CV selon les recommandations.

**Body:**
```json
{
  "original_content": "CV original...",
  "target_position": "developer",
  "target_industry": "technology",
  "optimization_level": "high"
}
```

#### GET /cv/templates
Récupérer les templates de CV disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "modern",
      "name": "Moderne",
      "description": "Design épuré et professionnel",
      "preview_url": "https://...",
      "is_free": true
    },
    {
      "id": "creative",
      "name": "Créatif",
      "description": "Design original et attractif",
      "preview_url": "https://...",
      "is_free": false,
      "price": 5000,
      "currency": "XAF"
    }
  ]
}
```

### 💳 Paiements

#### POST /payments/create
Créer un nouveau paiement.

**Body:**
```json
{
  "amount": 25000,
  "currency": "XAF",
  "payment_method": "mtn_momo",
  "description": "Consultation Dr. Marie Kimboula",
  "appointment_id": "appointment_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_uuid",
    "amount": 25000,
    "currency": "XAF",
    "status": "pending",
    "payment_url": "https://payment.orientationpro.cg/pay/...",
    "expires_at": "2024-01-15T11:30:00Z"
  }
}
```

#### GET /payments/:id
Récupérer le statut d'un paiement.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_uuid",
    "amount": 25000,
    "currency": "XAF",
    "status": "completed",
    "transaction_id": "MTN123456789",
    "completed_at": "2024-01-15T10:35:00Z",
    "receipt_url": "https://..."
  }
}
```

#### GET /payments/history
Historique des paiements.

**Query Parameters:**
- `status` : pending, completed, failed, refunded
- `date_from` : YYYY-MM-DD
- `date_to` : YYYY-MM-DD

### 👥 Profils Utilisateurs

#### GET /profile
Récupérer le profil de l'utilisateur connecté.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+242 06 123 4567",
    "birth_date": "1990-01-15",
    "gender": "male",
    "education_level": "bachelor",
    "current_job": "Développeur",
    "experience_years": 3,
    "interests": ["technology", "education"],
    "goals": ["career_change", "skill_development"],
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /profile
Mettre à jour le profil utilisateur.

**Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "+242 06 987 6543",
  "current_job": "Senior Developer",
  "experience_years": 5,
  "interests": ["technology", "leadership", "innovation"]
}
```

#### POST /profile/avatar
Uploader une photo de profil.

**Content-Type:** `multipart/form-data`

**Body:**
```
avatar: [file]
```

### 📊 Analytics

#### GET /analytics/dashboard
Récupérer les statistiques du tableau de bord.

**Response:**
```json
{
  "success": true,
  "data": {
    "tests_completed": 1250,
    "appointments_scheduled": 340,
    "cv_optimized": 890,
    "revenue_month": 2500000,
    "currency": "XAF",
    "user_satisfaction": 4.8,
    "top_consultants": [
      {
        "id": "consultant_uuid",
        "name": "Dr. Marie Kimboula",
        "appointments": 45,
        "rating": 4.9
      }
    ],
    "popular_tests": [
      {
        "test_type": "riasec",
        "completions": 650,
        "avg_score": 0.85
      }
    ]
  }
}
```

#### GET /analytics/tests
Statistiques détaillées des tests.

**Query Parameters:**
- `test_type` : riasec, personality, skills
- `date_from` : YYYY-MM-DD
- `date_to` : YYYY-MM-DD

## 📋 Modèles de données

### User
```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  education_level?: string;
  current_job?: string;
  experience_years?: number;
  interests?: string[];
  goals?: string[];
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### TestResult
```typescript
interface TestResult {
  id: string;
  profile_id: string;
  test_type: string;
  test_data: any;
  results: any;
  score?: number;
  interpretation?: string;
  recommendations?: string[];
  completed_at: string;
  created_at: string;
}
```

### Appointment
```typescript
interface Appointment {
  id: string;
  profile_id: string;
  consultant_id?: string;
  appointment_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
  meeting_link?: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}
```

### Payment
```typescript
interface Payment {
  id: string;
  profile_id: string;
  appointment_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date: string;
  created_at: string;
}
```

## ❌ Codes d'erreur

### Codes HTTP
- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Ressource non trouvée
- `422` : Données invalides
- `429` : Trop de requêtes
- `500` : Erreur serveur

### Codes d'erreur personnalisés
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": {
      "email": "L'email doit être valide",
      "password": "Le mot de passe doit contenir au moins 8 caractères"
    }
  }
}
```

### Codes d'erreur courants
- `AUTH_INVALID_CREDENTIALS` : Identifiants invalides
- `AUTH_TOKEN_EXPIRED` : Token expiré
- `AUTH_INSUFFICIENT_PERMISSIONS` : Permissions insuffisantes
- `VALIDATION_ERROR` : Erreur de validation
- `RESOURCE_NOT_FOUND` : Ressource non trouvée
- `PAYMENT_FAILED` : Échec du paiement
- `APPOINTMENT_CONFLICT` : Conflit de rendez-vous

## 💡 Exemples

### Exemple complet - Test RIASEC

```bash
# 1. Authentification
curl -X POST https://api.orientationpro.cg/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 2. Commencer le test
curl -X POST https://api.orientationpro.cg/tests/riasec/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "user_uuid"
  }'

# 3. Soumettre les réponses
curl -X POST https://api.orientationpro.cg/tests/riasec/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_uuid",
    "answers": [
      {"question_id": 1, "value": 4},
      {"question_id": 2, "value": 3}
    ],
    "profile_id": "user_uuid"
  }'
```

### Exemple - Créer un rendez-vous

```bash
# 1. Récupérer les consultants
curl -X GET https://api.orientationpro.cg/appointments/consultants \
  -H "Authorization: Bearer <token>"

# 2. Créer le rendez-vous
curl -X POST https://api.orientationpro.cg/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "consultant_id": "consultant_uuid",
    "appointment_type": "orientation",
    "scheduled_at": "2024-01-20T14:00:00Z",
    "notes": "Première consultation"
  }'

# 3. Payer le rendez-vous
curl -X POST https://api.orientationpro.cg/payments/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000,
    "currency": "XAF",
    "payment_method": "mtn_momo",
    "description": "Consultation orientation",
    "appointment_id": "appointment_uuid"
  }'
```

### Exemple - Optimiser un CV

```bash
# 1. Analyser le CV
curl -X POST https://api.orientationpro.cg/cv/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "CV content here...",
    "target_position": "developer",
    "target_industry": "technology"
  }'

# 2. Optimiser le CV
curl -X POST https://api.orientationpro.cg/cv/optimize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "original_content": "CV original...",
    "target_position": "developer",
    "target_industry": "technology",
    "optimization_level": "high"
  }'
```

## 📞 Support API

### Documentation interactive
- **Swagger UI** : https://api.orientationpro.cg/docs
- **Postman Collection** : https://api.orientationpro.cg/postman

### Support technique
- **Email** : api-support@orientationpro.cg
- **Slack** : #api-support
- **Documentation** : https://docs.orientationpro.cg/api

---

**Orientation Pro Congo** - API Reference v1.0 