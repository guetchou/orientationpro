const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3310,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'orientationpro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialiser le pool de connexions
const initPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Pool de connexions MySQL initialisé pour ATS');
  }
  return pool;
};

// Obtenir tous les candidats avec pagination et filtres
const getCandidates = async (req, res) => {
  try {
    const db = initPool();
    const { 
      page = 1, 
      limit = 20, 
      status, 
      position, 
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    // Construire les conditions WHERE
    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    if (position) {
      whereConditions.push('position LIKE ?');
      queryParams.push(`%${position}%`);
    }

    if (search) {
      whereConditions.push('(full_name LIKE ? OR email LIKE ? OR position LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Requête principale
    const query = `
      SELECT 
        id, full_name, email, phone, position, experience_years, 
        education_level, location, salary_expectation, availability,
        status, source, rating, skills, languages, certifications,
        created_at, updated_at
      FROM candidates 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);

    const [candidates] = await db.execute(query, queryParams);

    // Requête pour le total
    const countQuery = `SELECT COUNT(*) as total FROM candidates ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2));

    // Parser les champs JSON
    const parsedCandidates = candidates.map(candidate => ({
      ...candidate,
      skills: candidate.skills ? JSON.parse(candidate.skills) : [],
      languages: candidate.languages ? JSON.parse(candidate.languages) : [],
      certifications: candidate.certifications ? JSON.parse(candidate.certifications) : []
    }));

    res.json({
      success: true,
      data: parsedCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des candidats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des candidats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir un candidat par ID
const getCandidateById = async (req, res) => {
  try {
    const db = initPool();
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        COUNT(a.id) as applications_count,
        AVG(ca.score) as avg_assessment_score
      FROM candidates c
      LEFT JOIN applications a ON c.id = a.candidate_id
      LEFT JOIN candidate_assessments ca ON c.id = ca.candidate_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const [candidates] = await db.execute(query, [id]);

    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    const candidate = candidates[0];

    // Parser les champs JSON
    candidate.skills = candidate.skills ? JSON.parse(candidate.skills) : [];
    candidate.languages = candidate.languages ? JSON.parse(candidate.languages) : [];
    candidate.certifications = candidate.certifications ? JSON.parse(candidate.certifications) : [];
    candidate.social_profiles = candidate.social_profiles ? JSON.parse(candidate.social_profiles) : {};

    // Récupérer les candidatures du candidat
    const applicationsQuery = `
      SELECT a.*, j.title as job_title, j.department
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.candidate_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [applications] = await db.execute(applicationsQuery, [id]);

    // Récupérer les évaluations du candidat
    const assessmentsQuery = `
      SELECT * FROM candidate_assessments
      WHERE candidate_id = ?
      ORDER BY assessment_date DESC
    `;
    const [assessments] = await db.execute(assessmentsQuery, [id]);

    // Récupérer les documents du candidat
    const documentsQuery = `
      SELECT * FROM candidate_documents
      WHERE candidate_id = ? AND is_active = TRUE
      ORDER BY uploaded_at DESC
    `;
    const [documents] = await db.execute(documentsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...candidate,
        applications,
        assessments,
        documents
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du candidat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du candidat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Créer un nouveau candidat
const createCandidate = async (req, res) => {
  try {
    const db = initPool();
    const {
      full_name,
      email,
      phone,
      position,
      experience_years = 0,
      education_level,
      location,
      salary_expectation,
      availability = 'negotiable',
      source = 'website',
      skills = [],
      languages = [],
      certifications = [],
      social_profiles = {},
      notes
    } = req.body;

    // Validation des champs requis
    if (!full_name || !email || !position) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom complet, email et poste sont obligatoires'
      });
    }

    // Vérifier si l'email existe déjà
    const checkEmailQuery = 'SELECT id FROM candidates WHERE email = ?';
    const [existingCandidate] = await db.execute(checkEmailQuery, [email]);

    if (existingCandidate.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Un candidat avec cet email existe déjà'
      });
    }

    const query = `
      INSERT INTO candidates (
        full_name, email, phone, position, experience_years,
        education_level, location, salary_expectation, availability,
        source, skills, languages, certifications, social_profiles, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      full_name,
      email,
      phone,
      position,
      experience_years,
      education_level,
      location,
      salary_expectation,
      availability,
      source,
      JSON.stringify(skills),
      JSON.stringify(languages),
      JSON.stringify(certifications),
      JSON.stringify(social_profiles),
      notes
    ];

    const [result] = await db.execute(query, values);

    // Log de l'activité
    const logQuery = `
      INSERT INTO activity_logs (entity_type, entity_id, action, description, performed_by)
      VALUES ('candidate', ?, 'created', 'Nouveau candidat créé', 'system')
    `;
    await db.execute(logQuery, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Candidat créé avec succès',
      data: {
        id: result.insertId,
        full_name,
        email,
        position,
        status: 'new'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du candidat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du candidat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mettre à jour un candidat
const updateCandidate = async (req, res) => {
  try {
    const db = initPool();
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si le candidat existe
    const checkQuery = 'SELECT * FROM candidates WHERE id = ?';
    const [existingCandidate] = await db.execute(checkQuery, [id]);

    if (existingCandidate.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    // Construire la requête de mise à jour dynamiquement
    const allowedFields = [
      'full_name', 'email', 'phone', 'position', 'experience_years',
      'education_level', 'location', 'salary_expectation', 'availability',
      'status', 'rating', 'skills', 'languages', 'certifications',
      'social_profiles', 'notes'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        
        // Stringify JSON fields
        if (['skills', 'languages', 'certifications', 'social_profiles'].includes(key)) {
          updateValues.push(JSON.stringify(updateData[key]));
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ valide à mettre à jour'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const updateQuery = `
      UPDATE candidates 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.execute(updateQuery, updateValues);

    // Log de l'activité
    const logQuery = `
      INSERT INTO activity_logs (entity_type, entity_id, action, description, old_values, new_values, performed_by)
      VALUES ('candidate', ?, 'updated', 'Candidat mis à jour', ?, ?, 'system')
    `;
    await db.execute(logQuery, [
      id, 
      JSON.stringify(existingCandidate[0]), 
      JSON.stringify(updateData)
    ]);

    res.json({
      success: true,
      message: 'Candidat mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du candidat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du candidat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Supprimer un candidat
const deleteCandidate = async (req, res) => {
  try {
    const db = initPool();
    const { id } = req.params;

    // Vérifier si le candidat existe
    const checkQuery = 'SELECT full_name FROM candidates WHERE id = ?';
    const [existingCandidate] = await db.execute(checkQuery, [id]);

    if (existingCandidate.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidat non trouvé'
      });
    }

    // Supprimer le candidat (CASCADE supprimera automatiquement les données liées)
    const deleteQuery = 'DELETE FROM candidates WHERE id = ?';
    await db.execute(deleteQuery, [id]);

    // Log de l'activité
    const logQuery = `
      INSERT INTO activity_logs (entity_type, entity_id, action, description, performed_by)
      VALUES ('candidate', ?, 'deleted', 'Candidat supprimé', 'system')
    `;
    await db.execute(logQuery, [id]);

    res.json({
      success: true,
      message: `Candidat ${existingCandidate[0].full_name} supprimé avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du candidat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du candidat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir les statistiques des candidats
const getCandidatesStats = async (req, res) => {
  try {
    const db = initPool();

    // Statistiques par statut
    const statusStatsQuery = `
      SELECT status, COUNT(*) as count
      FROM candidates
      GROUP BY status
      ORDER BY count DESC
    `;
    const [statusStats] = await db.execute(statusStatsQuery);

    // Statistiques par source
    const sourceStatsQuery = `
      SELECT source, COUNT(*) as count
      FROM candidates
      GROUP BY source
      ORDER BY count DESC
    `;
    const [sourceStats] = await db.execute(sourceStatsQuery);

    // Statistiques temporelles (derniers 30 jours)
    const timeStatsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM candidates
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    const [timeStats] = await db.execute(timeStatsQuery);

    // Statistiques générales
    const generalStatsQuery = `
      SELECT 
        COUNT(*) as total_candidates,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_candidates,
        COUNT(CASE WHEN status = 'hired' THEN 1 END) as hired_candidates,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as candidates_this_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as candidates_this_month
      FROM candidates
    `;
    const [generalStats] = await db.execute(generalStatsQuery);

    res.json({
      success: true,
      data: {
        general: generalStats[0],
        byStatus: statusStats,
        bySource: sourceStats,
        timeline: timeStats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidatesStats
};