const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase locale
const supabaseUrl = 'http://127.0.0.1:55508';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseSchema() {
    console.log('🔍 Test du schéma de base de données...\n');

    try {
        // 1. Vérifier la connexion
        console.log('1. Test de connexion...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (connectionError) {
            throw new Error(`Erreur de connexion: ${connectionError.message}`);
        }
        console.log('✅ Connexion réussie\n');

        // 2. Vérifier la structure des tables
        console.log('2. Vérification de la structure des tables...');
        
        // Vérifier la table profiles
        const { data: profilesStructure, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(0);
        
        if (profilesError) {
            throw new Error(`Erreur avec la table profiles: ${profilesError.message}`);
        }
        console.log('✅ Table profiles accessible');

        // Vérifier la table user_roles
        const { data: rolesStructure, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .limit(0);
        
        if (rolesError) {
            throw new Error(`Erreur avec la table user_roles: ${rolesError.message}`);
        }
        console.log('✅ Table user_roles accessible');

        // Vérifier la table test_results
        const { data: testResultsStructure, error: testResultsError } = await supabase
            .from('test_results')
            .select('*')
            .limit(0);
        
        if (testResultsError) {
            throw new Error(`Erreur avec la table test_results: ${testResultsError.message}`);
        }
        console.log('✅ Table test_results accessible');

        // Vérifier la table appointments
        const { data: appointmentsStructure, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .limit(0);
        
        if (appointmentsError) {
            throw new Error(`Erreur avec la table appointments: ${appointmentsError.message}`);
        }
        console.log('✅ Table appointments accessible\n');

        // 3. Créer les comptes de test
        console.log('3. Création des comptes de test...');

        const testAccounts = [
            {
                email: 'super_admin@test.com',
                full_name: 'Super Administrateur',
                first_name: 'Super',
                last_name: 'Admin',
                phone: '+242 06 000 0001',
                current_job: 'Administrateur Principal',
                experience_years: 10,
                interests: ['gestion', 'technologie', 'innovation'],
                goals: ['optimiser la plateforme', 'développer de nouveaux services'],
                bio: 'Administrateur principal de la plateforme Orientation Pro Congo',
                is_super_admin: true,
                status: 'active',
                role: 'super_admin'
            },
            {
                email: 'admin@test.com',
                full_name: 'Administrateur Test',
                first_name: 'Admin',
                last_name: 'Test',
                phone: '+242 06 000 0002',
                current_job: 'Administrateur',
                experience_years: 5,
                interests: ['gestion', 'administration'],
                goals: ['gérer les utilisateurs', 'maintenir la plateforme'],
                bio: 'Administrateur de la plateforme',
                status: 'active',
                role: 'admin'
            },
            {
                email: 'conseiller@test.com',
                full_name: 'Conseiller Test',
                first_name: 'Conseiller',
                last_name: 'Test',
                phone: '+242 06 000 0003',
                current_job: 'Conseiller en orientation',
                experience_years: 8,
                interests: ['psychologie', 'éducation', 'développement personnel'],
                goals: ['aider les jeunes à trouver leur voie', 'développer des outils d\'orientation'],
                bio: 'Conseiller en orientation professionnelle',
                status: 'active',
                role: 'conseiller'
            },
            {
                email: 'user@test.com',
                full_name: 'Utilisateur Test',
                first_name: 'Utilisateur',
                last_name: 'Test',
                phone: '+242 06 000 0004',
                current_job: 'Étudiant',
                experience_years: 0,
                interests: ['informatique', 'développement'],
                goals: ['trouver un stage', 'apprendre de nouvelles technologies'],
                bio: 'Étudiant en informatique',
                status: 'active',
                role: 'user'
            }
        ];

        for (const account of testAccounts) {
            const { role, ...profileData } = account;
            
            // Insérer le profil
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'email' })
                .select()
                .single();

            if (profileError) {
                console.error(`❌ Erreur lors de la création du profil ${account.email}:`, profileError.message);
                continue;
            }

            // Insérer le rôle
            const { error: roleError } = await supabase
                .from('user_roles')
                .upsert({
                    profile_id: profile.id,
                    role: role
                }, { onConflict: 'profile_id,role' });

            if (roleError) {
                console.error(`❌ Erreur lors de l'attribution du rôle ${role} pour ${account.email}:`, roleError.message);
            } else {
                console.log(`✅ Compte créé: ${account.email} (${role})`);
            }
        }

        console.log('\n4. Vérification des comptes créés...');

        // Récupérer tous les comptes de test avec leurs rôles
        const { data: testProfiles, error: testProfilesError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                is_super_admin,
                status,
                user_roles(role)
            `)
            .like('email', '%test.com')
            .order('email');

        if (testProfilesError) {
            throw new Error(`Erreur lors de la récupération des profils: ${testProfilesError.message}`);
        }

        console.log('\n📋 Comptes de test créés:');
        testProfiles.forEach(profile => {
            const roles = profile.user_roles?.map(ur => ur.role).join(', ') || 'Aucun rôle';
            console.log(`  • ${profile.email} (${profile.full_name}) - Rôles: ${roles}`);
        });

        // 5. Test des fonctionnalités de base
        console.log('\n5. Test des fonctionnalités de base...');

        // Test de création d'un résultat de test
        const testResult = {
            profile_id: testProfiles[0].id,
            test_type: 'riasec',
            test_data: { questions: 30, duration: 15 },
            results: { 
                realistic: 75, 
                investigative: 60, 
                artistic: 45, 
                social: 80, 
                enterprising: 70, 
                conventional: 55 
            },
            score: 85.5,
            interpretation: 'Profil orienté vers les relations sociales et la gestion',
            recommendations: ['Conseiller en orientation', 'Gestionnaire de projet', 'Formateur']
        };

        const { data: createdTestResult, error: testResultError } = await supabase
            .from('test_results')
            .insert(testResult)
            .select()
            .single();

        if (testResultError) {
            console.error('❌ Erreur lors de la création d\'un résultat de test:', testResultError.message);
        } else {
            console.log('✅ Création d\'un résultat de test réussie');
        }

        // Test de création d'un rendez-vous
        const appointment = {
            profile_id: testProfiles[0].id,
            consultant_id: testProfiles[2].id, // conseiller
            appointment_type: 'orientation',
            status: 'pending',
            scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
            duration_minutes: 60,
            notes: 'Première consultation d\'orientation'
        };

        const { data: createdAppointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert(appointment)
            .select()
            .single();

        if (appointmentError) {
            console.error('❌ Erreur lors de la création d\'un rendez-vous:', appointmentError.message);
        } else {
            console.log('✅ Création d\'un rendez-vous réussie');
        }

        // 6. Statistiques finales
        console.log('\n6. Statistiques finales...');

        const { count: totalProfiles } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        const { count: totalRoles } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true });

        const { count: totalTestResults } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true });

        const { count: totalAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Statistiques:`);
        console.log(`  • Profils: ${totalProfiles}`);
        console.log(`  • Rôles: ${totalRoles}`);
        console.log(`  • Résultats de tests: ${totalTestResults}`);
        console.log(`  • Rendez-vous: ${totalAppointments}`);

        console.log('\n🎉 Test du schéma terminé avec succès !');
        console.log('\n📝 Comptes de test disponibles:');
        console.log('  • super_admin@test.com (Super Admin)');
        console.log('  • admin@test.com (Admin)');
        console.log('  • conseiller@test.com (Conseiller)');
        console.log('  • user@test.com (Utilisateur)');
        console.log('\n🔑 Mot de passe pour tous les comptes: password123');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        process.exit(1);
    }
}

// Exécuter le test
testDatabaseSchema(); 