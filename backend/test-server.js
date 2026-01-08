
const http = require('http');

// Test de l'endpoint de santé
function testHealthEndpoint() {
  console.log('🧪 Test de l\'endpoint de santé...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Réponse:', response);
        console.log('🎉 Serveur backend fonctionnel !');
      } catch (error) {
        console.error('❌ Erreur de parsing JSON:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('💡 Assurez-vous que le serveur est démarré avec: npm start');
  });

  req.end();
}

// Test de l'endpoint de login
function testLoginEndpoint() {
  console.log('🧪 Test de l\'endpoint de login...');
  
  const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Login réponse:', response);
      } catch (error) {
        console.error('❌ Erreur de parsing JSON:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
  });

  req.write(postData);
  req.end();
}

// Lancer les tests
setTimeout(() => {
  testHealthEndpoint();
  setTimeout(() => {
    testLoginEndpoint();
  }, 1000);
}, 2000);
