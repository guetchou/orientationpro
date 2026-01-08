-- =====================================================
-- CRÉATION DES TABLES ATS POUR ORIENTATION PRO CONGO
-- =====================================================

-- 1. Table des candidats
CREATE TABLE IF NOT EXISTS candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(255),
    experience_years INT DEFAULT 0,
    education_level VARCHAR(100),
    location VARCHAR(255),
    salary_expectation DECIMAL(10,2),
    availability VARCHAR(50), -- 'immediate', '2_weeks', '1_month', 'negotiable'
    status ENUM('new', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected') DEFAULT 'new',
    source VARCHAR(100), -- 'website', 'linkedin', 'referral', 'job_board'
    resume_url TEXT,
    cover_letter TEXT,
    notes TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    skills JSON, -- Array of skills
    languages JSON, -- Array of languages with proficiency levels
    certifications JSON, -- Array of certifications
    social_profiles JSON, -- LinkedIn, GitHub, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_position (position),
    INDEX idx_created_at (created_at)
);

-- 2. Table des offres d'emploi
CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency VARCHAR(10) DEFAULT 'XAF',
    employment_type ENUM('full_time', 'part_time', 'contract', 'internship') DEFAULT 'full_time',
    remote_type ENUM('on_site', 'remote', 'hybrid') DEFAULT 'on_site',
    location VARCHAR(255),
    department VARCHAR(100),
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'mid',
    required_skills JSON, -- Array of required skills
    preferred_skills JSON, -- Array of preferred skills
    education_requirements VARCHAR(255),
    language_requirements JSON,
    status ENUM('draft', 'active', 'paused', 'closed') DEFAULT 'draft',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    application_deadline DATE,
    posted_by INT, -- Reference to user who posted
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_title (title),
    INDEX idx_department (department),
    INDEX idx_experience_level (experience_level),
    INDEX idx_created_at (created_at)
);

-- 3. Table des candidatures
CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('applied', 'screening', 'phone_interview', 'technical_test', 'final_interview', 'offer_sent', 'offer_accepted', 'offer_declined', 'hired', 'rejected') DEFAULT 'applied',
    stage VARCHAR(100), -- Current pipeline stage
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    interview_date TIMESTAMP NULL,
    interview_type ENUM('phone', 'video', 'in_person', 'technical') NULL,
    interview_notes TEXT,
    feedback TEXT,
    rejection_reason TEXT,
    offer_details JSON, -- Salary, benefits, start date, etc.
    score DECIMAL(3,1) DEFAULT 0.0, -- Interview score out of 10
    recruiter_notes TEXT,
    next_action VARCHAR(255),
    next_action_date TIMESTAMP NULL,
    
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_job_id (job_id),
    INDEX idx_status (status),
    INDEX idx_stage (stage),
    INDEX idx_applied_at (applied_at),
    
    UNIQUE KEY unique_application (candidate_id, job_id)
);

-- 4. Table des étapes du pipeline
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order (order_index),
    INDEX idx_active (is_active)
);

-- 5. Table des communications
CREATE TABLE IF NOT EXISTS communications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NULL,
    application_id INT NULL,
    type ENUM('email', 'phone', 'sms', 'whatsapp', 'in_person', 'video_call') NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    status ENUM('sent', 'delivered', 'read', 'replied', 'failed') DEFAULT 'sent',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    metadata JSON, -- Additional data like email headers, phone duration, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 6. Table des évaluations et scores
CREATE TABLE IF NOT EXISTS candidate_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    application_id INT NULL,
    assessment_type ENUM('technical', 'personality', 'cultural_fit', 'skills', 'interview') NOT NULL,
    assessor_name VARCHAR(255),
    assessor_role VARCHAR(100),
    score DECIMAL(3,1), -- Score out of 10
    max_score DECIMAL(3,1) DEFAULT 10.0,
    criteria JSON, -- Detailed scoring criteria
    feedback TEXT,
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_score (score),
    INDEX idx_assessment_date (assessment_date)
);

-- 7. Table des documents
CREATE TABLE IF NOT EXISTS candidate_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    document_type ENUM('resume', 'cover_letter', 'portfolio', 'certificate', 'reference', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INT, -- Size in bytes
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_at (uploaded_at)
);

-- 8. Table des activités/logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('candidate', 'job', 'application', 'communication') NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'status_changed', 'email_sent', etc.
    description TEXT,
    old_values JSON,
    new_values JSON,
    performed_by VARCHAR(255), -- User who performed the action
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_performed_at (performed_at)
);

-- =====================================================
-- INSERTION DES DONNÉES INITIALES
-- =====================================================

-- Étapes du pipeline par défaut
INSERT INTO pipeline_stages (name, description, order_index, color) VALUES
('Nouveau', 'Candidatures reçues', 1, '#3B82F6'),
('Présélection', 'Première évaluation du profil', 2, '#EAB308'),
('Entretien RH', 'Entretien avec les ressources humaines', 3, '#8B5CF6'),
('Test technique', 'Évaluation des compétences techniques', 4, '#F97316'),
('Entretien final', 'Entretien avec le manager', 5, '#06B6D4'),
('Offre envoyée', 'Proposition contractuelle envoyée', 6, '#10B981'),
('Embauché', 'Candidat recruté', 7, '#059669'),
('Rejeté', 'Candidature non retenue', 8, '#EF4444');

-- Offres d'emploi d'exemple
INSERT INTO jobs (title, description, requirements, salary_min, salary_max, employment_type, location, department, status, required_skills) VALUES
('Développeur Frontend React', 'Nous recherchons un développeur Frontend expérimenté en React pour rejoindre notre équipe dynamique.', 'Minimum 3 ans d\'expérience en React, TypeScript, HTML/CSS', 800000, 1200000, 'full_time', 'Brazzaville, Congo', 'Développement', 'active', '["React", "TypeScript", "HTML", "CSS", "JavaScript"]'),
('Designer UX/UI', 'Poste de designer UX/UI pour créer des expériences utilisateur exceptionnelles.', 'Portfolio solide, maîtrise de Figma, Adobe Creative Suite', 600000, 900000, 'full_time', 'Pointe-Noire, Congo', 'Design', 'active', '["Figma", "Adobe XD", "Photoshop", "UX Design", "UI Design"]'),
('Chef de Projet Digital', 'Management de projets digitaux et coordination des équipes techniques.', 'Expérience en gestion de projet, certification PMP appréciée', 1000000, 1500000, 'full_time', 'Brazzaville, Congo', 'Management', 'active', '["Gestion de projet", "Scrum", "Leadership", "Communication"]');

-- Candidats d'exemple
INSERT INTO candidates (full_name, email, phone, position, experience_years, location, status, skills, languages) VALUES
('Marie Dubois', 'marie.dubois@email.com', '+242 06 123 4567', 'Développeur Frontend', 5, 'Brazzaville', 'new', '["React", "Vue.js", "JavaScript", "TypeScript", "CSS"]', '["Français", "Anglais"]'),
('Pierre Martin', 'pierre.martin@email.com', '+242 06 987 6543', 'Designer UX', 3, 'Pointe-Noire', 'screening', '["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"]', '["Français", "Anglais", "Lingala"]'),
('Sophie Nkounkou', 'sophie.nk@email.com', '+242 06 456 7890', 'Chef de Projet', 7, 'Brazzaville', 'interview', '["Scrum", "Agile", "JIRA", "Leadership", "Communication"]', '["Français", "Anglais", "Kikongo"]');