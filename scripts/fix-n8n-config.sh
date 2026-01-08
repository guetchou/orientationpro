#!/bin/bash

echo "🔧 Correction de la configuration N8N"

# Arrêter N8N
echo "🛑 Arrêt de N8N..."
docker-compose -f /opt/n8n/docker-compose.yml down

# Créer un nouveau docker-compose.yml corrigé
echo "📝 Création d'un nouveau docker-compose.yml..."
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
      - N8N_DATABASE_TYPE=postgresdb
      - N8N_DATABASE_POSTGRESDB_HOST=postgres
      - N8N_DATABASE_POSTGRESDB_PORT=5432
      - N8N_DATABASE_POSTGRESDB_DATABASE=n8n
      - N8N_DATABASE_POSTGRESDB_USER=n8n
      - N8N_DATABASE_POSTGRESDB_PASSWORD=n8n_password
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
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
echo "📁 Création des dossiers..."
mkdir -p /opt/n8n/workflows /opt/n8n/credentials /opt/n8n/custom

# Copier les workflows
echo "📋 Copie des workflows..."
cp /opt/orientationpro/workflows/*.json /opt/n8n/workflows/

# Démarrer N8N
echo "🚀 Démarrage de N8N avec configuration corrigée..."
docker-compose -f /opt/n8n/docker-compose.yml up -d

# Attendre que N8N soit prêt
echo "⏳ Attente du démarrage de N8N..."
sleep 45

# Vérifier que N8N fonctionne
echo "🔍 Vérification de N8N..."
if curl -s http://localhost:5678 > /dev/null; then
    echo "✅ N8N est maintenant accessible sur http://localhost:5678"
    echo "👤 Identifiants: admin / orientationpro2024"
    echo ""
    echo "🎉 Configuration N8N corrigée !"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Accédez à http://localhost:5678"
    echo "2. Connectez-vous avec admin/orientationpro2024"
    echo "3. Importez les workflows depuis /opt/n8n/workflows/"
    echo "4. Activez chaque workflow"
else
    echo "❌ N8N n'est toujours pas accessible"
    echo "Vérifiez les logs: docker-compose -f /opt/n8n/docker-compose.yml logs n8n"
fi 