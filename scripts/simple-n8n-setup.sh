#!/bin/bash

echo "🚀 Installation N8N Simple"

# Arrêter N8N existant
echo "🛑 Arrêt de N8N existant..."
docker-compose -f /opt/n8n/docker-compose.yml down 2>/dev/null

# Créer un docker-compose.yml simple
echo "📝 Création d'une configuration N8N simple..."
cat > /opt/n8n/docker-compose.yml << 'EOF'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-simple
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=orientationpro2024
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Europe/Paris
      - N8N_LOG_LEVEL=info
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_METRICS=false
      - N8N_DEPLOYMENT_TYPE=docker
      - N8N_EDITOR_BASE_URL=http://localhost:5678
      - N8N_ENCRYPTION_KEY=simple-key-2024
      - N8N_DATABASE_TYPE=sqlite
      - N8N_DATABASE_SQLITE_VACUUM_ON_STARTUP=true
      - N8N_DATABASE_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - n8n-network

volumes:
  n8n_data:

networks:
  n8n-network:
    driver: bridge
EOF

# Démarrer N8N simple
echo "🚀 Démarrage de N8N simple..."
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
        echo "🎉 N8N installé avec succès !"
        echo ""
        echo "📋 Prochaines étapes:"
        echo "1. Accédez à http://localhost:5678"
        echo "2. Connectez-vous avec admin/orientationpro2024"
        echo "3. Créez manuellement les workflows ou importez depuis /opt/orientationpro/workflows/"
        echo ""
        echo "📁 Workflows disponibles:"
        ls -la /opt/orientationpro/workflows/*.json | while read -r line; do
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