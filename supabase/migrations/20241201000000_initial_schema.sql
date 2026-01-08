-- =====================================================
-- MIGRATION INITIALE - ORIENTATION PRO CONGO
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLES PRINCIPALES
-- =====================================================

-- 1. Table des profils utilisateurs (compatible Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    education_level VARCHAR(100),
    current_job VARCHAR(255),
    experience_years INTEGER,
    interests TEXT[],
    goals TEXT[],
    bio TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    avatar_url TEXT,
    linkedin_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    is_master_admin BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin', 'conseiller', 'super_admin')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, role)
);

-- 3. Table des résultats de tests
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL, -- 'riasec', 'personality', 'skills', etc.
    test_data JSONB NOT NULL,
    results JSONB NOT NULL,
    score REAL,
    interpretation TEXT,
    recommendations TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des sessions de tests
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,
    session_data JSONB,
    current_question INTEGER DEFAULT 0,
    total_questions INTEGER,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 5. Table des rendez-vous
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    conseiller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_type VARCHAR(50) NOT NULL, -- 'orientation', 'cv_review', 'career_advice'
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    date DATE,
    time VARCHAR(20),
    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    meeting_link TEXT,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des disponibilités des consultants
CREATE TABLE IF NOT EXISTS public.availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des paiements
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    item_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF',
    payment_method VARCHAR(50),
    payment_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    metadata JSONB,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table du contenu CMS
CREATE TABLE IF NOT EXISTS public.cms_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'page', 'blog', 'faq', 'testimonial'
    content TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table des CV et documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'cv', 'cover_letter', 'portfolio', 'certificate'
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table des formations et certifications
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Table des compétences
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100), -- 'technical', 'soft', 'language'
    proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- 'appointment', 'test_result', 'payment', 'system'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Table des statistiques et analytics
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'test_started', 'test_completed', 'appointment_booked'
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_data JSONB,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Table des logs
CREATE TABLE IF NOT EXISTS public.logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLES FORUM
-- =====================================================

-- 15. Table des domaines du forum
CREATE TABLE IF NOT EXISTS public.forum_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Table des posts du forum
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    domain UUID REFERENCES public.forum_domains(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    tags TEXT[]
);

-- 17. Table des réponses du forum
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes INTEGER DEFAULT 0
);

-- 18. Table des likes du forum
CREATE TABLE IF NOT EXISTS public.forum_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (post_id IS NOT NULL AND reply_id IS NULL) OR
        (post_id IS NULL AND reply_id IS NOT NULL)
    )
);

-- =====================================================
-- TABLES ÉTABLISSEMENTS ET CANDIDATS
-- =====================================================

-- 19. Table des candidats
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(255),
    resume_url TEXT,
    motivation TEXT,
    experience TEXT,
    status VARCHAR(50),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes TEXT
);

-- 20. Table des établissements
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(255),
    coordinates JSONB,
    description TEXT,
    phone VARCHAR(50),
    website VARCHAR(255),
    email VARCHAR(255),
    ratings REAL CHECK (ratings BETWEEN 0 AND 5),
    reviewCount INTEGER DEFAULT 0,
    programs TEXT[],
    image TEXT,
    neighborhood VARCHAR(255)
);

-- 21. Table des quartiers
CREATE TABLE IF NOT EXISTS public.neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    type VARCHAR(100),
    description TEXT,
    coordinates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les profils
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Index pour les tests
CREATE INDEX IF NOT EXISTS idx_test_results_profile_id ON public.test_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON public.test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_test_sessions_profile_id ON public.test_sessions(profile_id);

-- Index pour les rendez-vous
CREATE INDEX IF NOT EXISTS idx_appointments_profile_id ON public.appointments(profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_consultant_id ON public.appointments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);

-- Index pour les disponibilités
CREATE INDEX IF NOT EXISTS idx_availabilities_consultant_id ON public.availabilities(consultant_id);

-- Index pour les paiements
CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON public.payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Index pour le CMS
CREATE INDEX IF NOT EXISTS idx_cms_contents_slug ON public.cms_contents(slug);
CREATE INDEX IF NOT EXISTS idx_cms_contents_content_type ON public.cms_contents(content_type);

