# 🚀 Guide d'Import des Workflows N8N

## ✅ **N8N est installé et accessible !**

**URL** : http://localhost:5678  
**Identifiants** : admin / orientationpro2024

## 📋 **Étapes pour Importer les Workflows**

### **Étape 1 : Accédez à N8N**
1. Ouvrez votre navigateur
2. Allez sur : http://localhost:5678
3. Connectez-vous avec : admin / orientationpro2024

### **Étape 2 : Importez les Workflows**
1. Cliquez sur **"Workflows"** dans le menu
2. Cliquez sur **"Import from file"** (ou l'icône d'import)
3. Sélectionnez les fichiers depuis `/opt/orientationpro/workflows/` :

#### **Fichiers à importer :**
- `test-completion-workflow.json` - Traitement automatique des tests
- `user-registration-workflow.json` - Inscription automatisée
- `cv-analysis-workflow.json` - Analyse automatique des CV
- `email-notifications-workflow.json` - Gestion des emails
- `appointment-reminder-workflow.json` - Rappels automatiques

### **Étape 3 : Activez les Workflows**
Pour chaque workflow importé :
1. **Ouvrez le workflow** en cliquant dessus
2. **Cliquez sur le toggle "Active"** (en haut à droite)
3. **Le toggle devient vert** quand le workflow est actif
4. **Sauvegardez** les changements

## 🧪 **Test des Workflows**

Une fois activés, testez avec cette commande :

```bash
chmod +x test-n8n-final.sh && ./test-n8n-final.sh
```

## 📊 **Workflows Disponibles**

### **1. Test Completion Workflow**
- **Fonction** : Traitement automatique des résultats de tests
- **Tests supportés** : RIASEC, émotionnel, reconversion, etc.
- **Webhook** : `http://localhost:5678/webhook/test-completion`

### **2. User Registration Workflow**
- **Fonction** : Automatisation de l'inscription des utilisateurs
- **Actions** : Création de compte, profil, email de bienvenue
- **Webhook** : `http://localhost:5678/webhook/user-registration`

### **3. CV Analysis Workflow**
- **Fonction** : Analyse automatique des CV
- **Actions** : Extraction de contenu, matching emploi, recommandations
- **Webhook** : `http://localhost:5678/webhook/cv-upload`

### **4. Email Notifications Workflow**
- **Fonction** : Gestion centralisée des emails
- **Types** : Bienvenue, résultats de tests, rappels
- **Webhook** : `http://localhost:5678/webhook/send-email`

### **5. Appointment Reminder Workflow**
- **Fonction** : Rappels automatiques de rendez-vous
- **Déclencheur** : Cron (toutes les heures)

## 🎯 **Missions Automatisées**

Une fois activés, N8N automatiserá :

### **Pour les Utilisateurs**
- ⚡ **Traitement instantané** des tests d'orientation
- 📧 **Notifications automatiques** par email
- 🔔 **Rappels de rendez-vous** automatiques
- 📊 **Analyses personnalisées** des CV

### **Pour les Administrateurs**
- 🤖 **Automatisation complète** des processus
- 📈 **Monitoring en temps réel** des workflows
- 🔧 **Maintenance simplifiée** via interface web
- 📊 **Métriques détaillées** de performance

### **Pour les Conseillers**
- 📋 **Gestion automatisée** des rendez-vous
- 📧 **Communication automatique** avec les clients
- 📊 **Analyses automatiques** des profils
- 🔔 **Alertes en temps réel** pour les urgences

## 📚 **Documentation Complète**

- **Guide d'intégration** : `/opt/orientationpro/docs/N8N_INTEGRATION.md`
- **Résumé détaillé** : `N8N_INTEGRATION_SUMMARY.md`
- **Scripts de test** : `test-n8n-final.sh`

## 🚀 **Prochaines Étapes**

1. **Importez les workflows** via l'interface web
2. **Activez chaque workflow** en cliquant sur le toggle
3. **Testez les webhooks** avec le script de test
4. **Configurez les credentials** pour les services externes
5. **Monitorer les performances** via l'interface N8N

---

**N8N est maintenant prêt à automatiser complètement Orientation Pro Congo !** 🎉 