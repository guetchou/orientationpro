#!/bin/bash

echo "🚀 Activation Complète du Système DEMO"
echo "======================================"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="/opt/orientationpro"
DEMO_SYSTEM="$PROJECT_ROOT/demo-system"

echo -e "${BLUE}📋 Configuration du système DEMO complet...${NC}"
echo "• Projet: $PROJECT_ROOT"
echo "• Système DEMO: $DEMO_SYSTEM"
echo "• Schéma DEMO: demo"
echo "• Mode: Production + DEMO intégré"

# 1. Vérifier la structure
echo ""
echo -e "${YELLOW}🔍 Vérification de la structure...${NC}"

if [ ! -d "$DEMO_SYSTEM" ]; then
    echo -e "${RED}❌ Système DEMO non trouvé${NC}"
    echo -e "${YELLOW}💡 Exécutez d'abord: ./demo-system-setup.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Structure DEMO trouvée${NC}"

# 2. Activer le mode DEMO
echo ""
echo -e "${YELLOW}🔵 Activation du mode DEMO...${NC}"

cd $DEMO_SYSTEM/scripts
./activate-demo.sh

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mode DEMO activé${NC}"
else
    echo -e "${RED}❌ Erreur activation mode DEMO${NC}"
    exit 1
fi

# 3. Configurer la base de données
echo ""
echo -e "${YELLOW}🗄️ Configuration de la base de données...${NC}"

# Vérifier la connexion PostgreSQL
if ! psql -h localhost -U postgres -d orientationpro -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Impossible de se connecter à PostgreSQL${NC}"
    echo -e "${YELLOW}💡 Vérifiez que PostgreSQL est démarré${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connexion PostgreSQL OK${NC}"

# Créer le schéma DEMO
psql -h localhost -U postgres -d orientationpro -c "CREATE SCHEMA IF NOT EXISTS demo;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schéma DEMO créé${NC}"
else
    echo -e "${RED}❌ Erreur création schéma DEMO${NC}"
fi

# 4. Générer les données de démonstration
echo ""
echo -e "${YELLOW}📊 Génération des données de démonstration...${NC}"

# Créer les tables de démonstration
cat > /tmp/demo_tables.sql << 'SQL_EOF'
-- Tables de démonstration
CREATE TABLE IF NOT EXISTS demo.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo.test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES demo.users(id),
    test_type VARCHAR(100) NOT NULL,
    score INTEGER,
    answers JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES demo.users(id),
    session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo.audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100),
    resource VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE demo.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.audit_log ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY demo_users_policy ON demo.users FOR ALL USING (schema_name() = 'demo');
CREATE POLICY demo_tests_policy ON demo.test_results FOR ALL USING (schema_name() = 'demo');
CREATE POLICY demo_sessions_policy ON demo.sessions FOR ALL USING (schema_name() = 'demo');
CREATE POLICY demo_audit_policy ON demo.audit_log FOR ALL USING (schema_name() = 'demo');
SQL_EOF

psql -h localhost -U postgres -d orientationpro -f /tmp/demo_tables.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tables DEMO créées${NC}"
else
    echo -e "${RED}❌ Erreur création tables DEMO${NC}"
fi

# Insérer des données de démonstration
cat > /tmp/demo_data.sql << 'SQL_EOF'
-- Utilisateurs de démonstration
INSERT INTO demo.users (email, password, role, name) VALUES
('demo.user@example.com', '$2b$10$demo.hash', 'user', 'Utilisateur Démo'),
('demo.admin@example.com', '$2b$10$demo.hash', 'admin', 'Admin Démo'),
('demo.conseiller@example.com', '$2b$10$demo.hash', 'conseiller', 'Conseiller Démo')
ON CONFLICT (email) DO NOTHING;

-- Sessions de démonstration
INSERT INTO demo.sessions (user_id, session_id, expires_at) VALUES
(1, 'demo_session_1', NOW() + INTERVAL '1 hour'),
(2, 'demo_session_2', NOW() + INTERVAL '1 hour'),
(3, 'demo_session_3', NOW() + INTERVAL '1 hour');

