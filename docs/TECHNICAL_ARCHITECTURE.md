# 🏗️ Architecture Technique - Orientation Pro Congo

## 📋 Vue d'ensemble

Ce document décrit l'architecture technique complète de la plateforme Orientation Pro Congo, incluant les choix technologiques, l'organisation du code et les patterns utilisés.

## 🎯 Objectifs architecturaux

- **Scalabilité** : Support de milliers d'utilisateurs simultanés
- **Performance** : Temps de réponse < 200ms pour les API
- **Sécurité** : Authentification robuste et protection des données
- **Maintenabilité** : Code modulaire et bien documenté
- **Disponibilité** : 99.9% de uptime
- **Flexibilité** : Architecture extensible pour nouvelles fonctionnalités

## 🏛️ Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   React     │ │ TypeScript  │ │   Vite      │         │
│  │   (SPA)     │ │   (Type     │ │   (Build)   │         │
│  │             │ │   Safety)   │ │             │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   Supabase  │ │   Auth      │ │   RLS       │         │
│  │   (REST)    │ │   (JWT)     │ │   (Security)│         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ Edge Funcs  │ │   Node.js   │ │   Services  │         │
│  │ (Serverless)│ │   (Express) │ │   (Domain)  │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ PostgreSQL  │ │   Storage   │ │   Cache     │         │
│  │ (Database)  │ │   (Files)   │ │   (Redis)   │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Structure des composants

```
src/
├── components/
│   ├── ui/                    # Composants UI réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/                # Composants de mise en page
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── forms/                 # Composants de formulaires
│   │   ├── TestForm.tsx
│   │   ├── AppointmentForm.tsx
│   │   └── CVForm.tsx
│   └── features/              # Composants métier
│       ├── tests/
│       ├── appointments/
│       └── cv-optimizer/
├── pages/                     # Pages de l'application
│   ├── Home.tsx
│   ├── Tests.tsx
│   ├── Dashboard.tsx
│   └── Profile.tsx
├── hooks/                     # Custom hooks
│   ├── useAuth.ts
│   ├── useTests.ts
│   └── useAppointments.ts
├── utils/                     # Utilitaires
│   ├── api.ts
│   ├── validation.ts
│   └── helpers.ts
└── types/                     # Types TypeScript
    ├── user.ts
    ├── test.ts
    └── appointment.ts
```

### Patterns utilisés

#### 1. **Container/Presenter Pattern**
```typescript
// Container component
const TestContainer = () => {
  const { data, loading, error } = useTests()
  
  return <TestPresenter 
    data={data} 
    loading={loading} 
    error={error} 
  />
}

// Presenter component
const TestPresenter = ({ data, loading, error }) => {
  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  
  return <TestList tests={data} />
}
```

#### 2. **Custom Hooks Pattern**
```typescript
// useTests.ts
export const useTests = () => {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTests = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
      if (error) throw error
      setTests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  return { tests, loading, error, refetch: fetchTests }
}
```

#### 3. **Context Pattern**
```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 🔧 Backend Architecture

### Structure des services

```
backend/
├── src/
│   ├── controllers/           # Contrôleurs API
│   │   ├── TestController.ts
│   │   ├── AppointmentController.ts
│   │   └── UserController.ts
│   ├── services/              # Logique métier
│   │   ├── TestService.ts
│   │   ├── AppointmentService.ts
│   │   └── EmailService.ts
│   ├── middleware/            # Middleware Express
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── routes/                # Routes API
│   │   ├── tests.ts
│   │   ├── appointments.ts
│   │   └── users.ts
│   ├── models/                # Modèles de données
│   │   ├── User.ts
│   │   ├── Test.ts
│   │   └── Appointment.ts
│   └── utils/                 # Utilitaires
│       ├── database.ts
│       ├── logger.ts
│       └── validators.ts
```

### Patterns backend

#### 1. **Service Layer Pattern**
```typescript
// TestService.ts
export class TestService {
  async createTestResult(data: CreateTestData): Promise<TestResult> {
    // Validation
    const validatedData = await this.validateTestData(data)
    
    // Business logic
    const analysis = await this.analyzeTestResults(validatedData)
    
    // Persistence
    const result = await this.testRepository.create({
      ...validatedData,
      analysis
    })
    
    // Side effects
    await this.notificationService.sendTestCompleted(result)
    
    return result
  }

