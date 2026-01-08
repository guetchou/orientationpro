// Script de debug pour vérifier l'authentification
console.log('🔍 Debug de l\'authentification...\n');

// Vérifier tous les tokens et données dans localStorage
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

console.log('\n🔐 Test de connexion avec les comptes de test...');

// Simuler la connexion avec un compte de test
const testAccount = {
  email: 'admin@test.com',
  password: 'password123',
  role: 'admin'
};

console.log(`\n📝 Test de connexion: ${testAccount.email}`);

// Simuler la création des données utilisateur
const userData = {
  id: `test-${Date.now()}`,
  email: testAccount.email,
  role: testAccount.role,
  full_name: testAccount.email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
  is_super_admin: testAccount.role === 'super_admin'
};

console.log('📊 Données utilisateur créées:');
console.log(userData);

// Simuler le stockage
localStorage.setItem('userToken', 'test-token-' + Date.now());
localStorage.setItem('userData', JSON.stringify(userData));
localStorage.setItem('userRole', userData.role);

console.log('\n💾 Données stockées dans localStorage');

// Vérifier les données stockées
const storedUserData = localStorage.getItem('userData');
if (storedUserData) {
  try {
    const parsed = JSON.parse(storedUserData);
    console.log('✅ Données parsées avec succès:', parsed);
    
    // Test des routes de protection
    console.log('\n🔒 Test des routes de protection:');
    
    const routes = [
      { path: '/admin/dashboard', requires: ['admin', 'super_admin'] },
      { path: '/admin/super-admin', requires: ['admin', 'super_admin'] },
      { path: '/conseiller/dashboard', requires: ['conseiller', 'admin', 'super_admin'] },
      { path: '/dashboard', requires: ['user', 'admin', 'super_admin', 'conseiller'] }
    ];
    
    routes.forEach(route => {
      const canAccess = route.requires.includes(parsed.role);
      console.log(`  ${canAccess ? '✅' : '❌'} ${route.path} (rôle requis: ${route.requires.join(', ')}) - Accès: ${canAccess ? 'AUTORISÉ' : 'REFUSÉ'}`);
    });
    
  } catch (e) {
    console.log('❌ Erreur parsing des données stockées:', e.message);
  }
} else {
  console.log('❌ Aucune donnée utilisateur trouvée');
}

console.log('\n🎉 Debug terminé !');
console.log('\n📝 Pour tester manuellement:');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Collez ce script et exécutez-le');
console.log('3. Vérifiez les logs pour identifier le problème'); 