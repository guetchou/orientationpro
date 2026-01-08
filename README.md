# 🎯 Orientation Pro Congo

**Plateforme leader d'orientation professionnelle au Congo**

[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase-purple)](https://supabase.com/)
[![UI](https://img.shields.io/badge/UI-Shadcn%2FUI-black)](https://ui.shadcn.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Base de données](#-base-de-données)
- [Edge Functions](#-edge-functions)
- [API Documentation](#-api-documentation)
- [Déploiement](#-déploiement)
- [Contribuer](#-contribuer)

## 🎯 Vue d'ensemble

Orientation Pro Congo est une plateforme complète d'orientation professionnelle qui aide les étudiants et professionnels congolais à :

- **Découvrir leur personnalité** via des tests RIASEC scientifiquement validés
- **Optimiser leur CV** pour passer les filtres ATS des recruteurs
- **Trouver leur voie** avec des conseils personnalisés
- **Développer leurs compétences** grâce à un accompagnement expert

### 🎯 Objectifs

- ✅ **95% des CV optimisés** passent les filtres ATS
- ✅ **2,500+ étudiants** orientés avec succès
- ✅ **4.8/5** satisfaction client
- ✅ **150+ partenaires** entreprises et institutions

## 🚀 Fonctionnalités

### 🧠 Tests d'Orientation
- **Test RIASEC** : Analyse des 6 types de personnalité
- **Test de Compétences** : Évaluation des soft et hard skills
- **Test de Motivation** : Découverte des drivers professionnels
- **Rapports détaillés** : Recommandations personnalisées

### 📄 Optimisation CV
- **Analyse ATS** : Score de compatibilité avec les recruteurs
- **Suggestions d'amélioration** : Mots-clés et structure optimale
- **Templates professionnels** : Designs adaptés au marché congolais
- **Export PDF** : Formats prêts à l'emploi

### 📅 Gestion Rendez-vous
- **Calendrier intelligent** : Disponibilités consultants
- **Rappels automatiques** : SMS et emails
- **Vidéoconférence** : Consultations à distance
- **Suivi personnalisé** : Historique et recommandations

### 💳 Système de Paiement
- **Paiements locaux** : MTN MoMo, Airtel Money
- **Cartes bancaires** : Visa, Mastercard
- **Facturation automatique** : Reçus et justificatifs
- **Gestion des abonnements** : Plans premium

### 👥 Communauté
- **Forum d'entraide** : Discussions entre étudiants
- **Témoignages** : Success stories inspirantes
- **Ressources gratuites** : Guides et conseils
- **Networking** : Connexions professionnelles

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   Pages     │ │ Components  │ │   Hooks     │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase (Backend)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   Auth      │ │   Database  │ │   Storage   │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ Edge Funcs  │ │   Realtime  │ │   Analytics │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   Profiles  │ │ Test Results│ │Appointments │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │  Payments   │ │   Forum     │ │  Analytics  │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 🛠️ Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | React + TypeScript | 18.x |
| **UI Framework** | Shadcn/UI + Tailwind | Latest |
| **Backend** | Supabase | Latest |
| **Database** | PostgreSQL | 15.x |
| **Functions** | Edge Functions (Deno) | Latest |
| **Auth** | Supabase Auth | Latest |
| **Storage** | Supabase Storage | Latest |
| **Deployment** | Docker + Docker Compose | Latest |

## 📦 Installation

### Prérequis

```bash
# Node.js 18+ et npm
node --version
npm --version

# Docker et Docker Compose
docker --version
docker-compose --version

# Supabase CLI
npm install -g supabase
```

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/orientationpro-congo/app.git
cd orientationpro

# Installer les dépendances
npm install
cd backend && npm install
cd ..

# Démarrer l'environnement
./start.sh
```

### Installation manuelle

```bash
# 1. Frontend
npm install
npm run dev

# 2. Backend
cd backend
npm install
npm run dev

# 3. Supabase
supabase start
```

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env (Frontend)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:6465

# .env (Backend)
PORT=6465
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=orientationpro

# .env (Supabase)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
SMS_API_KEY=your_sms_api_key
```

### Configuration Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "8045:8045"
    environment:
      - NODE_ENV=development
      
  backend:
    build: ./backend
    ports:
      - "6465:6465"
    depends_on:
      - db
      
  supabase:
    image: supabase/supabase
    ports:
      - "54321:54321"
```

## 🗄️ Base de données

### Structure des tables

```sql
-- Tables principales (21 tables)
profiles              -- Utilisateurs et consultants
test_results          -- Résultats des tests
appointments          -- Rendez-vous
payments              -- Transactions
cms_contents          -- Contenu du site
documents             -- CV et fichiers
certifications        -- Formations
skills                -- Compétences
notifications         -- Notifications
analytics             -- Statistiques

-- Tables communautaires
forum_domains         -- Domaines de discussion
forum_posts           -- Posts du forum
forum_replies         -- Réponses
forum_likes           -- Likes

-- Tables métier
candidates            -- Candidats recrutement
establishments        -- Écoles/entreprises
neighborhoods         -- Quartiers
availabilities        -- Disponibilités
test_sessions         -- Sessions de tests
user_roles            -- Rôles utilisateurs
logs                  -- Journal d'activité
```

### Requêtes principales

```sql
-- Obtenir les résultats de test d'un utilisateur
SELECT * FROM test_results 
WHERE profile_id = 'user_id' 
ORDER BY created_at DESC;

-- Trouver les consultants disponibles
SELECT p.*, a.day_of_week, a.start_time, a.end_time
FROM profiles p
JOIN availabilities a ON p.id = a.consultant_id
WHERE p.current_job LIKE '%consultant%'
AND a.is_available = true;

-- Statistiques des tests RIASEC
SELECT 
  test_type,
  COUNT(*) as total_tests,
  AVG(score) as average_score
FROM test_results 
WHERE test_type = 'riasec'
GROUP BY test_type;
```

## ⚡ Edge Functions

### Fonctions disponibles

| Fonction | URL | Description |
|----------|-----|-------------|
| `test-analysis` | `/functions/v1/test-analysis` | Analyse des résultats RIASEC |
| `appointment-reminder` | `/functions/v1/appointment-reminder` | Rappels automatiques |
| `cv-optimizer` | `/functions/v1/cv-optimizer` | Optimisation CV ATS |
| `email-notifications` | `/functions/v1/email-notifications` | Envoi d'emails |

### Exemple d'utilisation

```typescript
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

## 📚 API Documentation

### Endpoints principaux

#### Tests d'orientation
```http
POST /api/tests/riasec
POST /api/tests/personality
GET /api/tests/results/:id
```

#### Rendez-vous
```http
GET /api/appointments
POST /api/appointments
PUT /api/appointments/:id
DELETE /api/appointments/:id
```

#### CV Optimizer
```http
POST /api/cv/analyze
POST /api/cv/optimize
GET /api/cv/templates
```

#### Paiements
```http
POST /api/payments/create
POST /api/payments/webhook
GET /api/payments/history
```

### Exemples de requêtes

```bash
# Créer un rendez-vous
curl -X POST http://localhost:6465/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "user_id",
    "consultant_id": "consultant_id",
    "scheduled_at": "2024-01-15T10:00:00Z",
    "appointment_type": "orientation"
  }'

# Analyser un CV
curl -X POST http://localhost:6465/api/cv/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "CV content...",
    "target_position": "developer",
    "target_industry": "technology"
  }'
```

## 🚀 Déploiement

### Production

```bash
# Build de production
npm run build

# Déploiement Docker
docker-compose -f docker-compose.prod.yml up -d

# Déploiement Supabase
supabase db push
supabase functions deploy
```

### Staging

```bash
# Environnement de test
docker-compose -f docker-compose.staging.yml up -d

# Tests automatisés
npm run test
npm run test:e2e
```

### Monitoring

```bash
# Logs en temps réel
docker-compose logs -f

# Métriques Supabase
supabase status
supabase functions logs
```

## 🤝 Contribuer

### Guide de contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de code

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Tests
npm run test
npm run test:coverage
```

### Structure du projet

```
orientationpro/
├── src/                    # Frontend React
│   ├── components/        # Composants UI
│   ├── pages/            # Pages de l'app
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilitaires
│   └── types/            # Types TypeScript
├── backend/               # API Node.js
│   ├── src/              # Code source
│   ├── routes/           # Routes API
│   └── middleware/       # Middleware
├── supabase/             # Configuration Supabase
│   ├── functions/        # Edge Functions
│   ├── migrations/       # Migrations DB
│   └── config/           # Configuration
├── docs/                 # Documentation
└── scripts/              # Scripts utilitaires
```

## 📞 Support

### Contact

- **Email** : contact@orientationpro.cg
- **Téléphone** : +242 06 123 45 67
- **Adresse** : Brazzaville, Congo

### Liens utiles

- 🌐 **Site web** : https://orientationpro.cg
- 📖 **Documentation** : https://docs.orientationpro.cg
- 💬 **Support** : https://support.orientationpro.cg
- 🐛 **Bugs** : https://github.com/orientationpro-congo/app/issues

### Communauté

- 📱 **WhatsApp** : +242 06 123 45 67
- 💬 **Telegram** : @OrientationProCongo
- 📘 **Facebook** : @OrientationProCongo
- 📸 **Instagram** : @orientationpro_congo

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Orientation Pro Congo** - Votre avenir commence ici ! 🚀

*Développé avec ❤️ au Congo*
