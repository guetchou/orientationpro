// Script de test complet pour l'authentification
console.log('🔍 Test complet de l\'authentification...\n');

// Fonction pour nettoyer les données
function clearAuthData() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('userRole');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('rememberedMode');
  console.log('✅ Données d\'authentification nettoyées');
}

// Fonction pour simuler une connexion
function simulateLogin(email, role) {
  const userData = {
    id: `test-${Date.now()}`,
    email: email,
    role: role,
    full_name: email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    is_super_admin: role === 'super_admin'
  };

  localStorage.setItem('userToken', 'test-token-' + Date.now());
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('userRole', role);

  console.log(`✅ Connexion simulée: ${email} (${role})`);
  console.log('📊 Données utilisateur:', userData);
  
  return userData;
}

// Fonction pour tester les routes
function testRoutes(userRole) {
  const routes = [
    { path: '/dashboard', requires: ['user', 'admin', 'super_admin', 'conseiller'], name: 'Dashboard Utilisateur' },
    { path: '/admin/dashboard', requires: ['admin', 'super_admin'], name: 'Dashboard Admin' },
    { path: '/admin/super-admin', requires: ['super_admin'], name: 'Super Admin' },
    { path: '/conseiller/dashboard', requires: ['conseiller', 'admin', 'super_admin'], name: 'Dashboard Conseiller' }
  ];

  console.log(`\n🔒 Test des routes pour le rôle: ${userRole}`);
  routes.forEach(route => {
    const canAccess = route.requires.includes(userRole);
    console.log(`  ${canAccess ? '✅' : '❌'} ${route.name} (${route.path}) - ${canAccess ? 'AUTORISÉ' : 'REFUSÉ'}`);
  });
}

// Test 1: Nettoyer et vérifier l'état initial
console.log('🧪 Test 1: État initial');
clearAuthData();

const initialTokens = {
  'userToken': localStorage.getItem('userToken'),
  'userData': localStorage.getItem('userData'),
  'userRole': localStorage.getItem('userRole')
};

console.log('📋 État initial:', initialTokens);

// Test 2: Connexion Super Admin
console.log('\n🧪 Test 2: Connexion Super Admin');
const superAdminData = simulateLogin('super_admin@test.com', 'super_admin');
testRoutes('super_admin');

// Test 3: Connexion Admin
console.log('\n🧪 Test 3: Connexion Admin');
clearAuthData();
const adminData = simulateLogin('admin@test.com', 'admin');
testRoutes('admin');

// Test 4: Connexion Conseiller
console.log('\n🧪 Test 4: Connexion Conseiller');
clearAuthData();
const conseillerData = simulateLogin('conseiller@test.com', 'conseiller');
testRoutes('conseiller');

// Test 5: Connexion Utilisateur
console.log('\n🧪 Test 5: Connexion Utilisateur');
clearAuthData();
const userData = simulateLogin('user@test.com', 'user');
testRoutes('user');

// Test 6: Vérification des données dans localStorage
console.log('\n🧪 Test 6: Vérification finale');
const finalTokens = {
  'userToken': localStorage.getItem('userToken'),
  'userData': localStorage.getItem('userData'),
  'userRole': localStorage.getItem('userRole')
};

console.log('📋 Données finales dans localStorage:');
Object.entries(finalTokens).forEach(([key, value]) => {
  if (value) {
    console.log(`  ✅ ${key}: ${value.substring(0, 50)}...`);
    if (key === 'userData') {
      try {
        const parsed = JSON.parse(value);
        console.log(`     Rôle: ${parsed.role}`);
        console.log(`     Email: ${parsed.email}`);
        console.log(`     Super Admin: ${parsed.is_super_admin}`);
      } catch (e) {
        console.log(`     ❌ Erreur parsing: ${e.message}`);
      }
    }
  } else {
    console.log(`  ❌ ${key}: null/undefined`);
  }
});

// Test 7: Simulation de navigation
console.log('\n🧪 Test 7: Simulation de navigation');
const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
const currentRole = currentUserData.role || 'none';

console.log(`👤 Utilisateur actuel: ${currentUserData.email} (${currentRole})`);

const navigationTests = [
  { from: '/login', to: '/dashboard', shouldWork: ['user', 'admin', 'super_admin', 'conseiller'].includes(currentRole) },
  { from: '/login', to: '/admin/dashboard', shouldWork: ['admin', 'super_admin'].includes(currentRole) },
  { from: '/login', to: '/admin/super-admin', shouldWork: ['super_admin'].includes(currentRole) },
  { from: '/login', to: '/conseiller/dashboard', shouldWork: ['conseiller', 'admin', 'super_admin'].includes(currentRole) }
];

navigationTests.forEach(test => {
  const status = test.shouldWork ? '✅' : '❌';
  console.log(`  ${status} ${test.from} → ${test.to} - ${test.shouldWork ? 'AUTORISÉ' : 'REFUSÉ'}`);
});

console.log('\n🎉 Test complet terminé !');
console.log('\n📝 Instructions pour tester manuellement:');
console.log('1. Ouvrez http://localhost:8046/login');
console.log('2. Connectez-vous avec un compte de test');
console.log('3. Essayez d\'accéder aux différentes routes');
console.log('4. Vérifiez la console pour les logs de debug');

// Fonction pour forcer une connexion (à utiliser dans la console)
window.forceLogin = function(email, role) {
  clearAuthData();
  simulateLogin(email, role);
  console.log(`✅ Connexion forcée: ${email} (${role})`);
  window.location.reload();
};

console.log('\n🔧 Fonctions disponibles:');
console.log('- window.forceLogin(email, role) - Forcer une connexion');
console.log('- clearAuthData() - Nettoyer les données');
console.log('- simulateLogin(email, role) - Simuler une connexion'); 