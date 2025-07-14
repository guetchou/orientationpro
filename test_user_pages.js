// Méthode simple pour tester les pages utilisateur
// Copiez et collez ce code dans la console du navigateur

// 1. Connexion rapide
localStorage.setItem('userToken', 'test');
localStorage.setItem('userRole', 'user');
localStorage.setItem('userData', JSON.stringify({
  id: '1',
  email: 'user@test.com',
  role: 'user',
  full_name: 'Test User'
}));

console.log('✅ Utilisateur connecté');

// 2. Test des pages
const pages = ['/dashboard', '/test-results', '/profile'];

pages.forEach(page => {
  console.log(`🧭 Test: ${page}`);
  window.location.href = page;
}); 