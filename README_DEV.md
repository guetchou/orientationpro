# 🚀 Guide de Développement Local - Orientation Pro Congo

## 📋 **Résumé Rapide**

### 🎯 **Commandes principales**
```bash
# Démarrer tout en mode développement
./dev-start.sh full

# Démarrer seulement backend + DB
./dev-start.sh backend

# Démarrer seulement frontend
./dev-start.sh frontend

# Arrêter tous les services
./dev-start.sh stop
```

### 🌐 **URLs de développement**
- **Frontend** : http://localhost:5111
- **Backend** : http://localhost:6464/api
- **Base de données** : localhost:3310

## 🔄 **Workflow de Développement**

### **Option 1 : Développement complet local (Recommandé)**
```bash
# 1. Arrêter les services Docker
docker-compose down

# 2. Démarrer en mode développement
./dev-start.sh full

# 3. Développer avec hot reload
# Les changements sont automatiquement rechargés
```

### **Option 2 : Mix Docker + Local**
```bash
# 1. Démarrer DB + Backend avec Docker
docker-compose up -d db api

# 2. Démarrer frontend en local
npm run dev
```

### **Option 3 : Tout en Docker (Production)**
```bash
# Démarrer tous les services en production
docker-compose up -d --build
```

## 🛠️ **Configuration pour le Développement**

### **Variables d'environnement (.env)**
```env
# Frontend Configuration
VITE_API_URL=http://localhost:6464/api
VITE_SUPABASE_URL=http://localhost:55508
VITE_BACKEND_URL=http://localhost:6464

# Backend Configuration
NODE_ENV=development
PORT=6464
```

### **Scripts npm disponibles**

#### **Frontend**
```bash
npm run dev      # Démarrage serveur de développement
npm run build    # Build pour production
npm run preview  # Prévisualiser le build
```

#### **Backend**
```bash
npm run dev      # Démarrage avec nodemon (hot reload)
npm start        # Démarrage en production
```

## 🚀 **Avantages du Mode Développement**

### ✅ **Hot Reload**
- Les changements dans le code sont automatiquement rechargés
- Pas besoin de redémarrer les serveurs
- Feedback immédiat

### ✅ **Debug facilité**
- Console de développement du navigateur
- Logs détaillés dans les terminaux
- Source maps pour le debugging
- Breakpoints dans le code

### ✅ **Performance**
- Build plus rapide
- Pas de conteneurisation overhead
- Développement plus fluide

### ✅ **Flexibilité**
- Modification facile des configurations
- Installation rapide de nouvelles dépendances
- Tests rapides

## 📊 **Monitoring et Debug**

### **Logs en temps réel**
```bash
# Backend logs (dans le terminal où npm run dev est lancé)
cd backend && npm run dev

# Frontend logs (dans le terminal où npm run dev est lancé)
npm run dev

# Logs de la base de données
docker-compose logs -f db
```

### **Tests de connectivité**
```bash
# Test du frontend
curl http://localhost:5111

# Test du backend
curl http://localhost:6464/api/test/health

# Test de la base de données
docker-compose exec db mysql -u root -ppassword -e "SELECT 1;"
```

## 🛠️ **Dépannage**

### **Problèmes courants**

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
# Réinstaller les dépendances frontend
rm -rf node_modules package-lock.json
npm install

# Réinstaller les dépendances backend
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

### **Redémarrage propre**
```bash
# Arrêter tous les services
./dev-start.sh stop

# Redémarrer
./dev-start.sh full
```

## 🔄 **Migration vers Production**

### **Build pour production**
```bash
# Build du frontend
npm run build

# Build des images Docker
docker-compose build

# Démarrer en mode production
docker-compose up -d
```

### **Vérification**
```bash
# Tester les URLs de production
curl http://localhost:7474
curl http://localhost:6464/api/test/health
```

## 📝 **Bonnes Pratiques**

### **Workflow recommandé**
1. Développer en mode local avec `npm run dev`
2. Tester les fonctionnalités
3. Build et tester en mode production
4. Déployer

### **Gestion des branches**
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

### **Debugging**
- Utiliser les DevTools du navigateur
- Vérifier les logs dans les terminaux
- Utiliser `console.log()` pour le debug
- Utiliser les breakpoints dans le code

## 🎯 **Comparaison des Modes**

| Aspect | Développement Local | Docker Production |
|--------|-------------------|-------------------|
| **Hot Reload** | ✅ | ❌ |
| **Debug** | ✅ Facile | ❌ Difficile |
| **Performance** | ✅ Rapide | ⚠️ Plus lent |
| **Portabilité** | ❌ | ✅ |
| **Déploiement** | ❌ | ✅ |
| **Ressources** | ✅ Faibles | ⚠️ Plus élevées |

## 📞 **Support**

En cas de problème :
1. Vérifier les logs : `./dev-start.sh status`
2. Redémarrer : `./dev-start.sh stop && ./dev-start.sh full`
3. Vérifier les ports : `netstat -tlnp | grep -E "(5111|6464)"`

---

**🎉 Le mode développement local est parfait pour le développement et les tests !** 