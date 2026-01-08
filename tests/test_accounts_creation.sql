-- =====================================================
-- SCRIPT DE TEST - CRÉATION DES COMPTES DE TEST
-- =====================================================

-- Vérification de la structure des tables
SELECT 'Vérification de la structure des tables...' as info;

-- Vérifier que la table profiles existe avec les bonnes colonnes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier que la table user_roles existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- CRÉATION DES COMPTES DE TEST
-- =====================================================

-- Nettoyer les données existantes (optionnel)
-- DELETE FROM public.user_roles WHERE profile_id IN (SELECT id FROM public.profiles WHERE email LIKE '%test%');
-- DELETE FROM public.profiles WHERE email LIKE '%test%';

-- 1. Compte Super Admin
INSERT INTO public.profiles (
    email, 
    full_name, 
    first_name, 
    last_name,
    phone, 
    current_job, 
    experience_years, 
    interests, 
    goals, 
    bio,
    is_super_admin,
    status
) VALUES (
    'super_admin@test.com',
    'Super Administrateur',
    'Super',
    'Admin',
    '+242 06 000 0001',
    'Administrateur Principal',
    10,
    ARRAY['gestion', 'technologie', 'innovation'],
    ARRAY['optimiser la plateforme', 'développer de nouveaux services'],
    'Administrateur principal de la plateforme Orientation Pro Congo',
    true,
    'active'
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    is_super_admin = EXCLUDED.is_super_admin,
    status = EXCLUDED.status;

-- 2. Compte Admin
INSERT INTO public.profiles (
    email, 
    full_name, 
    first_name, 
    last_name,
    phone, 
    current_job, 
    experience_years, 
    interests, 
    goals, 
    bio,
    status
) VALUES (
    'admin@test.com',
    'Administrateur Test',
    'Admin',
    'Test',
    '+242 06 000 0002',
    'Administrateur',
    5,
    ARRAY['gestion', 'administration'],
    ARRAY['gérer les utilisateurs', 'maintenir la plateforme'],
    'Administrateur de la plateforme',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status;

-- 3. Compte Conseiller
INSERT INTO public.profiles (
    email, 
    full_name, 
    first_name, 
    last_name,
    phone, 
    current_job, 
    experience_years, 
    interests, 
    goals, 
    bio,
    status
) VALUES (
    'conseiller@test.com',
    'Conseiller Test',
    'Conseiller',
    'Test',
    '+242 06 000 0003',
    'Conseiller en orientation',
    8,
    ARRAY['psychologie', 'éducation', 'développement personnel'],
    ARRAY['aider les jeunes à trouver leur voie', 'développer des outils d''orientation'],
    'Conseiller en orientation professionnelle',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status;

-- 4. Compte Utilisateur
INSERT INTO public.profiles (
    email, 
    full_name, 
    first_name, 
    last_name,
    phone, 
    current_job, 
    experience_years, 
    interests, 
    goals, 
    bio,
    status
) VALUES (
    'user@test.com',
    'Utilisateur Test',
    'Utilisateur',
    'Test',
    '+242 06 000 0004',
    'Étudiant',
    0,
    ARRAY['informatique', 'développement'],
    ARRAY['trouver un stage', 'apprendre de nouvelles technologies'],
    'Étudiant en informatique',
    'active'
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status;

-- =====================================================
-- ATTRIBUTION DES RÔLES
-- =====================================================

-- Rôle Super Admin
INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'super_admin' 
FROM public.profiles 
WHERE email = 'super_admin@test.com'
ON CONFLICT (profile_id, role) DO NOTHING;

-- Rôle Admin
INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'admin' 
FROM public.profiles 
WHERE email = 'admin@test.com'
ON CONFLICT (profile_id, role) DO NOTHING;

-- Rôle Conseiller
INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'conseiller' 
FROM public.profiles 
WHERE email = 'conseiller@test.com'
ON CONFLICT (profile_id, role) DO NOTHING;

-- Rôle User
INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'user' 
FROM public.profiles 
WHERE email = 'user@test.com'
ON CONFLICT (profile_id, role) DO NOTHING;

-- =====================================================
-- VÉRIFICATION DES DONNÉES
-- =====================================================

SELECT 'Comptes de test créés avec succès !' as message;

-- Afficher tous les profils créés
SELECT 
    p.email,
    p.full_name,
    p.is_super_admin,
    p.status,
    array_agg(ur.role) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.profile_id
WHERE p.email LIKE '%test.com'
GROUP BY p.id, p.email, p.full_name, p.is_super_admin, p.status
ORDER BY p.email;

-- Compter le nombre total de profils
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Compter le nombre total de rôles
SELECT COUNT(*) as total_roles FROM public.user_roles;

-- Vérifier les contraintes
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'user_roles')
ORDER BY tc.table_name, tc.constraint_type; 