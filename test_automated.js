// Test automatisé des pages utilisateur
// Ce script simule les actions d'un utilisateur réel

import puppeteer from 'puppeteer';

async function testUserPages() {
  console.log('🤖 Démarrage du test automatisé des pages utilisateur...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Pour voir ce qui se passe
    slowMo: 1000 // Ralentir pour observer
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Aller sur la page d'accueil
    console.log('📱 Navigation vers la page d\'accueil...');
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);
    
    // 2. Aller à la page de connexion
    console.log('🔐 Navigation vers la page de connexion...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    // 3. Simuler la connexion utilisateur
    console.log('👤 Simulation de la connexion utilisateur...');
    
    // Injecter les données utilisateur dans localStorage
    await page.evaluate(() => {
      localStorage.setItem('userToken', 'test-token');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userData', JSON.stringify({
        id: '1',
        email: 'user@test.com',
        role: 'user',
        full_name: 'Test User'
      }));
    });
    
    // 4. Tester le dashboard utilisateur
    console.log('🏠 Test du dashboard utilisateur...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // Vérifier que la page s'affiche
    const dashboardTitle = await page.$('h1, h2, h3');
    if (dashboardTitle) {
      console.log('✅ Dashboard utilisateur accessible');
    } else {
      console.log('❌ Dashboard utilisateur non accessible');
    }
    
    // 5. Tester la page des résultats de tests
    console.log('📊 Test de la page des résultats de tests...');
    await page.goto('http://localhost:3000/test-results');
    await page.waitForTimeout(3000);
    
    // 6. Tester la page de profil
    console.log('👤 Test de la page de profil...');
    await page.goto('http://localhost:3000/profile');
    await page.waitForTimeout(3000);
    
    // 7. Tester l'accès aux pages admin (doit être refusé)
    console.log('🚫 Test de l\'accès aux pages admin...');
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForTimeout(2000);
    
    // Vérifier si on est redirigé
    const currentUrl = page.url();
    if (currentUrl.includes('/admin')) {
      console.log('❌ Accès aux pages admin non bloqué');
    } else {
      console.log('✅ Accès aux pages admin correctement bloqué');
    }
    
    console.log('✅ Test automatisé terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await browser.close();
  }
}

// Exécuter le test
testUserPages(); 