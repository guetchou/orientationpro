# 🔍 Guide de Debug - Problème "Accès non autorisé"

## 🚨 Problème identifié
L'erreur "Accès non autorisé" indique que la protection des routes ne fonctionne pas correctement avec les nouveaux comptes de test.

## ✅ Solutions appliquées

### 1. **Correction de RequireAuth.tsx**
- ✅ Vérification des tokens de test
- ✅ Parsing sécurisé des données JSON
- ✅ Nettoyage automatique des données corrompues
- ✅ Loader amélioré pendant le chargement

### 2. **Correction des routes de protection**
- ✅ AdminRoute avec debug logs
- ✅ ConseillerRoute avec debug logs
- ✅ Vérification des rôles appropriés

### 3. **Script de debug**
- ✅ `test_auth_debug.js` pour diagnostiquer les problèmes

## 🧪 Comment tester

### Étape 1: Nettoyer les données existantes
```javascript
// Dans la console du navigateur (F12)
localStorage.clear();
console.log('Données nettoyées');
```

### Étape 2: Se connecter avec un compte de test
1. Aller sur http://localhost:8046/login
2. Utiliser un compte de test :
   - Email: `admin@test.com`
   - Mot de passe: `password123`

### Étape 3: Vérifier les données dans la console
```javascript
// Copier-coller dans la console
console.log('🔍 Debug de l\'authentification...\n');

const tokens = {
  'userToken': localStorage.getItem('userToken'),
  'adminToken': localStorage.getItem('adminToken'),
  'userData': localStorage.getItem('userData'),
  'adminUser': localStorage.getItem('adminUser'),
  'userRole': localStorage.getItem('userRole')
};

console.log('📋 Tokens et données dans localStorage:');
Object.entries(tokens).forEach(([key, value]) => {
  if (value) {
    console.log(`  ✅ ${key}: ${value.substring(0, 50)}...`);
    if (key === 'userData') {
      try {
        const parsed = JSON.parse(value);
        console.log(`     Parsed:`, parsed);
      } catch (e) {
        console.log(`     ❌ Erreur parsing: ${e.message}`);
      }
    }
  } else {
    console.log(`  ❌ ${key}: null/undefined`);
  }
});
```

### Étape 4: Tester l'accès aux routes
1. Essayer d'accéder à `/admin/dashboard`
2. Vérifier les logs dans la console
3. Si bloqué, utiliser le bouton "Déconnexion (si bloqué)"

## 🔧 Comptes de test disponibles

| Email | Rôle | Route d'accès | Permissions |
|-------|------|---------------|-------------|
| `super_admin@test.com` | Super Admin | `/admin/super-admin` | Toutes les sections |
| `admin@test.com` | Admin | `/admin/dashboard` | Admin + Conseiller |
| `conseiller@test.com` | Conseiller | `/conseiller/dashboard` | Conseiller uniquement |
| `user@test.com` | Utilisateur | `/dashboard` | Dashboard uniquement |

**Mot de passe pour tous :** `password123`

## 🚨 Si le problème persiste

### Solution 1: Déconnexion manuelle
```javascript
// Dans la console
localStorage.clear();
window.location.reload();
```

### Solution 2: Vérifier les logs
1. Ouvrir la console (F12)
2. Aller sur la page de connexion
3. Se connecter avec un compte de test
4. Vérifier les logs "AdminRoute - userInfo:" ou "ConseillerRoute - userInfo:"

### Solution 3: Forcer la connexion
```javascript
// Simuler une connexion admin
const userData = {
  id: 'test-admin',
  email: 'admin@test.com',
  role: 'admin',
  full_name: 'Admin Test',
  is_super_admin: false
};

localStorage.setItem('userToken', 'test-token-' + Date.now());
localStorage.setItem('userData', JSON.stringify(userData));
localStorage.setItem('userRole', 'admin');

window.location.href = '/admin/dashboard';
```

## 📊 Logs de debug attendus

### Connexion réussie
```
✅ userToken: test-token-1234567890...
✅ userData: {"id":"test-1234567890","email":"admin@test.com","role":"admin"...}
✅ userRole: admin
```

### Accès autorisé
```
AdminRoute - userInfo: {id: "test-1234567890", email: "admin@test.com", role: "admin", ...}
```

### Accès refusé
```
AdminRoute - Accès refusé, redirection vers /login
```

## 🎯 Résolution finale

Si le problème persiste après ces étapes :

1. **Vérifier que Supabase est démarré** :
   ```bash
   npx supabase status
   ```

2. **Redémarrer l'application** :
   ```bash
   npm run dev
   ```

3. **Nettoyer le cache du navigateur** et recharger la page

4. **Utiliser le script de debug** `test_auth_debug.js` pour diagnostiquer

---

**Note :** Les logs de debug ont été ajoutés pour identifier précisément où le problème se situe. Vérifiez la console du navigateur pour voir les messages de debug. 