# Instructions de Test - Pages Utilisateur

## Option 1 : Test Manuel (Recommandé)
1. Ouvrez http://localhost:8046/
2. Connectez-vous avec : `user@test.com` / `password123`
3. Vérifiez que vous arrivez sur le dashboard
4. Testez la navigation vers les autres pages

## Option 2 : Test Console (Rapide)
1. Ouvrez http://localhost:8046/
2. Console du navigateur (F12)
3. Copiez-collez le code de `test_user_pages.js`

## Option 3 : Test Automatique
1. Ouvrez http://localhost:8046/
2. Console du navigateur (F12)
3. Copiez-collez le code de `test_automatic.js`
4. Le test navigue automatiquement entre les pages

## Option 4 : Test Ultra-Simple
1. Ouvrez http://localhost:8046/
2. Console du navigateur (F12)
3. Copiez cette ligne :
```javascript
localStorage.setItem('userToken','test');localStorage.setItem('userRole','user');localStorage.setItem('userData',JSON.stringify({id:'1',email:'user@test.com',role:'user',full_name:'Test User'}));['/dashboard','/test-results','/profile'].forEach(p=>{console.log(`Test: ${p}`);window.location.href=p;});
```

## Vérifications à faire :
- ✅ Dashboard s'affiche
- ✅ Navigation fonctionne
- ✅ Pas d'erreurs console
- ✅ Pages admin inaccessibles 