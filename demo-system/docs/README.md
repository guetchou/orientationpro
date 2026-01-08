# 🚀 Système DEMO Intégré - Orientation Pro Congo

## Vue d'ensemble

Le système DEMO permet de créer un environnement de démonstration isolé qui clone la production sans affecter les données réelles. Il offre une expérience complète de démonstration avec des données réalistes et une interface adaptée.

## 🏗️ Architecture

### Base de données
- **Schéma DEMO**: `demo` - Complètement isolé de la production
- **Synchronisation**: Structure clonée automatiquement depuis la production
- **Données**: Générées automatiquement avec des données réalistes
- **Sécurité**: Row Level Security (RLS) activé

### Backend
- **Middleware**: Détection automatique du mode DEMO via headers/JWT/cookies
- **Mock des écritures**: Simulation des opérations de modification
- **Audit**: Journalisation complète des activités DEMO
- **Isolation**: Aucune écriture possible en production

### Frontend
- **Overlay**: Indicateurs visuels du mode DEMO
- **Badges**: Marquage des éléments en mode DEMO
- **Comportement adaptatif**: Interface adaptée au mode DEMO
- **Alertes**: Notifications de sécurité

## 🚀 Utilisation Rapide

### Activation du mode DEMO
```bash
# Via script automatique
./demo-system/scripts/activate-demo.sh

# Via variables d'environnement
export DEMO_MODE=true
npm run dev
```

### Désactivation du mode DEMO
```bash
# Via script automatique
./demo-system/scripts/deactivate-demo.sh

# Via variables d'environnement
unset DEMO_MODE
npm run dev
```

### Reset du schéma DEMO
```bash
./demo-system/scripts/reset-demo.sh
```

## 🔧 Configuration

### Variables d'environnement
```bash
# Activation du mode DEMO
DEMO_MODE=true
DEMO_SCHEMA=demo
DEMO_PREFIX=demo_

# Configuration backend
BACKEND_DEMO_MIDDLEWARE=true
BACKEND_MOCK_WRITES=true
BACKEND_LOGGING=true

# Configuration frontend
FRONTEND_DEMO_OVERLAY=true
FRONTEND_VISUAL_INDICATORS=true

# Configuration sécurité
SECURITY_STRICT_ISOLATION=true
SECURITY_NO_PROD_WRITES=true
```

### Fichier de configuration
```javascript
// demo-system/config.js
module.exports = {
  demo: {
    schema: 'demo',
    prefix: 'demo_',
    enabled: process.env.DEMO_MODE === 'true',
    audit: true,
    isolation: true
  },
  // ... autres configurations
};
```

## 🛡️ Sécurité

### Isolation stricte
- **Aucune écriture en production**: Toutes les modifications sont simulées
- **RLS activé**: Row Level Security sur le schéma DEMO
- **Audit complet**: Toutes les activités sont journalisées
- **Validation**: Vérification des permissions avant toute opération

### Contrôles de sécurité
```javascript
// Exemple de middleware de sécurité
if (req.isDemoMode && config.security.strict_isolation) {
  // Vérifier qu'aucune écriture n'est faite en production
  if (req.method !== 'GET' && req.demoSchema === 'public') {
    throw new Error('Écriture en production interdite en mode DEMO');
  }
}
```

## 📊 Monitoring

### Métriques DEMO
- **Utilisateurs actifs**: Nombre d'utilisateurs en mode DEMO
- **Tests effectués**: Statistiques des tests de démonstration
- **Activité**: Logs détaillés des actions
- **Performance**: Suivi des performances en mode DEMO

### Dashboard d'administration
```javascript
// Interface d'administration DEMO
const DemoDashboard = () => {
  return (
    <div className="demo-dashboard">
      <h2>Dashboard DEMO</h2>
      <div className="metrics">
        <MetricCard title="Utilisateurs" value={demoData.userCount} />
        <MetricCard title="Tests" value={demoData.testCount} />
        <MetricCard title="Sessions" value={demoData.sessionCount} />
      </div>
    </div>
  );
};
```

## 🎯 Fonctionnalités

