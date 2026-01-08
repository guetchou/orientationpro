# 👨‍💼 Guide Administrateur - Système DEMO

## Vue d'ensemble

Ce guide s'adresse aux administrateurs système et développeurs responsables de la gestion du système DEMO.

## 🔧 Installation et Configuration

### Prérequis
- Node.js 18+
- PostgreSQL 13+
- Accès administrateur à la base de données

### Installation
```bash
# Cloner le projet
git clone <repository>
cd orientationpro

# Installer les dépendances
npm install

# Configurer la base de données
./demo-system/scripts/activate-demo.sh
```

### Configuration de la base de données
```sql
-- Créer le schéma DEMO
CREATE SCHEMA IF NOT EXISTS demo;

-- Activer RLS
ALTER TABLE demo.users ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité
CREATE POLICY demo_users_policy ON demo.users
    FOR ALL USING (true);
```

## 🛠️ Maintenance

### Tâches quotidiennes
```bash
# Vérifier l'état du système DEMO
./demo-system/scripts/check-demo-status.sh

# Sauvegarder les données DEMO
./demo-system/scripts/backup-demo.sh

# Nettoyer les logs
./demo-system/scripts/cleanup-logs.sh
```

### Tâches hebdomadaires
```bash
# Reset complet avec nouvelles données
./demo-system/scripts/reset-demo.sh

# Vérifier les performances
./demo-system/scripts/performance-check.sh

# Mettre à jour la documentation
./demo-system/scripts/update-docs.sh
```

### Tâches mensuelles
```bash
# Audit de sécurité complet
./demo-system/scripts/security-audit.sh

# Optimisation de la base de données
./demo-system/scripts/optimize-db.sh

# Mise à jour du système
./demo-system/scripts/update-system.sh
```

## 📊 Monitoring

### Métriques à surveiller
- **Utilisateurs actifs**: Nombre d'utilisateurs en mode DEMO
- **Tests effectués**: Statistiques des tests
- **Performance**: Temps de réponse des requêtes
- **Erreurs**: Taux d'erreur en mode DEMO
- **Sécurité**: Tentatives d'accès non autorisées

### Alertes
```javascript
// Configuration des alertes
const demoAlerts = {
  highUsage: {
    threshold: 100,
    message: 'Utilisation élevée du mode DEMO'
  },
  securityBreach: {
    threshold: 1,
    message: 'Tentative d\'écriture en production'
  },
  performance: {
    threshold: 2000,
    message: 'Performance dégradée en mode DEMO'
  }
};
```

### Logs
```bash
# Logs du système DEMO
tail -f /var/log/demo-system.log

# Logs d'audit
tail -f /var/log/demo-audit.log

# Logs d'erreurs
tail -f /var/log/demo-errors.log
```

## 🔒 Sécurité

### Politiques de sécurité
```sql
-- Politique pour les utilisateurs DEMO
CREATE POLICY demo_users_isolation ON demo.users
    FOR ALL USING (schema_name() = 'demo');

-- Politique pour les tests DEMO
CREATE POLICY demo_tests_isolation ON demo.test_results
    FOR ALL USING (schema_name() = 'demo');
```

### Audit de sécurité
```bash
# Vérifier les accès non autorisés
grep "SECURITY_BREACH" /var/log/demo-audit.log

# Vérifier les tentatives d'écriture en production
grep "PROD_WRITE_ATTEMPT" /var/log/demo-audit.log

# Générer un rapport de sécurité
./demo-system/scripts/security-report.sh
```

### Contrôles d'accès
```javascript
// Middleware de contrôle d'accès
const accessControl = (req, res, next) => {
  if (req.isDemoMode) {
    // Vérifier les permissions DEMO
    if (!hasDemoPermission(req.user)) {
      return res.status(403).json({
        error: 'Accès DEMO non autorisé'
      });
    }
  }
  next();
};
```

## 🚨 Dépannage

### Problèmes de performance
```bash
# Analyser les requêtes lentes
./demo-system/scripts/analyze-slow-queries.sh

# Optimiser la base de données
./demo-system/scripts/optimize-db.sh

# Vérifier l'utilisation des ressources
./demo-system/scripts/resource-usage.sh
```

### Problèmes de sécurité
```bash
# Vérifier les logs de sécurité
./demo-system/scripts/security-check.sh

# Analyser les tentatives d'intrusion
./demo-system/scripts/intrusion-analysis.sh

# Mettre à jour les politiques de sécurité
./demo-system/scripts/update-security-policies.sh
```

### Problèmes de données
```bash
# Vérifier l'intégrité des données
./demo-system/scripts/check-data-integrity.sh

# Réparer les données corrompues
./demo-system/scripts/repair-data.sh

# Restaurer depuis une sauvegarde
./demo-system/scripts/restore-demo.sh backup_file.sql
```

## 📈 Optimisation

### Performance
```javascript
// Optimisation des requêtes DEMO
const optimizedQuery = `
  SELECT * FROM demo.users 
  WHERE created_at > NOW() - INTERVAL '7 days'
  AND active = true
  LIMIT 100
`;
```

### Base de données
```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_demo_users_active ON demo.users(active);
CREATE INDEX idx_demo_tests_type ON demo.test_results(test_type);
CREATE INDEX idx_demo_audit_timestamp ON demo.audit_log(timestamp);
```

### Cache
```javascript
// Configuration du cache DEMO
const demoCache = {
  ttl: 300, // 5 minutes
  maxSize: 1000,
  prefix: 'demo_'
};
```

## 🔄 Mise à jour

### Procédure de mise à jour
```bash
# 1. Sauvegarder les données actuelles
./demo-system/scripts/backup-demo.sh

# 2. Arrêter l'application
pm2 stop orientationpro

# 3. Mettre à jour le code
git pull origin main

# 4. Installer les nouvelles dépendances
npm install

# 5. Appliquer les migrations
./demo-system/scripts/apply-migrations.sh

# 6. Redémarrer l'application
pm2 start orientationpro

# 7. Vérifier le bon fonctionnement
./demo-system/scripts/health-check.sh
```

### Rollback
```bash
# En cas de problème, revenir à la version précédente
git checkout HEAD~1
./demo-system/scripts/restore-demo.sh backup_file.sql
pm2 restart orientationpro
```

## 📞 Support

### Contact d'urgence
- **Email**: admin@orientationpro.cg
- **Téléphone**: +242 06 123 456
- **Slack**: #demo-system-support

### Escalade
1. **Niveau 1**: Administrateur système
2. **Niveau 2**: Développeur senior
3. **Niveau 3**: Architecte système