  private async validateTestData(data: CreateTestData): Promise<ValidatedTestData> {
    // Validation logic
  }

  private async analyzeTestResults(data: ValidatedTestData): Promise<TestAnalysis> {
    // Analysis logic
  }
}
```

#### 2. **Repository Pattern**
```typescript
// TestRepository.ts
export class TestRepository {
  constructor(private db: SupabaseClient) {}

  async create(data: CreateTestData): Promise<TestResult> {
    const { data: result, error } = await this.db
      .from('test_results')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return result
  }

  async findByUserId(userId: string): Promise<TestResult[]> {
    const { data, error } = await this.db
      .from('test_results')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new DatabaseError(error.message)
    return data
  }
}
```

#### 3. **Middleware Pattern**
```typescript
// auth.ts
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token verification failed' })
  }
}
```

## 🗄️ Database Architecture

### Schéma de base de données

```sql
-- Core tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10),
  education_level VARCHAR(100),
  current_job VARCHAR(255),
  experience_years INTEGER,
  interests TEXT[],
  goals TEXT[],
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test results with JSONB for flexibility
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_type VARCHAR(50) NOT NULL,
  test_data JSONB NOT NULL,
  results JSONB NOT NULL,
  score REAL,
  interpretation TEXT,
  recommendations TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments with status tracking
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  meeting_link TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes pour performance

```sql
-- Performance indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_test_results_profile_id ON test_results(profile_id);
CREATE INDEX idx_test_results_test_type ON test_results(test_type);
CREATE INDEX idx_appointments_profile_id ON appointments(profile_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);

-- Full-text search indexes
CREATE INDEX idx_profiles_full_name_fts ON profiles USING gin(to_tsvector('french', full_name));
CREATE INDEX idx_test_results_interpretation_fts ON test_results USING gin(to_tsvector('french', interpretation));
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for test_results
CREATE POLICY "Users can view own test results" ON test_results
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create own test results" ON test_results
  FOR INSERT WITH CHECK (auth.uid() = profile_id);
```

## ⚡ Edge Functions Architecture

### Structure des fonctions

```
supabase/functions/
├── test-analysis/             # Analyse des tests RIASEC
│   ├── index.ts
│   └── types.ts
├── appointment-reminder/      # Rappels automatiques
│   ├── index.ts
│   └── templates.ts
├── cv-optimizer/             # Optimisation CV ATS
│   ├── index.ts
│   └── keywords.ts
└── email-notifications/      # Envoi d'emails
    ├── index.ts
    └── templates.ts
```

### Pattern des Edge Functions

```typescript
// test-analysis/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse request
    const { test_data, profile_id } = await req.json()

    // 3. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 4. Business logic
    const analysis = await analyzeTestResults(test_data)

    // 5. Save to database
    const { error } = await supabase
      .from('test_results')
      .insert({
        profile_id,
        test_type: test_data.test_type,
        results: analysis,
        score: analysis.confidence_score
      })

    if (error) throw error

    // 6. Send notification
    await sendNotification(supabase, profile_id, analysis)

    // 7. Return response
    return new Response(
      JSON.stringify({ success: true, analysis }),
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

## 🔒 Security Architecture

### Authentification

```typescript
// Multi-layer authentication
const authMiddleware = [
  // 1. JWT validation
  authenticateToken,
  
  // 2. Role-based access
  checkUserRole(['user', 'consultant', 'admin']),
  
  // 3. Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }),
  
  // 4. Input validation
  validateRequest(schema)
]
```

### Data Protection

```sql
-- Encrypt sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash sensitive fields
UPDATE profiles SET 
  phone = pgp_sym_encrypt(phone, 'encryption_key'),
  birth_date = pgp_sym_encrypt(birth_date::text, 'encryption_key')