-- Index pour les documents
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON public.documents(profile_id);

-- Index pour les compétences
CREATE INDEX IF NOT EXISTS idx_skills_profile_id ON public.skills(profile_id);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Index pour les analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at);

-- Index pour le forum
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_domain ON public.forum_posts(domain);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON public.forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user_id ON public.forum_likes(user_id);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availabilities_updated_at 
    BEFORE UPDATE ON public.availabilities 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_contents_updated_at 
    BEFORE UPDATE ON public.cms_contents 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON public.documents 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at 
    BEFORE UPDATE ON public.certifications 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_domains_updated_at 
    BEFORE UPDATE ON public.forum_domains 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at 
    BEFORE UPDATE ON public.forum_posts 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_neighborhoods_updated_at 
    BEFORE UPDATE ON public.neighborhoods 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Politiques de base (à personnaliser selon vos besoins)
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own test results" ON public.test_results
    FOR SELECT USING (auth.uid()::text = profile_id::text);

CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid()::text = profile_id::text OR auth.uid()::text = consultant_id::text);

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insertion de consultants de test
INSERT INTO public.profiles (email, full_name, phone, current_job, experience_years, interests, goals, is_super_admin) VALUES
('admin@orientationpro.cg', 'Administrateur Principal', '+242 06 000 0001', 'Administrateur Système', 10, ARRAY['gestion', 'technologie', 'innovation'], ARRAY['optimiser la plateforme', 'développer de nouveaux services'], true),
('conseiller1@orientationpro.cg', 'Dr. Marie Kimboula', '+242 06 123 4567', 'Conseillère en orientation', 8, ARRAY['psychologie', 'éducation', 'développement personnel'], ARRAY['aider les jeunes à trouver leur voie', 'développer des outils d''orientation innovants'], false),
('conseiller2@orientationpro.cg', 'Prof. Jean Makaya', '+242 06 234 5678', 'Expert en ressources humaines', 12, ARRAY['recrutement', 'gestion de carrière', 'formation'], ARRAY['optimiser les parcours professionnels', 'former les futurs leaders'], false),
('user@orientationpro.cg', 'Utilisateur Test', '+242 06 999 9999', 'Étudiant', 0, ARRAY['informatique', 'développement'], ARRAY['trouver un stage', 'apprendre de nouvelles technologies'], false);

-- Attribution des rôles
INSERT INTO public.user_roles (profile_id, role) 
SELECT id, 'super_admin' FROM public.profiles WHERE email = 'admin@orientationpro.cg';

INSERT INTO public.user_roles (profile_id, role) 
SELECT id, 'conseiller' FROM public.profiles WHERE email LIKE '%conseiller%';

INSERT INTO public.user_roles (profile_id, role) 
SELECT id, 'user' FROM public.profiles WHERE email = 'user@orientationpro.cg';

-- Insertion de disponibilités pour les consultants
INSERT INTO public.availabilities (consultant_id, day_of_week, start_time, end_time) 
SELECT p.id, d.day, '09:00'::time, '17:00'::time
FROM public.profiles p, (VALUES (1), (2), (3), (4), (5)) AS d(day)
WHERE p.email LIKE '%conseiller%';

-- Insertion de contenu CMS de base
INSERT INTO public.cms_contents (title, slug, content_type, content, is_published, published_at) VALUES
('À propos d''Orientation Pro Congo', 'about', 'page', 'Orientation Pro Congo est la plateforme leader d''orientation professionnelle au Congo. Nous aidons les étudiants et professionnels à découvrir leur potentiel et à construire leur avenir.', true, NOW()),
('Comment fonctionne le test RIASEC', 'riasec-test-guide', 'page', 'Le test RIASEC évalue vos intérêts professionnels selon 6 dimensions : Réaliste, Investigatif, Artistique, Social, Entreprenant, Conventionnel.', true, NOW()),
('FAQ - Questions fréquentes', 'faq', 'page', 'Trouvez les réponses aux questions les plus fréquentes sur nos services d''orientation.', true, NOW());

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

SELECT '✅ Migration initiale appliquée avec succès !' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'; 