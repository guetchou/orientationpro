// Test automatique des pages utilisateur
// Navigation séquentielle avec délais

function autoTestUserPages() {
  console.log('🤖 Test automatique des pages utilisateur');
  
  // Connexion utilisateur
  localStorage.setItem('userToken', 'auto-test');
  localStorage.setItem('userRole', 'user');
  localStorage.setItem('userData', JSON.stringify({
    id: 'auto-user',
    email: 'auto@test.com',
    role: 'user',
    full_name: 'Auto Test User'
  }));
  
  console.log('✅ Utilisateur connecté automatiquement');
  
  // Pages à tester
  const pages = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/test-results', name: 'Résultats Tests' },
    { path: '/profile', name: 'Profil' }
  ];
  
  let currentIndex = 0;
  
  function navigateToNext() {
    if (currentIndex < pages.length) {
      const page = pages[currentIndex];
      console.log(`🧭 Navigation vers ${page.name} (${page.path})`);
      window.location.href = page.path;
      currentIndex++;
      
      // Attendre 3 secondes avant la prochaine page
      setTimeout(navigateToNext, 3000);
    } else {
      console.log('✅ Test automatique terminé');
    }
  }
  
  // Démarrer la navigation
  setTimeout(navigateToNext, 1000);
}

// Lancer le test automatique
autoTestUserPages(); 