### Scénarios guidés prédéfinis
1. **Découverte de l'orientation**: Parcours complet pour nouveaux utilisateurs
2. **Tests d'évaluation**: Simulation de tous les types de tests
3. **Conseil en carrière**: Démonstration des services de conseil
4. **Recrutement**: Simulation du processus de recrutement

### Données de démonstration
- **Utilisateurs**: 3 comptes de démonstration (user, admin, conseiller)
- **Tests**: 5 tests par type avec résultats réalistes
- **Blog**: Articles de démonstration
- **Conseillers**: Profils de démonstration

## 🔄 Gestion des données

### Sauvegarde
```bash
# Sauvegarder le schéma DEMO
./demo-system/scripts/backup-demo.sh
```

### Restauration
```bash
# Restaurer depuis une sauvegarde
./demo-system/scripts/restore-demo.sh demo_backup_20240101_120000.sql
```

### Reset complet
```bash
# Reset du schéma DEMO avec nouvelles données
./demo-system/scripts/reset-demo.sh
```

## 🧪 Tests

### Tests automatisés
```bash
# Test du mode DEMO
npm run test:demo

# Test de l'isolation
npm run test:isolation

# Test des performances
npm run test:performance
```

### Tests manuels
1. **Activation/Désactivation**: Vérifier le basculement
2. **Données**: Vérifier l'isolation des données
3. **Interface**: Tester les indicateurs visuels
4. **Sécurité**: Vérifier l'absence d'écritures en production

## 📝 Développement

### Ajout de nouvelles fonctionnalités DEMO

#### Backend
```javascript
// demo-system/backend/services/newDemoService.js
class NewDemoService {
  async demoOperation() {
    if (this.isDemoMode) {
      // Logique spécifique au mode DEMO
      console.log('🔵 [DEMO] Operation simulée');
      return { success: true, demo: true };
    }
    // Logique normale
  }
}
```

#### Frontend
```javascript
// demo-system/frontend/components/DemoComponent.tsx
const DemoComponent = () => {
  const { isDemoMode, getDemoIndicator } = useDemoMode();
  
  return (
    <div>
      {getDemoIndicator()}
      {/* Contenu normal */}
    </div>
  );
};
```

#### Base de données
```sql
-- demo-system/database/migrations/demo_new_table.sql
CREATE TABLE IF NOT EXISTS demo.new_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Structure des dossiers
```
demo-system/
├── backend/
│   ├── middleware/
│   ├── services/
│   └── controllers/
├── frontend/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── backups/
├── scripts/
│   ├── deployment/
│   ├── maintenance/
│   └── monitoring/
└── docs/
    ├── README.md
    ├── ADMIN.md
    └── USER.md
```

## 🚨 Dépannage

### Problèmes courants

#### Mode DEMO ne s'active pas
```bash
# Vérifier les variables d'environnement
echo $DEMO_MODE

# Vérifier le fichier de configuration
cat .env.demo

# Redémarrer l'application
npm run dev
```

#### Erreurs de base de données
```bash
# Vérifier la connexion
psql -h localhost -U postgres -d orientationpro

# Reset du schéma DEMO
./demo-system/scripts/reset-demo.sh
```

#### Interface ne s'affiche pas
```bash
# Vérifier les composants frontend
npm run build

# Vérifier les imports
grep -r "DemoProvider" src/
```

## 📞 Support

### Contact
- **Email**: support@orientationpro.cg
- **Téléphone**: +242 06 123 456
- **Documentation**: `/opt/orientationpro/demo-system/docs/`

### Logs
```bash
# Logs du mode DEMO
tail -f logs/demo.log

# Logs d'audit
tail -f logs/audit.log
```

## 📈 Roadmap

### Fonctionnalités futures
- [ ] Scénarios guidés avancés
- [ ] Analytics détaillées
- [ ] Intégration avec des outils externes
- [ ] API REST pour la gestion DEMO
- [ ] Interface d'administration web
- [ ] Notifications en temps réel

### Améliorations
- [ ] Performance optimisée
- [ ] Interface utilisateur améliorée
- [ ] Documentation interactive
- [ ] Tests automatisés complets
