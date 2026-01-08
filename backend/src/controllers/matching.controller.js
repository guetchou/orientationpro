const { pool } = require('../config/database');

// Fonction utilitaire pour calculer la similarité entre deux chaînes
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Calculer la similarité entre deux listes de compétences
const calculateSkillsSimilarity = (skills1, skills2) => {
  if (!skills1 || !skills2 || skills1.length === 0 || skills2.length === 0) {
    return 0;
  }

  let matches = 0;
  const maxLength = Math.max(skills1.length, skills2.length);

  for (const skill1 of skills1) {
    for (const skill2 of skills2) {
      const distance = levenshteinDistance(skill1.toLowerCase(), skill2.toLowerCase());
      const similarity = 1 - (distance / Math.max(skill1.length, skill2.length));
      
      if (similarity > 0.8) { // Seuil de similarité de 80%
        matches++;
        break;
      }
    }
  }

  return (matches / maxLength) * 100;
};

// Matcher un candidat à une offre d'emploi
const matchCandidateToJob = async (candidateId, jobId) => {
  try {
    // Récupérer les informations du candidat et de l'offre
    const [candidateData] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        ca.skills,
        ca.experience,
        ca.education,
        ca.ats_score,
        ca.completeness_score,
        ca.relevance_score
      FROM users u
      LEFT JOIN cv_analysis ca ON u.id = ca.user_id
      WHERE u.id = ?
      ORDER BY ca.analyzed_at DESC
      LIMIT 1
    `, [candidateId]);

    const [jobData] = await pool.query(`
      SELECT 
        jp.*,
        c.name as company_name,
        c.location as company_location
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.id = ?
    `, [jobId]);

    if (candidateData.length === 0 || jobData.length === 0) {
      throw new Error('Candidat ou offre d\'emploi non trouvé');
    }

    const candidate = candidateData[0];
    const job = jobData[0];

    // Calculer les scores de matching
    const matchingScores = await calculateMatchingScores(candidate, job);

    // Insérer ou mettre à jour le matching
    await pool.query(`
      INSERT INTO job_matching (
        job_posting_id, candidate_id, cv_analysis_id, match_score,
        skills_match, experience_match, education_match, location_match,
        salary_match, language_match, ats_score, matching_criteria,
        recommendations, is_auto_matched
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        match_score = VALUES(match_score),
        skills_match = VALUES(skills_match),
        experience_match = VALUES(experience_match),
        education_match = VALUES(education_match),
        location_match = VALUES(location_match),
        salary_match = VALUES(salary_match),
        language_match = VALUES(language_match),
        ats_score = VALUES(ats_score),
        matching_criteria = VALUES(matching_criteria),
        recommendations = VALUES(recommendations),
        updated_at = NOW()
    `, [
      jobId,
      candidateId,
      null, // cv_analysis_id sera mis à jour si disponible
      matchingScores.overall,
      matchingScores.skills,
      matchingScores.experience,
      matchingScores.education,
      matchingScores.location,
      matchingScores.salary,
      matchingScores.language,
      candidate.ats_score || 0,
      JSON.stringify(matchingScores.criteria),
      matchingScores.recommendations,
      true
    ]);

    return matchingScores;

  } catch (error) {
    console.error('Erreur matching candidat-offre:', error);
    throw error;
  }
};

// Calculer les scores de matching détaillés
const calculateMatchingScores = async (candidate, job) => {
  const scores = {
    skills: 0,
    experience: 0,
    education: 0,
    location: 0,
    salary: 0,
    language: 0,
    overall: 0,
    criteria: {},
    recommendations: []
  };

  // 1. Matching des compétences (40% du score total)
  const candidateSkills = candidate.skills ? JSON.parse(candidate.skills) : {};
  const requiredSkills = job.skills_required ? JSON.parse(job.skills_required) : [];
  const preferredSkills = job.skills_preferred ? JSON.parse(job.skills_preferred) : [];

  const technicalSkills = candidateSkills.technical || [];
  const softSkills = candidateSkills.soft || [];

  const requiredMatch = calculateSkillsSimilarity(technicalSkills, requiredSkills);
  const preferredMatch = calculateSkillsSimilarity(technicalSkills, preferredSkills);

  scores.skills = (requiredMatch * 0.7) + (preferredMatch * 0.3);
  scores.criteria.skills = {
    required_match: requiredMatch,
    preferred_match: preferredMatch,
    technical_skills: technicalSkills.length,
    soft_skills: softSkills.length
  };

  if (scores.skills < 50) {
    scores.recommendations.push('Améliorer les compétences techniques requises');
  }

  // 2. Matching de l'expérience (25% du score total)
  const candidateExperience = candidate.experience ? JSON.parse(candidate.experience) : [];
  const jobExperienceLevel = job.experience_level;

  const experienceMapping = {
    'entry': 0,
    'junior': 1,
    'mid': 2,
    'senior': 3,
    'lead': 4,
    'executive': 5
  };

  const candidateLevel = Math.min(candidateExperience.length, 5); // Max 5 ans = senior
  const requiredLevel = experienceMapping[jobExperienceLevel] || 2;

  if (candidateLevel >= requiredLevel) {
    scores.experience = Math.min(100, (candidateLevel / requiredLevel) * 100);
  } else {
    scores.experience = Math.max(0, (candidateLevel / requiredLevel) * 100);
  }

  scores.criteria.experience = {
    candidate_years: candidateLevel,
    required_level: requiredLevel,
    job_level: jobExperienceLevel
  };

  if (scores.experience < 60) {
    scores.recommendations.push('Acquérir plus d\'expérience dans le domaine');
  }

  // 3. Matching de l'éducation (15% du score total)
  const candidateEducation = candidate.education ? JSON.parse(candidate.education) : [];
  const jobEducationLevel = job.education_level;

  const educationMapping = {
    'no_degree': 0,
    'high_school': 1,
    'bachelor': 2,
    'master': 3,
    'phd': 4
  };

  const candidateEducationLevel = candidateEducation.length > 0 ? 2 : 0; // Simplification
  const requiredEducationLevel = educationMapping[jobEducationLevel] || 2;

  if (candidateEducationLevel >= requiredEducationLevel) {
    scores.education = 100;
  } else {
    scores.education = Math.max(0, (candidateEducationLevel / requiredEducationLevel) * 100);
  }

  scores.criteria.education = {
    candidate_level: candidateEducationLevel,
    required_level: requiredEducationLevel,
    job_level: jobEducationLevel
  };

  // 4. Matching de la localisation (10% du score total)
  if (job.remote_allowed) {
    scores.location = 100;
  } else {
    // Simplification - on considère que le candidat est dans la même ville
    scores.location = 80;
  }

  scores.criteria.location = {
    job_location: job.location,
    remote_allowed: job.remote_allowed,
    match: job.remote_allowed ? 'remote_ok' : 'local'
  };

  // 5. Matching du salaire (5% du score total)
  if (job.salary_min && job.salary_max) {
    const avgSalary = (job.salary_min + job.salary_max) / 2;
    // Simplification - on considère que le candidat accepte le salaire
    scores.salary = 90;
  } else {
    scores.salary = 100; // Pas de contrainte salariale
  }

  scores.criteria.salary = {
    job_min: job.salary_min,
    job_max: job.salary_max,
    match: 'acceptable'
  };

  // 6. Matching des langues (5% du score total)
  const jobLanguages = job.languages ? JSON.parse(job.languages) : [];
  if (jobLanguages.length === 0) {
    scores.language = 100;
  } else {
    // Simplification - on considère que le candidat parle français
    scores.language = jobLanguages.includes('Français') ? 100 : 70;
  }

  scores.criteria.language = {
    job_languages: jobLanguages,
    match: 'french_ok'
  };

  // Calcul du score global pondéré
  scores.overall = Math.round(
    (scores.skills * 0.4) +
    (scores.experience * 0.25) +
    (scores.education * 0.15) +
    (scores.location * 0.1) +
    (scores.salary * 0.05) +
    (scores.language * 0.05)
  );

  // Ajouter des recommandations générales
  if (scores.overall >= 80) {
    scores.recommendations.push('Excellent match ! Candidature recommandée');
  } else if (scores.overall >= 60) {
    scores.recommendations.push('Bon match avec quelques améliorations possibles');
  } else {
    scores.recommendations.push('Match faible - améliorations importantes nécessaires');
  }

  return scores;
};

// Trouver les meilleurs candidats pour une offre d'emploi
const findBestCandidates = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { limit = 10, min_score = 60 } = req.query;

    const [candidates] = await pool.query(`
      SELECT 
        jm.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        ca.ats_score,
        ca.completeness_score,
        ca.relevance_score,
        ca.skills,
        ca.experience,
        ca.education
      FROM job_matching jm
      LEFT JOIN users u ON jm.candidate_id = u.id
      LEFT JOIN cv_analysis ca ON jm.cv_analysis_id = ca.id
      WHERE jm.job_posting_id = ? 
        AND jm.match_score >= ?
        AND u.role = 'user'
      ORDER BY jm.match_score DESC, jm.created_at DESC
      LIMIT ?
    `, [job_id, min_score, limit]);

    res.json({
      success: true,
      candidates: candidates.map(candidate => ({
        ...candidate,
        matching_criteria: candidate.matching_criteria ? JSON.parse(candidate.matching_criteria) : {},
        skills: candidate.skills ? JSON.parse(candidate.skills) : {},
        experience: candidate.experience ? JSON.parse(candidate.experience) : [],
        education: candidate.education ? JSON.parse(candidate.education) : []
      }))
    });

  } catch (error) {
    console.error('Erreur recherche meilleurs candidats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des candidats'
    });
  }
};

// Trouver les meilleures offres pour un candidat
const findBestJobs = async (req, res) => {
  try {
    const { candidate_id } = req.params;
    const { limit = 10, min_score = 60 } = req.query;

    const [jobs] = await pool.query(`
      SELECT 
        jm.*,
        jp.title,
        jp.description,
        jp.location,
        jp.employment_type,
        jp.experience_level,
        jp.salary_min,
        jp.salary_max,
        jp.currency,
        jp.urgent,
        jp.featured,
        jp.created_at as job_created_at,
        c.name as company_name,
        c.logo_url as company_logo,
        c.is_verified as company_verified
      FROM job_matching jm
      LEFT JOIN job_postings jp ON jm.job_posting_id = jp.id
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jm.candidate_id = ? 
        AND jm.match_score >= ?
        AND jp.status = 'published'
      ORDER BY jm.match_score DESC, jp.featured DESC, jp.created_at DESC
      LIMIT ?
    `, [candidate_id, min_score, limit]);

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        ...job,
        matching_criteria: job.matching_criteria ? JSON.parse(job.matching_criteria) : {}
      }))
    });

  } catch (error) {
    console.error('Erreur recherche meilleures offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des offres'
    });
  }
};

// Déclencher le matching automatique pour tous les candidats
const triggerAutomaticMatching = async (req, res) => {
  try {
    const { job_id } = req.query;

    let whereClause = 'jp.status = "published"';
    const params = [];

    if (job_id) {
      whereClause += ' AND jp.id = ?';
      params.push(job_id);
    }

    // Récupérer toutes les offres d'emploi publiées
    const [jobs] = await pool.query(`
      SELECT id FROM job_postings jp WHERE ${whereClause}
    `, params);

    // Récupérer tous les candidats avec des CV analysés
    const [candidates] = await pool.query(`
      SELECT DISTINCT u.id 
      FROM users u
      LEFT JOIN cv_analysis ca ON u.id = ca.user_id
      WHERE u.role = 'user' AND ca.id IS NOT NULL
    `);

    let processed = 0;
    let errors = 0;

    for (const job of jobs) {
      for (const candidate of candidates) {
        try {
          await matchCandidateToJob(candidate.id, job.id);
          processed++;
        } catch (error) {
          console.error(`Erreur matching candidat ${candidate.id} - offre ${job.id}:`, error.message);
          errors++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Matching automatique terminé',
      processed,
      errors
    });

  } catch (error) {
    console.error('Erreur matching automatique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du matching automatique'
    });
  }
};

module.exports = {
  matchCandidateToJob,
  findBestCandidates,
  findBestJobs,
  triggerAutomaticMatching
};
