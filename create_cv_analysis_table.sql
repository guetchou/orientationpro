-- =====================================================
-- TABLE CV_ANALYSIS POUR LE SYSTÈME ATS INTELLIGENT
-- =====================================================

CREATE TABLE IF NOT EXISTS cv_analysis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    candidate_id INT NULL, -- Lien avec la table candidates
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    file_size INT,
    mime_type VARCHAR(100),
    document_type ENUM('cv', 'resume', 'cover_letter', 'portfolio', 'other') DEFAULT 'cv',
    
    -- Texte extrait
    extracted_text LONGTEXT,
    
    -- Analyse intelligente
    detected_language VARCHAR(10) DEFAULT 'fr',
    detected_sections JSON, -- Sections détectées: contact, experience, education, skills, etc.
    
    -- Informations extraites automatiquement
    contact_info JSON, -- Email, téléphone, adresse, LinkedIn, etc.
    personal_info JSON, -- Nom, prénom, âge, nationalité, etc.
    education JSON, -- Formations, diplômes, écoles
    experience JSON, -- Expériences professionnelles
    skills JSON, -- Compétences techniques et soft skills
    languages JSON, -- Langues parlées
    certifications JSON, -- Certifications et formations
    
    -- Scores et évaluation
    ats_score DECIMAL(5,2) DEFAULT 0.00,
    completeness_score DECIMAL(5,2) DEFAULT 0.00,
    relevance_score DECIMAL(5,2) DEFAULT 0.00,
    presentation_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Feedback et recommandations
    feedback TEXT,
    strengths JSON, -- Points forts identifiés
    weaknesses JSON, -- Points faibles identifiés
    recommendations JSON, -- Recommandations d'amélioration
    
    -- Analyse sémantique avancée
    keywords JSON, -- Mots-clés extraits
    sentiment_score DECIMAL(3,2) DEFAULT 0.00, -- Score de sentiment (-1 à 1)
    readability_score DECIMAL(5,2) DEFAULT 0.00, -- Score de lisibilité
    
    -- Matching avec offres d'emploi
    job_matches JSON, -- Correspondances avec les offres
    match_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Métadonnées
    processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processing_time_ms INT DEFAULT 0,
    ai_model_version VARCHAR(50) DEFAULT 'v1.0',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analyzed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index et contraintes
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_document_type (document_type),
    INDEX idx_ats_score (ats_score),
    INDEX idx_processing_status (processing_status),
    INDEX idx_upload_date (upload_date)
);

-- Table pour stocker les templates de matching
CREATE TABLE IF NOT EXISTS job_matching_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    required_keywords JSON, -- Mots-clés obligatoires
    preferred_keywords JSON, -- Mots-clés préférés
    excluded_keywords JSON, -- Mots-clés à éviter
    minimum_experience_years INT DEFAULT 0,
    required_education_level VARCHAR(100),
    weight_experience DECIMAL(3,2) DEFAULT 0.30,
    weight_education DECIMAL(3,2) DEFAULT 0.20,
    weight_skills DECIMAL(3,2) DEFAULT 0.40,
    weight_other DECIMAL(3,2) DEFAULT 0.10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id)
);

-- Insérer des templates de matching pour les offres existantes
INSERT INTO job_matching_templates (job_id, required_keywords, preferred_keywords, minimum_experience_years, required_education_level) 
SELECT 
    id,
    required_skills,
    '["JavaScript", "Frontend", "Web Development", "UI/UX"]',
    3,
    'Licence'
FROM jobs 
WHERE title LIKE '%Frontend%'
AND NOT EXISTS (SELECT 1 FROM job_matching_templates WHERE job_id = jobs.id);

INSERT INTO job_matching_templates (job_id, required_keywords, preferred_keywords, minimum_experience_years, required_education_level) 
SELECT 
    id,
    required_skills,
    '["Design Thinking", "User Experience", "Visual Design", "Prototyping"]',
    2,
    'Licence'
FROM jobs 
WHERE title LIKE '%Designer%' OR title LIKE '%UX%' OR title LIKE '%UI%'
AND NOT EXISTS (SELECT 1 FROM job_matching_templates WHERE job_id = jobs.id);