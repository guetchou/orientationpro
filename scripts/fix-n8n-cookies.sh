#!/bin/bash

echo "🔧 Correction du problème de cookies sécurisés N8N"

# Arrêter N8N
echo "🛑 Arrêt de N8N..."
docker-compose -f /opt/n8n/docker-compose.yml down 2>/dev/null
docker stop n8n-simple 2>/dev/null
docker rm n8n-simple 2>/dev/null

# Créer un nouveau docker-compose.yml avec les bonnes variables
echo "📝 Création d'une configuration N8N corrigée..."
cat > /opt/n8n/docker-compose.yml << 'EOF'
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
      - N8N_SECURE_COOKIE=false
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
      - N8N_ENCRYPTION_KEY=orientationpro-encryption-key-2024
      - N8N_DATABASE_TYPE=sqlite
      - N8N_DATABASE_SQLITE_VACUUM_ON_STARTUP=true
      - N8N_DATABASE_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/data/workflows
      - ./credentials:/data/credentials
    networks:
      - n8n-network

volumes:
  n8n_data:

networks:
  n8n-network:
    driver: bridge
EOF

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p /opt/n8n/workflows /opt/n8n/credentials /opt/n8n/custom

# Copier les workflows
echo "📋 Copie des workflows..."
cp /opt/orientationpro/workflows/*.json /opt/n8n/workflows/

# Démarrer N8N avec la configuration corrigée
echo "🚀 Démarrage de N8N avec cookies non sécurisés..."
docker-compose -f /opt/n8n/docker-compose.yml up -d

# Attendre que N8N soit prêt
echo "⏳ Attente du démarrage de N8N..."
sleep 30

# Vérifier que N8N fonctionne
echo "🔍 Vérification de N8N..."
for i in {1..10}; do
    if curl -s http://localhost:5678 > /dev/null; then
        echo "✅ N8N est accessible sur http://localhost:5678"
        echo "👤 Identifiants: admin / orientationpro2024"
        echo ""
        echo "🎉 Problème de cookies résolu !"
        echo ""
        echo "📋 Prochaines étapes:"
        echo "1. Accédez à http://localhost:5678"
        echo "2. Connectez-vous avec admin/orientationpro2024"
        echo "3. Importez les workflows depuis /opt/n8n/workflows/"
        echo "4. Activez chaque workflow"
        echo ""
        echo "📁 Workflows disponibles:"
        ls -la /opt/n8n/workflows/*.json | while read -r line; do
            echo "   • $(basename "$line")"
        done
        exit 0
    else
        echo "⏳ Tentative $i/10 - N8N n'est pas encore prêt..."
        sleep 10
    fi
done

echo "❌ N8N n'est pas accessible après 10 tentatives"
echo "Vérifiez les logs: docker-compose -f /opt/n8n/docker-compose.yml logs n8n" 