# 🚀 Guide de Démarrage - Orientation Pro Congo

## 📋 **Commandes de base**

### 1. **Démarrage manuel**
```bash
# Aller dans le répertoire de l'application
cd /opt/orientationpro

# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

### 2. **Arrêt de l'application**
```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (attention !)
docker-compose down -v
```

### 3. **Redémarrage**
```bash
# Redémarrer tous les services
docker-compose restart

# Ou arrêter puis redémarrer
docker-compose down && docker-compose up -d
```

## 🔧 **Script de démarrage automatique**

### Utilisation du script `start-app.sh`
```bash
# Afficher l'aide
./start-app.sh help

# Démarrer l'application
./start-app.sh start

# Arrêter l'application
./start-app.sh stop

# Redémarrer l'application
./start-app.sh restart

# Vérifier le statut
./start-app.sh status
```

## 🌐 **URLs de l'application**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:7474 | Application React |
| **Backend API** | http://localhost:6464/api | API Node.js |
| **phpMyAdmin** | http://localhost:8282 | Gestion base de données |
| **Base de données** | localhost:3310 | MySQL |

## 🔄 **Démarrage automatique au boot**

### 1. **Service systemd configuré**
Le service `orientationpro.service` a été créé et activé pour démarrer automatiquement au boot.

### 2. **Commandes de gestion du service**
```bash
# Activer le démarrage automatique
sudo systemctl enable orientationpro.service

# Désactiver le démarrage automatique
sudo systemctl disable orientationpro.service

# Démarrer le service manuellement
sudo systemctl start orientationpro.service

# Arrêter le service
sudo systemctl stop orientationpro.service

# Vérifier le statut
sudo systemctl status orientationpro.service

# Voir les logs
sudo journalctl -u orientationpro.service -f
```

## 📊 **Monitoring et logs**

### 1. **Voir les logs en temps réel**
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### 2. **Tests de connectivité**
```bash
# Test du frontend
curl -s http://localhost:7474 | head -5

# Test du backend
curl -s http://localhost:6464/api/test/health

# Test de phpMyAdmin
curl -s http://localhost:8282 | head -5
```

## 🛠️ **Dépannage**

### 1. **Problèmes courants**

#### Service ne démarre pas
```bash
# Vérifier les logs
docker-compose logs api

# Redémarrer le service
docker-compose restart api

# Reconstruire l'image
docker-compose build api
```

#### Ports déjà utilisés
```bash
# Vérifier les ports utilisés
netstat -tlnp | grep :7474
netstat -tlnp | grep :6464

# Arrêter les processus qui utilisent les ports
sudo fuser -k 7474/tcp
sudo fuser -k 6464/tcp
```

### 2. **Nettoyage complet**
```bash
# Arrêter et supprimer tout
docker-compose down -v --remove-orphans

# Supprimer les images
docker system prune -a

# Redémarrer proprement
docker-compose up -d --build
```

## 📁 **Structure des fichiers**

```
/opt/orientationpro/
├── docker-compose.yml          # Configuration Docker
├── start-app.sh               # Script de démarrage
├── orientationpro.service      # Service systemd
├── .env                       # Variables d'environnement
├── backend/                   # Code backend
├── src/                       # Code frontend
└── GUIDE_DEMARRAGE.md        # Ce guide
```

## ✅ **Vérification du bon fonctionnement**

### 1. **Tests automatiques**
```bash
# Exécuter le script de test
./start-app.sh status
```

### 2. **Tests manuels**
- Ouvrir http://localhost:7474 dans le navigateur
- Vérifier que l'API répond : http://localhost:6464/api/test/health
- Tester phpMyAdmin : http://localhost:8282

## 🔐 **Sécurité**

### 1. **Firewall (optionnel)**
```bash
# Ouvrir les ports nécessaires
sudo ufw allow 7474
sudo ufw allow 6464
sudo ufw allow 8282
```

### 2. **Variables d'environnement**
Vérifier que le fichier `.env` contient les bonnes valeurs :
```env
VITE_API_URL=http://localhost:6464/api
VITE_SUPABASE_URL=http://localhost:55508
```

## 📞 **Support**

En cas de problème :
1. Vérifier les logs : `docker-compose logs`
2. Tester la connectivité : `./start-app.sh status`
3. Redémarrer : `./start-app.sh restart`

---

**🎉 L'application est maintenant configurée pour démarrer automatiquement au boot du serveur !** 