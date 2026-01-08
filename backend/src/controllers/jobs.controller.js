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
    console.log('✅ Pool de connexions MySQL initialisé pour Jobs');
  }
  return pool;
};

// Obtenir toutes les offres d'emploi avec pagination et filtres
const getJobs = async (req, res) => {
  try {
    const db = initPool();
    const { 
      page = 1, 
      limit = 20, 
      status, 
      department, 
      employment_type,
      remote_type,
      experience_level,
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

    if (department) {
      whereConditions.push('department = ?');
      queryParams.push(department);
    }

    if (employment_type) {
      whereConditions.push('employment_type = ?');
      queryParams.push(employment_type);
    }

    if (remote_type) {
      whereConditions.push('remote_type = ?');
      queryParams.push(remote_type);
    }

    if (experience_level) {
      whereConditions.push('experience_level = ?');
      queryParams.push(experience_level);
    }

    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ? OR requirements LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Requête principale
    const query = `
      SELECT 
        j.*,
        COUNT(a.id) as applications_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      ${whereClause}
      GROUP BY j.id
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);

    const [jobs] = await db.execute(query, queryParams);

    // Requête pour le total
    const countQuery = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
    const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2));

    // Parser les champs JSON
    const parsedJobs = jobs.map(job => ({
      ...job,
      required_skills: job.required_skills ? JSON.parse(job.required_skills) : [],
      preferred_skills: job.preferred_skills ? JSON.parse(job.preferred_skills) : [],
      language_requirements: job.language_requirements ? JSON.parse(job.language_requirements) : []
    }));

    res.json({
      success: true,
      data: parsedJobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des offres',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir une offre d'emploi par ID
const getJobById = async (req, res) => {
  try {
    const db = initPool();
    const { id } = req.params;

    const query = `
      SELECT 
        j.*,
        COUNT(a.id) as applications_count,
        COUNT(CASE WHEN a.status = 'hired' THEN 1 END) as hired_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.id = ?
      GROUP BY j.id
    `;

    const [jobs] = await db.execute(query, [id]);

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    const job = jobs[0];

    // Parser les champs JSON
    job.required_skills = job.required_skills ? JSON.parse(job.required_skills) : [];
    job.preferred_skills = job.preferred_skills ? JSON.parse(job.preferred_skills) : [];
    job.language_requirements = job.language_requirements ? JSON.parse(job.language_requirements) : [];

    // Récupérer les candidatures pour cette offre
    const applicationsQuery = `
      SELECT 
        a.*,
        c.full_name,
        c.email,
        c.phone,
        c.rating
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [applications] = await db.execute(applicationsQuery, [id]);

    // Mettre à jour le compteur de vues
    const updateViewsQuery = 'UPDATE jobs SET views_count = views_count + 1 WHERE id = ?';
    await db.execute(updateViewsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...job,
        applications
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'offre',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Créer une nouvelle offre d'emploi
const createJob = async (req, res) => {
  try {
    const db = initPool();
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      salary_min,
      salary_max,
      salary_currency = 'XAF',
      employment_type = 'full_time',
      remote_type = 'on_site',
      location,
      department,
      experience_level = 'mid',
      required_skills = [],
      preferred_skills = [],
      education_requirements,
      language_requirements = [],
      priority = 'medium',
      application_deadline,
      posted_by = 1 // Default admin user
    } = req.body;

    // Validation des champs requis
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Le titre et la description sont obligatoires'
      });
    }

    const query = `
      INSERT INTO jobs (
        title, description, requirements, responsibilities, benefits,
        salary_min, salary_max, salary_currency, employment_type, remote_type,
        location, department, experience_level, required_skills, preferred_skills,
        education_requirements, language_requirements, priority, application_deadline, posted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title, description, requirements, responsibilities, benefits,
      salary_min, salary_max, salary_currency, employment_type, remote_type,
      location, department, experience_level, 
      JSON.stringify(required_skills), JSON.stringify(preferred_skills),
      education_requirements, JSON.stringify(language_requirements), 
      priority, application_deadline, posted_by
    ];

    const [result] = await db.execute(query, values);

    // Log de l'activité
    const logQuery = `
      INSERT INTO activity_logs (entity_type, entity_id, action, description, performed_by)
      VALUES ('job', ?, 'created', 'Nouvelle offre d\'emploi créée', 'system')
    `;
    await db.execute(logQuery, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Offre d\'emploi créée avec succès',
      data: {
        id: result.insertId,
        title,
        status: 'draft'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'offre',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mettre à jour une offre d'emploi
const updateJob = async (req, res) => {
  try {
    const db = initPool();
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si l'offre existe
    const checkQuery = 'SELECT * FROM jobs WHERE id = ?';
    const [existingJob] = await db.execute(checkQuery, [id]);

    if (existingJob.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    // Construire la requête de mise à jour dynamiquement
    const allowedFields = [
      'title', 'description', 'requirements', 'responsibilities', 'benefits',
      'salary_min', 'salary_max', 'salary_currency', 'employment_type', 'remote_type',
      'location', 'department', 'experience_level', 'required_skills', 'preferred_skills',
      'education_requirements', 'language_requirements', 'status', 'priority', 'application_deadline'
    ];

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        
        // Stringify JSON fields
        if (['required_skills', 'preferred_skills', 'language_requirements'].includes(key)) {
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
      UPDATE jobs 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.execute(updateQuery, updateValues);

    // Log de l'activité
    const logQuery = `
      INSERT INTO activity_logs (entity_type, entity_id, action, description, old_values, new_values, performed_by)
      VALUES ('job', ?, 'updated', 'Offre d\'emploi mise à jour', ?, ?, 'system')
    `;
    await db.execute(logQuery, [
      id, 
      JSON.stringify(existingJob[0]), 
      JSON.stringify(updateData)
    ]);

    res.json({
      success: true,
      message: 'Offre d\'emploi mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'offre',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Supprimer une offre d'emploi
const deleteJob = async (req, res) => {
  try {
    const db = initPool();
    const { id } = req.params;

    // Vérifier si l'offre existe
    const checkQuery = 'SELECT title FROM jobs WHERE id = ?';
    const [existingJob] = await db.execute(checkQuery, [id]);

    if (existingJob.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    // Supprimer l'offre (CASCADE supprimera automatiquement les candidatures liées)
    const deleteQuery = 'DELETE FROM jobs WHERE id = ?';
    await db.execute(deleteQuery, [id]);

    // Log de l'activité
    const logQuery = `
      INSERT INTO activity_logs (entity_type, entity_id, action, description, performed_by)
      VALUES ('job', ?, 'deleted', 'Offre d\'emploi supprimée', 'system')
    `;
    await db.execute(logQuery, [id]);

    res.json({
      success: true,
      message: `Offre "${existingJob[0].title}" supprimée avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'offre',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir les statistiques des offres d'emploi
const getJobsStats = async (req, res) => {
  try {
    const db = initPool();

    // Statistiques par statut
    const statusStatsQuery = `
      SELECT status, COUNT(*) as count
      FROM jobs
      GROUP BY status
      ORDER BY count DESC
    `;
    const [statusStats] = await db.execute(statusStatsQuery);

    // Statistiques par département
    const departmentStatsQuery = `
      SELECT department, COUNT(*) as count
      FROM jobs
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
    `;
    const [departmentStats] = await db.execute(departmentStatsQuery);

    // Statistiques par type d'emploi
    const employmentTypeQuery = `
      SELECT employment_type, COUNT(*) as count
      FROM jobs
      GROUP BY employment_type
      ORDER BY count DESC
    `;
    const [employmentTypeStats] = await db.execute(employmentTypeQuery);

    // Statistiques temporelles (derniers 30 jours)
    const timeStatsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM jobs
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    const [timeStats] = await db.execute(timeStatsQuery);

    // Statistiques générales
    const generalStatsQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_jobs,
        SUM(applications_count) as total_applications,
        AVG(applications_count) as avg_applications_per_job,
        SUM(views_count) as total_views,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as jobs_this_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as jobs_this_month
      FROM jobs
    `;
    const [generalStats] = await db.execute(generalStatsQuery);

    res.json({
      success: true,
      data: {
        general: generalStats[0],
        byStatus: statusStats,
        byDepartment: departmentStats,
        byEmploymentType: employmentTypeStats,
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
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsStats
};