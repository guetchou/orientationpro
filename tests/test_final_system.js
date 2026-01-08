// Script de test final pour vérifier tout le système
console.log('🎯 Test final du système d\'authentification...\n');

// Fonction pour nettoyer complètement
function cleanSystem() {
  console.log('🧹 Nettoyage complet du système...');
  
  // Nettoyer localStorage
  const keysToRemove = [
    'userToken', 'adminToken', 'userData', 'adminUser', 'userRole',
    'rememberedEmail', 'rememberedMode', 'authToken', 'userData',
    'supabase.auth.token', 'supabase.auth.refreshToken'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Nettoyer les cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('✅ Système nettoyé');
}

// Fonction pour tester la déconnexion
function testLogout() {
  console.log('🔐 Test de déconnexion...');
  
  // Simuler une connexion
  const testUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    role: 'user',
    full_name: 'Test User'
  };
  
  localStorage.setItem('userToken', 'test-token-123');
  localStorage.setItem('userData', JSON.stringify(testUser));
  localStorage.setItem('userRole', 'user');
  
  console.log('✅ Utilisateur de test créé');
  
  // Simuler la déconnexion
  const keysToRemove = [
    'userToken', 'adminToken', 'userData', 'adminUser', 'userRole',
    'rememberedEmail', 'rememberedMode', 'authToken'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Déconnexion simulée réussie');
}

// Fonction pour tester l'inscription
function testRegistration() {
  console.log('📝 Test d\'inscription...');
  
  const newUser = {
    id: `user-${Date.now()}`,
    email: 'newuser@example.com',
    role: 'user',
    full_name: 'New User',
    first_name: 'New',
    last_name: 'User',
    phone: '+242 06 123 45 67',
    is_super_admin: false,
    is_master_admin: false,
    status: 'active'
  };
  
  localStorage.setItem('userToken', `token-${Date.now()}`);
  localStorage.setItem('userData', JSON.stringify(newUser));
  localStorage.setItem('userRole', newUser.role);
  
  console.log('✅ Inscription simulée réussie:', newUser);
}

// Fonction pour vérifier l'état du système
function checkSystemState() {
  console.log('🔍 Vérification de l\'état du système...');
  
  const tokens = {
    'userToken': localStorage.getItem('userToken'),
    'userData': localStorage.getItem('userData'),
    'userRole': localStorage.getItem('userRole'),
    'adminToken': localStorage.getItem('adminToken'),
    'adminUser': localStorage.getItem('adminUser')
  };
  
  let hasData = false;
  Object.entries(tokens).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 50)}...`);
      hasData = true;
      
      if (key === 'userData') {
        try {
          const parsed = JSON.parse(value);
          console.log(`   Rôle: ${parsed.role}`);
          console.log(`   Email: ${parsed.email}`);
          console.log(`   Nom: ${parsed.full_name}`);
        } catch (e) {
          console.log(`❌ Erreur parsing: ${e.message}`);
        }
      }
    } else {
      console.log(`❌ ${key}: null/undefined`);
    }
  });
  
  if (!hasData) {
    console.log('ℹ️ Aucune donnée d\'authentification trouvée');
  }
  
  return hasData;
}

// Fonction pour tester les routes
function testRoutes() {
  console.log('🛣️ Test des routes...');
  
  const routes = [
    { path: '/', name: 'Accueil', public: true },
    { path: '/login', name: 'Connexion', public: true },
    { path: '/register', name: 'Inscription', public: true },
    { path: '/dashboard', name: 'Dashboard Utilisateur', public: false },
    { path: '/admin/dashboard', name: 'Dashboard Admin', public: false },
    { path: '/admin/super-admin', name: 'Super Admin', public: false },
    { path: '/conseiller/dashboard', name: 'Dashboard Conseiller', public: false },
    { path: '/unauthorized', name: 'Accès non autorisé', public: true }
  ];
  
  routes.forEach(route => {
    const status = route.public ? '✅' : '🔒';
    console.log(`  ${status} ${route.name} (${route.path})`);
  });
}

// Fonction pour tester les comptes de test
function testAccounts() {
  console.log('👥 Test des comptes de test...');
  
  const testAccounts = [
    { email: 'user@example.com', role: 'user', password: 'password123' },
    { email: 'conseiller@example.com', role: 'conseiller', password: 'password123' },
    { email: 'admin@example.com', role: 'admin', password: 'password123' },
    { email: 'super_admin@example.com', role: 'super_admin', password: 'password123' }
  ];
  
  testAccounts.forEach(account => {
    console.log(`  👤 ${account.email} (${account.role}) - ${account.password}`);
  });
}

// Fonction pour forcer une connexion (utile pour les tests)
window.forceLogin = function(email, role) {
  cleanSystem();
  
  const userData = {
    id: `test-${Date.now()}`,
    email: email,
    role: role,
    full_name: email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    first_name: email.split('@')[0].split('_')[0],
    last_name: email.split('@')[0].split('_')[1] || 'User',
    is_super_admin: role === 'super_admin',
    is_master_admin: role === 'super_admin',
    status: 'active'
  };
  
  localStorage.setItem('userToken', `token-${Date.now()}`);
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('userRole', role);
  
  console.log(`✅ Connexion forcée: ${email} (${role})`);
  console.log('📊 Données utilisateur:', userData);
  
  // Recharger la page
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Fonction pour nettoyer et recharger
window.cleanAndReload = function() {
  cleanSystem();
  console.log('🔄 Rechargement de la page...');
  window.location.reload();
};

// Tests automatiques
console.log('🧪 Démarrage des tests automatiques...\n');

// Test 1: Nettoyage initial
console.log('1️⃣ Test de nettoyage initial');
cleanSystem();
checkSystemState();

// Test 2: Test de déconnexion
console.log('\n2️⃣ Test de déconnexion');
testLogout();
checkSystemState();

// Test 3: Test d'inscription
console.log('\n3️⃣ Test d\'inscription');
testRegistration();
checkSystemState();

// Test 4: Test des routes
console.log('\n4️⃣ Test des routes');
testRoutes();

// Test 5: Test des comptes
console.log('\n5️⃣ Test des comptes');
testAccounts();

// Nettoyage final
console.log('\n🧹 Nettoyage final...');
cleanSystem();

console.log('\n🎉 Tests terminés !');
console.log('\n📝 Instructions pour tester manuellement:');
console.log('1. Ouvrez http://localhost:8046/register');
console.log('2. Créez un nouveau compte');
console.log('3. Testez la connexion sur http://localhost:8046/login');
console.log('4. Vérifiez l\'accès aux différentes routes');
console.log('5. Testez la déconnexion');

console.log('\n🔧 Fonctions disponibles dans la console:');
console.log('- window.forceLogin(email, role) - Forcer une connexion');
console.log('- window.cleanAndReload() - Nettoyer et recharger');
console.log('- cleanSystem() - Nettoyer le système');
console.log('- checkSystemState() - Vérifier l\'état');
console.log('- testRoutes() - Tester les routes');
console.log('- testAccounts() - Voir les comptes de test');

console.log('\n✅ Système prêt pour les tests !'); 