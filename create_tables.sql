-- =====================================================
-- CRÉATION DES TABLES POUR ORIENTATION PRO CONGO
-- =====================================================

-- 1. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    education_level VARCHAR(100),
    current_job VARCHAR(255),
    experience_years INTEGER,
    interests TEXT[],
    goals TEXT[],
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des résultats de tests
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL, -- 'riasec', 'personality', 'skills', etc.
    test_data JSONB NOT NULL,
    results JSONB NOT NULL,
    score REAL,
    interpretation TEXT,
    recommendations TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    appointment_type VARCHAR(50) NOT NULL, -- 'orientation', 'cv_review', 'career_advice'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    notes TEXT,
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des disponibilités des consultants
CREATE TABLE IF NOT EXISTS availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF',
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table du contenu CMS
CREATE TABLE IF NOT EXISTS cms_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'page', 'blog', 'faq', 'testimonial'
    content TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des CV et documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'cv', 'cover_letter', 'portfolio', 'certificate'
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table des formations et certifications
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- 9. Table des compétences
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100), -- 'technical', 'soft', 'language'
    proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- 'appointment', 'test_result', 'payment', 'system'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Table des sessions de tests
CREATE TABLE IF NOT EXISTS test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,
    session_data JSONB,
    current_question INTEGER DEFAULT 0,
    total_questions INTEGER,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 12. Table des statistiques et analytics
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'test_started', 'test_completed', 'appointment_booked'
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_data JSONB,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CRÉATION DES INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_test_results_profile_id ON test_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_appointments_profile_id ON appointments(profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_availabilities_consultant_id ON availabilities(consultant_id);
CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_cms_contents_slug ON cms_contents(slug);
CREATE INDEX IF NOT EXISTS idx_cms_contents_content_type ON cms_contents(content_type);
CREATE INDEX IF NOT EXISTS idx_documents_profile_id ON documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_profile_id ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_test_sessions_profile_id ON test_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availabilities_updated_at BEFORE UPDATE ON availabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_contents_updated_at BEFORE UPDATE ON cms_contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insertion de consultants de test
INSERT INTO profiles (email, full_name, phone, current_job, experience_years, interests, goals) VALUES
('consultant1@orientationpro.cg', 'Dr. Marie Kimboula', '+242 06 123 4567', 'Conseillère en orientation', 8, ARRAY['psychologie', 'éducation', 'développement personnel'], ARRAY['aider les jeunes à trouver leur voie', 'développer des outils d''orientation innovants']),
('consultant2@orientationpro.cg', 'Prof. Jean Makaya', '+242 06 234 5678', 'Expert en ressources humaines', 12, ARRAY['recrutement', 'gestion de carrière', 'formation'], ARRAY['optimiser les parcours professionnels', 'former les futurs leaders']),
('consultant3@orientationpro.cg', 'Mme. Sarah Nzouba', '+242 06 345 6789', 'Spécialiste en développement de carrière', 6, ARRAY['coaching', 'mentorat', 'entrepreneuriat'], ARRAY['accompagner les entrepreneurs', 'développer l''écosystème local']);

-- Insertion de disponibilités pour les consultants
INSERT INTO availabilities (consultant_id, day_of_week, start_time, end_time) 
SELECT p.id, d.day, '09:00'::time, '17:00'::time
FROM profiles p, (VALUES (1), (2), (3), (4), (5)) AS d(day)
WHERE p.email LIKE '%consultant%';

-- Insertion de contenu CMS de base
INSERT INTO cms_contents (title, slug, content_type, content, is_published, published_at) VALUES
('À propos d''Orientation Pro Congo', 'about', 'page', 'Orientation Pro Congo est la plateforme leader d''orientation professionnelle au Congo. Nous aidons les étudiants et professionnels à découvrir leur potentiel et à construire leur avenir.', true, NOW()),
('Comment fonctionne le test RIASEC', 'riasec-test-guide', 'page', 'Le test RIASEC évalue vos intérêts professionnels selon 6 dimensions : Réaliste, Investigatif, Artistique, Social, Entreprenant, Conventionnel.', true, NOW()),
('FAQ - Questions fréquentes', 'faq', 'page', 'Trouvez les réponses aux questions les plus fréquentes sur nos services d''orientation.', true, NOW());

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

SELECT '✅ Tables créées avec succès !' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public'; 