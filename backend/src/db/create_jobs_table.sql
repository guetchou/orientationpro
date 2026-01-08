-- Création de la table des offres d'emploi
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL DEFAULT 'Brazzaville, Congo',
  description TEXT,
  url VARCHAR(500) NOT NULL,
  salary VARCHAR(100),
  type ENUM('CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel', 'Intérim') NOT NULL DEFAULT 'CDI',
  category VARCHAR(100) NOT NULL DEFAULT 'Autre',
  source VARCHAR(100) NOT NULL,
  publishedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  scrapedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  requirements JSON,
  benefits JSON,
  views INT NOT NULL DEFAULT 0,
  applications INT NOT NULL DEFAULT 0,
  isVerified BOOLEAN NOT NULL DEFAULT FALSE,
  isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
  expiresAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Index pour optimiser les requêtes
  INDEX idx_active_date (isActive, publishedDate),
  INDEX idx_category (category),
  INDEX idx_location (location),
  INDEX idx_company (company),
  INDEX idx_source (source),
  INDEX idx_title (title),
  INDEX idx_type (type),
  INDEX idx_featured (isFeatured),
  INDEX idx_verified (isVerified),
  
  -- Contraintes
  CONSTRAINT chk_title_length CHECK (CHAR_LENGTH(title) >= 5),
  CONSTRAINT chk_company_length CHECK (CHAR_LENGTH(company) >= 2),
  CONSTRAINT chk_url_format CHECK (url LIKE 'http%'),
  CONSTRAINT chk_views_positive CHECK (views >= 0),
  CONSTRAINT chk_applications_positive CHECK (applications >= 0)
);

-- Insertion de quelques offres d'exemple
INSERT INTO jobs (title, company, location, description, url, salary, type, category, source, isVerified, isFeatured) VALUES
(
  'Développeur Full Stack',
  'Orange Congo',
  'Brazzaville, Congo',
  'Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe technique. Vous serez responsable du développement et de la maintenance de nos applications web et mobiles.',
  'https://example.com/job/1',
  '500 000 - 800 000 FCFA',
  'CDI',
  'Informatique',
  'OrientationPro',
  TRUE,
  TRUE
),
(
  'Comptable Senior',
  'Banque Commerciale du Congo',
  'Pointe-Noire, Congo',
  'Poste de comptable senior pour gérer la comptabilité générale et les états financiers de la banque. Expérience requise dans le secteur bancaire.',
  'https://example.com/job/2',
  '400 000 - 600 000 FCFA',
  'CDI',
  'Finance',
  'OrientationPro',
  TRUE,
  FALSE
),
(
  'Ingénieur Pétrolier',
  'Total Energies Congo',
  'Pointe-Noire, Congo',
  'Ingénieur pétrolier pour superviser les opérations de forage et de production. Formation en génie pétrolier requise.',
  'https://example.com/job/3',
  '800 000 - 1 200 000 FCFA',
  'CDI',
  'Ingénierie',
  'OrientationPro',
  TRUE,
  TRUE
),
(
  'Chef de Projet Marketing',
  'MTN Congo',
  'Brazzaville, Congo',
  'Responsable du développement et de la mise en œuvre des stratégies marketing. Expérience en télécommunications souhaitée.',
  'https://example.com/job/4',
  '600 000 - 900 000 FCFA',
  'CDI',
  'Marketing',
  'OrientationPro',
  TRUE,
  FALSE
),
(
  'Infirmier(e)',
  'Hôpital de Brazzaville',
  'Brazzaville, Congo',
  'Infirmier(e) diplômé(e) d\'état pour rejoindre notre équipe de soins. Expérience en milieu hospitalier requise.',
  'https://example.com/job/5',
  '300 000 - 450 000 FCFA',
  'CDI',
  'Santé',
  'OrientationPro',
  TRUE,
  FALSE
),
(
  'Professeur de Mathématiques',
  'Lycée Victor Hugo',
  'Brazzaville, Congo',
  'Enseignant de mathématiques pour les classes de terminale. Maîtrise des programmes scolaires congolais requise.',
  'https://example.com/job/6',
  '250 000 - 350 000 FCFA',
  'CDI',
  'Éducation',
  'OrientationPro',
  TRUE,
  FALSE
),
(
  'Stagiaire Développeur Web',
  'TechStart Congo',
  'Brazzaville, Congo',
  'Stage de 6 mois pour un étudiant en informatique. Participation au développement d\'applications web modernes.',
  'https://example.com/job/7',
  '150 000 FCFA',
  'Stage',
  'Informatique',
  'OrientationPro',
  TRUE,
  FALSE
),
(
  'Commercial B2B',
  'SODEC Congo',
  'Dolisie, Congo',
  'Commercial expérimenté pour développer le portefeuille clients B2B. Excellentes compétences relationnelles requises.',
  'https://example.com/job/8',
  '350 000 - 500 000 FCFA',
  'CDI',
  'Commerce',
  'OrientationPro',
  TRUE,
  FALSE
);

-- Création d'une vue pour les offres actives
CREATE OR REPLACE VIEW active_jobs AS
SELECT 
  id,
  title,
  company,
  location,
  description,
  url,
  salary,
  type,
  category,
  source,
  publishedDate,
  requirements,
  benefits,
  views,
  applications,
  isVerified,
  isFeatured,
  createdAt,
  updatedAt
FROM jobs 
WHERE isActive = TRUE 
  AND (expiresAt IS NULL OR expiresAt > NOW())
ORDER BY isFeatured DESC, publishedDate DESC;

-- Création d'une vue pour les statistiques
CREATE OR REPLACE VIEW job_statistics AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN isActive = TRUE THEN 1 END) as active_jobs,
  COUNT(CASE WHEN isFeatured = TRUE THEN 1 END) as featured_jobs,
  COUNT(CASE WHEN isVerified = TRUE THEN 1 END) as verified_jobs,
  COUNT(DISTINCT category) as categories_count,
  COUNT(DISTINCT company) as companies_count,
  COUNT(DISTINCT source) as sources_count,
  AVG(views) as avg_views,
  AVG(applications) as avg_applications
FROM jobs;