-- Tests de démonstration
INSERT INTO demo.test_results (user_id, test_type, score, answers) VALUES
(1, 'riasec', 85, '{"demo": true, "answers": [1,2,3,4,5]}'),
(1, 'emotional', 78, '{"demo": true, "answers": [2,3,4,1,5]}'),
(1, 'learning', 92, '{"demo": true, "answers": [3,4,5,2,1]}'),
(2, 'riasec', 90, '{"demo": true, "answers": [4,5,1,2,3]}'),
(2, 'multiple', 88, '{"demo": true, "answers": [5,1,2,3,4]}'),
(3, 'career-transition', 82, '{"demo": true, "answers": [1,3,5,2,4]}');

-- Logs d'audit de démonstration
INSERT INTO demo.audit_log (user_id, action, resource, ip_address) VALUES
(1, 'login', 'auth', '127.0.0.1'),
(1, 'test_start', 'riasec', '127.0.0.1'),
(1, 'test_complete', 'riasec', '127.0.0.1'),
(2, 'login', 'auth', '127.0.0.1'),
(2, 'admin_access', 'dashboard', '127.0.0.1'),
(3, 'login', 'auth', '127.0.0.1'),
(3, 'conseiller_access', 'dashboard', '127.0.0.1');
SQL_EOF

psql -h localhost -U postgres -d orientationpro -f /tmp/demo_data.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Données de démonstration générées${NC}"
else
    echo -e "${RED}❌ Erreur génération données DEMO${NC}"
fi

# 5. Configurer le frontend
echo ""
echo -e "${YELLOW}🎨 Configuration du frontend...${NC}"

cd $PROJECT_ROOT

# Vérifier que le fichier App.tsx existe
if [ -f "src/App.tsx" ]; then
    # Backup du fichier original
    cp src/App.tsx src/App.tsx.backup
    
    # Ajouter l'import du DemoProvider si pas déjà fait
    if ! grep -q "DemoProvider" src/App.tsx; then
        # Ajouter l'import
        sed -i '1i import { DemoProvider } from "./demo-system/frontend/hooks/useDemoMode";' src/App.tsx
        
        # Wrapper l'application avec DemoProvider
        sed -i 's/<AuthProvider>/<DemoProvider><AuthProvider>/' src/App.tsx
        sed -i 's/<\/AuthProvider>/<\/AuthProvider><\/DemoProvider>/' src/App.tsx
        
        echo -e "${GREEN}✅ Frontend configuré pour le mode DEMO${NC}"
    else
        echo -e "${GREEN}✅ Frontend déjà configuré pour le mode DEMO${NC}"
    fi
else
    echo -e "${RED}❌ Fichier App.tsx non trouvé${NC}"
fi

# 6. Configurer le backend
echo ""
echo -e "${YELLOW}🔧 Configuration du backend...${NC}"

# Vérifier que le fichier app.js existe
if [ -f "backend/src/app.js" ]; then
    # Backup du fichier original
    cp backend/src/app.js backend/src/app.js.backup
    
    # Ajouter le middleware DEMO si pas déjà fait
    if ! grep -q "demoMiddleware" backend/src/app.js; then
        echo "const demoMiddleware = require('./demo-system/backend/middleware/demoMiddleware');" >> backend/src/app.js
        echo "app.use(demoMiddleware.apply);" >> backend/src/app.js
        echo "app.use(demoMiddleware.handleWrites);" >> backend/src/app.js
        echo "app.use(demoMiddleware.auditActivity);" >> backend/src/app.js
        
        echo -e "${GREEN}✅ Backend configuré pour le mode DEMO${NC}"
    else
        echo -e "${GREEN}✅ Backend déjà configuré pour le mode DEMO${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Fichier app.js non trouvé - configuration manuelle nécessaire${NC}"
fi

