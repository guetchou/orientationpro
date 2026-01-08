const puppeteer = require('puppeteer');

// Liste de tous les liens trouvés dans l'application
const allLinks = [
  // Routes principales
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/profile',
  '/tests',
  '/tests/riasec',
  '/test-results',
  
  // Pages de tests
  '/test-riasec',
  '/test-emotional',
  '/test-learning',
  '/test-multiple',
  '/test-career-transition',
  '/test-no-diploma',
  '/test-senior-employment',
  '/test-entrepreneurial',
  
  // Pages de services
  '/orientation-services',
  '/conseillers',
  '/conseiller',
  '/establishments',
  '/resources',
  '/recrutement',
  '/ats',
  '/blog',
  '/about',
  '/contact',
  
  // Pages admin
  '/admin/dashboard',
  '/admin/super-admin',
  '/admin/ats',
  '/admin/blog',
  '/admin/media',
  '/admin/cms',
  '/admin/user-management',
  '/admin/user-credentials',
  
  // Pages de conseiller
  '/conseiller/dashboard',
  
  // Pages de paiement
  '/payment',
  '/payment-success',
  '/payment-cancel',
  
  // Pages de réinitialisation
  '/reset-password',
  '/update-password',
  
  // Pages d'onboarding
  '/onboarding',
  
  // Pages de forum
  '/forum',
  '/forum/create',
  
  // Pages de recrutement
  '/recrutement',
  
  // Pages de tests spécifiques
  '/test-multiple',
  '/test-learning',
  '/test-career-transition',
  '/test-no-diploma',
  '/test-senior-employment',
  '/test-entrepreneurial',
  '/test-emotional',
  '/test-riasec',
  
  // Pages de résultats
  '/test-results',
  
  // Pages de profil
  '/profile',
  
  // Pages de contact et support
  '/contact',
  '/about',
  
  // Pages légales
  '/impressum',
  '/data-protection'
];

async function testNavigation() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Configuration de la page
  await page.setViewport({ width: 1280, height: 720 });
  await page.setDefaultTimeout(10000);
  
  console.log('🚀 Démarrage des tests de navigation...\n');
  
  const results = {
    working: [],
    broken: [],
    redirects: [],
    errors: []
  };
  
  for (const link of allLinks) {
    try {
      console.log(`🔍 Test de: ${link}`);
      
      // Naviguer vers la page
      const response = await page.goto(`http://10.10.0.5:7474${link}`, {
        waitUntil: 'networkidle2'
      });
      
      // Vérifier le statut de la réponse
      if (response.status() === 200) {
        // Vérifier si on est redirigé vers la page d'accueil (404)
        const currentUrl = page.url();
        if (currentUrl.includes('/') && link !== '/' && !currentUrl.includes(link)) {
          console.log(`  ❌ Redirection vers l'accueil (404 probable)`);
          results.redirects.push({ link, redirectedTo: currentUrl });
        } else {
          console.log(`  ✅ Page accessible`);
          results.working.push(link);
        }
      } else if (response.status() === 404) {
        console.log(`  ❌ Page non trouvée (404)`);
        results.broken.push(link);
      } else {
        console.log(`  ⚠️  Statut inattendu: ${response.status()}`);
        results.errors.push({ link, status: response.status() });
      }
      
      // Attendre un peu entre les tests
      await page.waitForTimeout(500);
      
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`);
      results.errors.push({ link, error: error.message });
    }
  }
  
  // Afficher le résumé
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('====================');
  console.log(`✅ Pages fonctionnelles: ${results.working.length}`);
  console.log(`❌ Pages cassées: ${results.broken.length}`);
  console.log(`🔄 Redirections: ${results.redirects.length}`);
  console.log(`⚠️  Erreurs: ${results.errors.length}`);
  
  if (results.working.length > 0) {
    console.log('\n✅ PAGES FONCTIONNELLES:');
    results.working.forEach(link => console.log(`  - ${link}`));
  }
  
  if (results.broken.length > 0) {
    console.log('\n❌ PAGES CASSÉES:');
    results.broken.forEach(link => console.log(`  - ${link}`));
  }
  
  if (results.redirects.length > 0) {
    console.log('\n🔄 REDIRECTIONS (404 probables):');
    results.redirects.forEach(({ link, redirectedTo }) => 
      console.log(`  - ${link} → ${redirectedTo}`)
    );
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  ERREURS:');
    results.errors.forEach(({ link, error, status }) => 
      console.log(`  - ${link}: ${error || `Status ${status}`}`)
    );
  }
  
  await browser.close();
}

// Vérifier si l'application est en cours d'exécution
async function checkAppRunning() {
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.goto('http://10.10.0.5:7474', { timeout: 10000 });
    await browser.close();
    return true;
  } catch (error) {
    console.log('Erreur de connexion:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Vérification que l\'application est en cours d\'exécution...');
  
  const isRunning = await checkAppRunning();
  if (!isRunning) {
    console.log('❌ L\'application n\'est pas accessible sur http://10.10.0.5:7474');
    console.log('💡 Assurez-vous que l\'application est démarrée avec: npm run dev ou via Docker');
    return;
  }
  
  console.log('✅ Application détectée, démarrage des tests...\n');
  await testNavigation();
}

main().catch(console.error); 