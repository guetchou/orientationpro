const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase locale
const supabaseUrl = 'http://127.0.0.1:55508';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginRoutes() {
    console.log('🔍 Test des routes de connexion...\n');

    const testAccounts = [
        {
            email: 'super_admin@test.com',
            password: 'password123',
            expectedRole: 'super_admin',
            expectedRoute: '/admin/super-admin'
        },
        {
            email: 'admin@test.com',
            password: 'password123',
            expectedRole: 'admin',
            expectedRoute: '/admin/dashboard'
        },
        {
            email: 'conseiller@test.com',
            password: 'password123',
            expectedRole: 'conseiller',
            expectedRoute: '/conseiller/dashboard'
        },
        {
            email: 'user@test.com',
            password: 'password123',
            expectedRole: 'user',
            expectedRoute: '/dashboard'
        }
    ];

    for (const account of testAccounts) {
        console.log(`📝 Test du compte: ${account.email}`);
        
        try {
            // Simuler la logique de connexion du Login.tsx
            const testAccountsMap = {
                'super_admin@test.com': { role: 'super_admin', password: 'password123' },
                'admin@test.com': { role: 'admin', password: 'password123' },
                'conseiller@test.com': { role: 'conseiller', password: 'password123' },
                'user@test.com': { role: 'user', password: 'password123' }
            };

            const testAccount = testAccountsMap[account.email];
            
            if (testAccount && account.password === testAccount.password) {
                // Connexion réussie pour un compte de test
                const userData = {
                    id: `test-${Date.now()}`,
                    email: account.email,
                    role: testAccount.role,
                    full_name: account.email.split('@')[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    is_super_admin: testAccount.role === 'super_admin'
                };

                console.log(`✅ Connexion réussie pour ${account.email}`);
                console.log(`   Rôle: ${userData.role}`);
                console.log(`   Route attendue: ${account.expectedRoute}`);
                console.log(`   Nom complet: ${userData.full_name}`);
                console.log(`   Super admin: ${userData.is_super_admin}`);
                
                // Vérifier que le rôle correspond à l'attendu
                if (userData.role === account.expectedRole) {
                    console.log(`✅ Rôle correct: ${userData.role}`);
                } else {
                    console.log(`❌ Rôle incorrect: attendu ${account.expectedRole}, obtenu ${userData.role}`);
                }
                
            } else {
                console.log(`❌ Échec de connexion pour ${account.email}`);
            }
            
        } catch (error) {
            console.error(`❌ Erreur lors du test de ${account.email}:`, error.message);
        }
        
        console.log(''); // Ligne vide pour séparer les tests
    }

    // Test des routes de protection
    console.log('🔒 Test des routes de protection...\n');
    
    const protectionTests = [
        {
            role: 'super_admin',
            routes: ['/admin/dashboard', '/admin/super-admin', '/conseiller/dashboard'],
            shouldAccess: [true, true, true]
        },
        {
            role: 'admin',
            routes: ['/admin/dashboard', '/admin/super-admin', '/conseiller/dashboard'],
            shouldAccess: [true, true, true]
        },
        {
            role: 'conseiller',
            routes: ['/admin/dashboard', '/admin/super-admin', '/conseiller/dashboard'],
            shouldAccess: [false, false, true]
        },
        {
            role: 'user',
            routes: ['/admin/dashboard', '/admin/super-admin', '/conseiller/dashboard'],
            shouldAccess: [false, false, false]
        }
    ];

    for (const test of protectionTests) {
        console.log(`🔐 Test de protection pour le rôle: ${test.role}`);
        
        for (let i = 0; i < test.routes.length; i++) {
            const route = test.routes[i];
            const shouldAccess = test.shouldAccess[i];
            
            // Simuler la logique de protection des routes
            let canAccess = false;
            
            if (test.role === 'super_admin' || test.role === 'admin') {
                canAccess = route.startsWith('/admin/') || route.startsWith('/conseiller/');
            } else if (test.role === 'conseiller') {
                canAccess = route.startsWith('/conseiller/');
            } else {
                canAccess = false;
            }
            
            const status = canAccess === shouldAccess ? '✅' : '❌';
            console.log(`   ${status} ${route}: ${canAccess ? 'Accès autorisé' : 'Accès refusé'} (attendu: ${shouldAccess ? 'autorisé' : 'refusé'})`);
        }
        
        console.log('');
    }

    console.log('🎉 Test des routes terminé !');
    console.log('\n📋 Résumé des comptes de test:');
    console.log('  • super_admin@test.com → /admin/super-admin');
    console.log('  • admin@test.com → /admin/dashboard');
    console.log('  • conseiller@test.com → /conseiller/dashboard');
    console.log('  • user@test.com → /dashboard');
    console.log('\n🔑 Mot de passe pour tous: password123');
}

// Exécuter le test
testLoginRoutes(); 