WHERE phone IS NOT NULL;

-- Audit trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100),
  record_id UUID,
  action VARCHAR(20),
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 Performance Architecture

### Caching Strategy

```typescript
// Redis caching
const cache = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

// Cache middleware
const cacheMiddleware = (duration: number) => async (req: Request, res: Response, next: NextFunction) => {
  const key = `cache:${req.originalUrl}`
  
  try {
    const cached = await cache.get(key)
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    // Store original send method
    const originalSend = res.json
    
    // Override send method
    res.json = function(data) {
      cache.setex(key, duration, JSON.stringify(data))
      return originalSend.call(this, data)
    }
    
    next()
  } catch (error) {
    next()
  }
}
```

### Database Optimization

```sql
-- Partitioning for large tables
CREATE TABLE test_results_partitioned (
  LIKE test_results INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create partitions by month
CREATE TABLE test_results_2024_01 PARTITION OF test_results_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Materialized views for analytics
CREATE MATERIALIZED VIEW test_analytics AS
SELECT 
  test_type,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_tests,
  AVG(score) as average_score,
  COUNT(DISTINCT profile_id) as unique_users
FROM test_results
GROUP BY test_type, DATE_TRUNC('month', created_at);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW test_analytics;
```

## 🚀 Deployment Architecture

### Docker Configuration

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8045
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "8045:8045"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
      
  backend:
    build: ./backend
    ports:
      - "6465:6465"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - redis
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
  supabase:
    image: supabase/supabase
    ports:
      - "54321:54321"
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      
volumes:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /opt/orientationpro
            git pull origin main
            docker-compose up -d --build
```

## 📈 Monitoring Architecture

### Logging Strategy

```typescript
// Structured logging
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'orientation-pro' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Request logging middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })
  })
  
  next()
}
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    supabase: false
  }
  
  try {
    // Check database
    const dbResult = await supabase.from('profiles').select('count').limit(1)
    checks.database = !dbResult.error
    
    // Check Redis
    const redisResult = await cache.ping()
    checks.redis = redisResult === 'PONG'
    
    // Check Supabase
    const supabaseResult = await supabase.auth.getSession()
    checks.supabase = !!supabaseResult.data.session
    
    const allHealthy = Object.values(checks).every(Boolean)
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})
```

## 🔄 Data Flow Architecture

### Request Flow

```
1. Client Request
   ↓
2. Load Balancer (Nginx)
   ↓
3. Frontend (React SPA)
   ↓
4. API Gateway (Supabase)
   ↓
5. Authentication (JWT)
   ↓
6. Rate Limiting
   ↓
7. Business Logic (Edge Functions)
   ↓
8. Database (PostgreSQL)
   ↓
9. Response
```

### Real-time Updates

```typescript
// Supabase real-time subscriptions
const subscription = supabase
  .channel('test_results')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'test_results' },
    (payload) => {
      // Update UI in real-time
      updateTestResults(payload.new)
    }
  )
  .subscribe()
```

## 🎯 Performance Metrics

### Key Performance Indicators (KPIs)

- **Response Time** : < 200ms pour 95% des requêtes
- **Throughput** : 1000+ requêtes/seconde
- **Uptime** : 99.9%
- **Error Rate** : < 0.1%
- **Database Connections** : < 80% utilisation
- **Memory Usage** : < 80% utilisation

### Monitoring Tools

- **Application Performance** : New Relic
- **Infrastructure** : Datadog
- **Error Tracking** : Sentry
- **Logs** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Database** : pgAdmin + custom dashboards

---

**Orientation Pro Congo** - Architecture Technique v1.0 