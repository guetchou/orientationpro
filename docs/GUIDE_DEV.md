# 🚀 Guide de Développement Local - Orientation Pro Congo

## 📋 **Mode Développement vs Production**

### 🔧 **Mode Développement (npm run dev)**
- **Frontend** : http://localhost:5111 (Vite dev server)
- **Backend** : http://localhost:6464 (Nodemon)
- **Hot Reload** : ✅ Activé
- **Debug** : ✅ Facilité

### 🐳 **Mode Production (Docker)**
- **Frontend** : http://localhost:7474 (Nginx)
- **Backend** : http://localhost:6464 (PM2)
- **Hot Reload** : ❌ Désactivé
- **Debug** : ❌ Difficile

## 🛠️ **Démarrage en Mode Développement**

### 1. **Script de démarrage rapide**
```bash
# Démarrer tous les services (frontend + backend + DB)
./dev-start.sh full

# Démarrer seulement le backend + DB
./dev-start.sh backend

# Démarrer seulement le frontend (nécessite backend)
./dev-start.sh frontend

# Arrêter tous les services
./dev-start.sh stop

# Voir l'aide
./dev-start.sh help
```

### 2. **Démarrage manuel étape par étape**

#### **Étape 1 : Base de données**
```bash
cd /opt/orientationpro
docker-compose up -d db
```

#### **Étape 2 : Backend**
```bash
cd /opt/orientationpro/backend
npm install
npm run dev
```

#### **Étape 3 : Frontend**
```bash
cd /opt/orientationpro
npm install
npm run dev
```

## 🔄 **Workflow de Développement Recommandé**

### **Option 1 : Développement complet local**
```bash
# 1. Démarrer la base de données
docker-compose up -d db

# 2. Démarrer le backend en mode dev
cd backend && npm run dev

# 3. Dans un autre terminal, démarrer le frontend
npm run dev
```

### **Option 2 : Mix Docker + Local**
```bash
# 1. Démarrer backend + DB avec Docker
docker-compose up -d db api

# 2. Démarrer seulement le frontend en local
npm run dev
```

### **Option 3 : Tout en local**
```bash
# Utiliser le script automatique
./dev-start.sh full
```

## 🌐 **URLs de Développement**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Dev** | http://localhost:5111 | Vite dev server |
| **Backend Dev** | http://localhost:6464/api | Nodemon |
| **Base de données** | localhost:3310 | MySQL |
| **phpMyAdmin** | http://localhost:8282 | Gestion DB |

## 🔧 **Configuration pour le Développement**

### 1. **Variables d'environnement (.env)**
```env
# Frontend Configuration
VITE_API_URL=http://localhost:6464/api
VITE_SUPABASE_URL=http://localhost:55508
VITE_BACKEND_URL=http://localhost:6464

# Backend Configuration
NODE_ENV=development
PORT=6464
```

### 2. **Scripts npm disponibles**

#### **Frontend (package.json)**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### **Backend (backend/package.json)**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

## 🚀 **Avantages du Mode Développement**

### ✅ **Hot Reload**
- Les changements dans le code sont automatiquement rechargés
- Pas besoin de redémarrer les serveurs

### ✅ **Debug facilité**
- Console de développement du navigateur
- Logs détaillés dans les terminaux
- Source maps pour le debugging

### ✅ **Performance**
- Build plus rapide
- Pas de conteneurisation overhead

### ✅ **Flexibilité**
- Modification facile des configurations
- Installation rapide de nouvelles dépendances

## 📊 **Monitoring en Développement**

### 1. **Logs en temps réel**
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs (dans le terminal où npm run dev est lancé)
# Les logs apparaissent automatiquement
```

### 2. **Tests de connectivité**
```bash
# Test du frontend
curl http://localhost:5111

# Test du backend
curl http://localhost:6464/api/test/health

# Test de la base de données
docker-compose exec db mysql -u root -ppassword -e "SELECT 1;"
```

## 🛠️ **Dépannage en Mode Dev**

### 1. **Problèmes courants**

#### **Ports déjà utilisés**
```bash
# Vérifier les ports
netstat -tlnp | grep :5111
netstat -tlnp | grep :6464

# Tuer les processus
sudo fuser -k 5111/tcp
sudo fuser -k 6464/tcp
```

#### **Dépendances manquantes**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### **Base de données non accessible**
```bash
# Redémarrer la DB
docker-compose restart db

# Vérifier les logs
docker-compose logs db
```

### 2. **Redémarrage propre**
```bash
# Arrêter tous les services
./dev-start.sh stop

# Redémarrer
./dev-start.sh full
```

## 🔄 **Migration vers Production**

### 1. **Build pour production**
```bash
# Build du frontend
npm run build

# Build des images Docker
docker-compose build

# Démarrer en mode production
docker-compose up -d
```

### 2. **Vérification**
```bash
# Tester les URLs de production
curl http://localhost:7474
curl http://localhost:6464/api/test/health
```

## 📝 **Bonnes Pratiques**

### 1. **Workflow recommandé**
1. Développer en mode local avec `npm run dev`
2. Tester les fonctionnalités
3. Build et tester en mode production
4. Déployer

### 2. **Gestion des branches**
```bash
# Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# Développer en local
./dev-start.sh full

# Tester et commiter
git add .
git commit -m "Ajout nouvelle fonctionnalité"

# Merger en production
git checkout main
git merge feature/nouvelle-fonctionnalite
```

### 3. **Debugging**
- Utiliser les DevTools du navigateur
- Vérifier les logs dans les terminaux
- Utiliser `console.log()` pour le debug
- Utiliser les breakpoints dans le code

---

**🎯 Le mode développement local est parfait pour le développement et les tests !** 