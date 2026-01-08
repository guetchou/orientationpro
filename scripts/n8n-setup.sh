#!/bin/bash

echo "🚀 Installation et configuration de N8N pour Orientation Pro Congo"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation en cours..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Créer le dossier pour N8N
mkdir -p /opt/n8n
cd /opt/n8n

# Créer le fichier docker-compose.yml pour N8N
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-orientationpro
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=orientationpro2024
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_USER_MANAGEMENT_DISABLED=false
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=smtp.gmail.com
      - N8N_SMTP_PORT=587
      - N8N_SMTP_USER=your-email@gmail.com
      - N8N_SMTP_PASS=your-app-password
      - N8N_SMTP_SENDER=your-email@gmail.com
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Europe/Paris
      - N8N_LOG_LEVEL=info
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_METRICS=false
      - N8N_DEPLOYMENT_TYPE=docker
      - N8N_CUSTOM_EXTENSIONS=/data/custom
      - N8N_EDITOR_BASE_URL=http://localhost:5678
      - N8N_ENCRYPTION_KEY=your-encryption-key-here
      - N8N_DATABASE_TYPE=postgresdb
      - N8N_DATABASE_POSTGRESDB_HOST=postgres
      - N8N_DATABASE_POSTGRESDB_PORT=5432
      - N8N_DATABASE_POSTGRESDB_DATABASE=n8n
      - N8N_DATABASE_POSTGRESDB_USER=n8n
      - N8N_DATABASE_POSTGRESDB_PASSWORD=n8n_password
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/data/workflows
      - ./credentials:/data/credentials
    depends_on:
      - postgres
    networks:
      - n8n-network

  postgres:
    image: postgres:15
    container_name: n8n-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n-network

volumes:
  n8n_data:
  postgres_data:

networks:
  n8n-network:
    driver: bridge
EOF

# Créer les dossiers nécessaires
mkdir -p workflows credentials custom

# Démarrer N8N
echo "🚀 Démarrage de N8N..."
docker-compose up -d

# Attendre que N8N soit prêt
echo "⏳ Attente du démarrage de N8N..."
sleep 30

# Vérifier que N8N fonctionne
if curl -s http://localhost:5678 > /dev/null; then
    echo "✅ N8N est accessible sur http://localhost:5678"
    echo "👤 Identifiants: admin / orientationpro2024"
else
    echo "❌ N8N n'est pas accessible"
fi

echo ""
echo "🎉 Installation N8N terminée !"
echo "📋 Prochaines étapes:"
echo "1. Accéder à http://localhost:5678"
echo "2. Se connecter avec admin/orientationpro2024"
echo "3. Importer les workflows depuis /opt/n8n/workflows/"
echo "4. Configurer les credentials" 