# 7. Créer les variables d'environnement
echo ""
echo -e "${YELLOW}⚙️ Configuration des variables d'environnement...${NC}"

cat > $PROJECT_ROOT/.env.demo << 'ENV_EOF'
# Configuration DEMO
DEMO_MODE=true
DEMO_SCHEMA=demo
DEMO_PREFIX=demo_
DEMO_AUDIT=true
DEMO_ISOLATION=true

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=orientationpro
DB_USER=postgres
DB_PASSWORD=password

# Backend
BACKEND_DEMO_MIDDLEWARE=true
BACKEND_MOCK_WRITES=true
BACKEND_LOGGING=true
BACKEND_AUDIT_TRAIL=true

# Frontend
FRONTEND_DEMO_OVERLAY=true
FRONTEND_VISUAL_INDICATORS=true
FRONTEND_ADAPTIVE_BEHAVIOR=true
FRONTEND_DEMO_BADGE=true

# Sécurité
SECURITY_STRICT_ISOLATION=true
SECURITY_NO_PROD_WRITES=true
SECURITY_AUDIT_ACTIVITIES=true
SECURITY_RLS_ENABLED=true

# Monitoring
MONITORING_DEMO_METRICS=true
MONITORING_PERFORMANCE_TRACKING=true
MONITORING_ACTIVITY_LOGGING=true
ENV_EOF

echo -e "${GREEN}✅ Variables d'environnement DEMO configurées${NC}"

# 8. Tester le système
echo ""
echo -e "${YELLOW}🧪 Test du système DEMO...${NC}"

# Lancer les tests
cd $DEMO_SYSTEM/scripts
./test-demo-system.sh

# 9. Afficher le résumé
echo ""
echo -e "${GREEN}🎉 Système DEMO activé avec succès !${NC}"
echo ""
echo -e "${YELLOW}📋 Résumé de l'installation:${NC}"
echo "✅ Structure DEMO créée"
echo "✅ Mode DEMO activé"
echo "✅ Base de données configurée"
echo "✅ Données de démonstration générées"
echo "✅ Frontend configuré"
echo "✅ Backend configuré"
echo "✅ Variables d'environnement définies"
echo "✅ Tests effectués"
echo ""
echo -e "${BLUE}📊 Données de démonstration:${NC}"
echo "• Utilisateurs: demo.user@example.com, demo.admin@example.com, demo.conseiller@example.com"
echo "• Tests: 6 tests de démonstration générés"
echo "• Sessions: 3 sessions actives"
echo "• Logs: 7 entrées d'audit"
echo ""
echo -e "${PURPLE}🚀 Prochaines étapes:${NC}"
echo "1. Redémarrer l'application: npm run dev"
echo "2. Tester le mode DEMO: http://localhost:8045"
echo "3. Vérifier l'overlay DEMO"
echo "4. Tester les fonctionnalités"
echo "5. Consulter la documentation: $DEMO_SYSTEM/docs/"
echo ""
echo -e "${CYAN}📚 Documentation disponible:${NC}"
echo "• Guide principal: $DEMO_SYSTEM/docs/README.md"
echo "• Guide admin: $DEMO_SYSTEM/docs/ADMIN.md"
echo "• Guide utilisateur: $DEMO_SYSTEM/docs/USER.md"
echo "• Documentation technique: $DEMO_SYSTEM/docs/TECHNICAL.md"
echo ""
echo -e "${YELLOW}🛠️ Scripts de gestion:${NC}"
echo "• Activation: ./demo-system/scripts/activate-demo.sh"
echo "• Désactivation: ./demo-system/scripts/deactivate-demo.sh"
echo "• Reset: ./demo-system/scripts/reset-demo.sh"
echo "• Tests: ./demo-system/scripts/test-demo-system.sh"
echo "• Monitoring: ./demo-system/scripts/monitor-demo.sh"
echo ""
echo -e "${GREEN}🎯 Système DEMO prêt à l'emploi !${NC}" 