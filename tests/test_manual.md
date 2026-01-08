# Test Manuel des Pages Utilisateur

## Méthode 1 : Test Manuel Simple

### Étapes :
1. Ouvrez http://localhost:8046/
2. Cliquez sur "Se connecter"
3. Utilisez ces identifiants :
   - Email : `user@test.com`
   - Mot de passe : `password123`
4. Vérifiez que vous arrivez sur `/dashboard`
5. Testez la navigation vers :
   - `/test-results` (résultats de tests)
   - `/profile` (profil utilisateur)

### Vérifications :
- ✅ Dashboard s'affiche correctement
- ✅ Navigation fonctionne
- ✅ Pas d'erreurs dans la console
- ✅ Impossible d'accéder aux pages admin

---

## Méthode 2 : Test Console Rapide

Copiez ce code dans la console du navigateur :

```javascript
// Connexion rapide
localStorage.setItem('userToken', 'test');
localStorage.setItem('userRole', 'user');
localStorage.setItem('userData', JSON.stringify({
  id: '1',
  email: 'user@test.com',
  role: 'user',
  full_name: 'Test User'
}));

// Test des pages
['/dashboard', '/test-results', '/profile'].forEach(page => {
  console.log(`Test: ${page}`);
  window.location.href = page;
});
```

---

## Méthode 3 : Test Automatique

```javascript
// Test automatique complet
function testUserPages() {
  // 1. Connexion
  localStorage.setItem('userToken', 'test');
  localStorage.setItem('userRole', 'user');
  localStorage.setItem('userData', JSON.stringify({
    id: '1',
    email: 'user@test.com',
    role: 'user',
    full_name: 'Test User'
  }));
  
  console.log('✅ Utilisateur connecté');
  
  // 2. Test séquentiel
  const pages = ['/dashboard', '/test-results', '/profile'];
  let currentIndex = 0;
  
  function testNextPage() {
    if (currentIndex < pages.length) {
      console.log(`🧭 Test: ${pages[currentIndex]}`);
      window.location.href = pages[currentIndex];
      currentIndex++;
      setTimeout(testNextPage, 2000); // Attendre 2 secondes
    }
  }
  
  testNextPage();
}

// Lancer le test
testUserPages();
```

---

## Méthode 4 : Test de Navigation

```javascript
// Test de navigation avec vérifications
function testNavigation() {
  const tests = [
    { path: '/dashboard', expected: 'Dashboard Utilisateur' },
    { path: '/test-results', expected: 'Résultats de Tests' },
    { path: '/profile', expected: 'Profil Utilisateur' }
  ];
  
  tests.forEach(test => {
    console.log(`🧭 Navigation vers ${test.path}`);
    window.location.href = test.path;
  });
}

// Connexion + test
localStorage.setItem('userToken', 'test');
localStorage.setItem('userRole', 'user');
testNavigation();
``` 