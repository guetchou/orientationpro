const { pool } = require('../config/database');

// Créer une nouvelle offre d'emploi
const createJobPosting = async (req, res) => {
  try {
    const {
      company_id,
      title,
      description,
      requirements,
      responsibilities,
      location,
      employment_type,
      experience_level,
      salary_min,
      salary_max,
      currency,
      benefits,
      skills_required,
      skills_preferred,
      education_level,
      languages,
      remote_allowed,
      urgent,
      featured,
      application_deadline,
      created_by
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO job_postings (
        company_id, title, description, requirements, responsibilities,
        location, employment_type, experience_level, salary_min, salary_max,
        currency, benefits, skills_required, skills_preferred, education_level,
        languages, remote_allowed, urgent, featured, application_deadline, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      company_id, title, description, requirements, responsibilities,
      location, employment_type, experience_level, salary_min, salary_max,
      currency || 'FCFA', JSON.stringify(benefits), JSON.stringify(skills_required),
      JSON.stringify(skills_preferred), education_level, JSON.stringify(languages),
      remote_allowed, urgent, featured, application_deadline, created_by
    ]);

    res.json({
      success: true,
      message: 'Offre d\'emploi créée avec succès',
      job_id: result.insertId
    });

  } catch (error) {
    console.error('Erreur création offre d\'emploi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'offre d\'emploi'
    });
  }
};

// Obtenir toutes les offres d'emploi avec filtres
const getJobPostings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'published',
      location,
      employment_type,
      experience_level,
      industry,
      search,
      featured,
      urgent,
      company_id
    } = req.query;

    let query = `
      SELECT 
        jp.*,
        c.name as company_name,
        c.logo_url as company_logo,
        c.industry as company_industry,
        c.is_verified as company_verified,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      LEFT JOIN users u ON jp.created_by = u.id
      WHERE jp.status = ?
    `;

    const params = [status];

    if (location) {
      query += ' AND jp.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (employment_type) {
      query += ' AND jp.employment_type = ?';
      params.push(employment_type);
    }

    if (experience_level) {
      query += ' AND jp.experience_level = ?';
      params.push(experience_level);
    }

    if (industry) {
      query += ' AND c.industry = ?';
      params.push(industry);
    }

    if (search) {
      query += ' AND (jp.title LIKE ? OR jp.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
      query += ' AND jp.featured = true';
    }

    if (urgent === 'true') {
      query += ' AND jp.urgent = true';
    }

    if (company_id) {
      query += ' AND jp.company_id = ?';
      params.push(company_id);
    }

    query += ' ORDER BY jp.featured DESC, jp.urgent DESC, jp.created_at DESC';

    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [jobs] = await pool.query(query, params);

    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.status = ?
    `;
    const countParams = [status];

    if (location) {
      countQuery += ' AND jp.location LIKE ?';
      countParams.push(`%${location}%`);
    }
    if (employment_type) {
      countQuery += ' AND jp.employment_type = ?';
      countParams.push(employment_type);
    }
    if (experience_level) {
      countQuery += ' AND jp.experience_level = ?';
      countParams.push(experience_level);
    }
    if (industry) {
      countQuery += ' AND c.industry = ?';
      countParams.push(industry);
    }
    if (search) {
      countQuery += ' AND (jp.title LIKE ? OR jp.description LIKE ? OR c.name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    const parseJsonField = (field) => {
      if (!field) return [];
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Erreur parsing JSON:', field, error.message);
        return [];
      }
    };

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        ...job,
        benefits: parseJsonField(job.benefits),
        skills_required: parseJsonField(job.skills_required),
        skills_preferred: parseJsonField(job.skills_preferred),
        languages: parseJsonField(job.languages)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération offres d\'emploi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres d\'emploi'
    });
  }
};

// Obtenir une offre d'emploi par ID
const getJobPostingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await pool.query(`
      SELECT 
        jp.*,
        c.name as company_name,
        c.description as company_description,
        c.logo_url as company_logo,
        c.industry as company_industry,
        c.website as company_website,
        c.address as company_address,
        c.city as company_city,
        c.is_verified as company_verified,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      LEFT JOIN users u ON jp.created_by = u.id
      WHERE jp.id = ?
    `, [id]);

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    const job = jobs[0];

    // Incrémenter le compteur de vues
    await pool.query(`
      UPDATE job_postings SET views_count = views_count + 1 WHERE id = ?
    `, [id]);

    const parseJsonField = (field) => {
      if (!field) return [];
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Erreur parsing JSON:', field, error.message);
        return [];
      }
    };

    res.json({
      success: true,
      job: {
        ...job,
        benefits: parseJsonField(job.benefits),
        skills_required: parseJsonField(job.skills_required),
        skills_preferred: parseJsonField(job.skills_preferred),
        languages: parseJsonField(job.languages)
      }
    });

  } catch (error) {
    console.error('Erreur récupération offre d\'emploi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'offre d\'emploi'
    });
  }
};

// Mettre à jour une offre d'emploi
const updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Construire dynamiquement la requête de mise à jour
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        
        // Traitement spécial pour les champs JSON
        if (['benefits', 'skills_required', 'skills_preferred', 'languages'].includes(key)) {
          values.push(JSON.stringify(updateData[key]));
        } else {
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(id);

    await pool.query(`
      UPDATE job_postings 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Offre d\'emploi mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour offre d\'emploi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'offre d\'emploi'
    });
  }
};

// Supprimer une offre d'emploi
const deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM job_postings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Offre d\'emploi supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression offre d\'emploi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'offre d\'emploi'
    });
  }
};

// Publier une offre d'emploi
const publishJobPosting = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`
      UPDATE job_postings 
      SET status = 'published', updated_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Offre d\'emploi publiée avec succès'
    });

  } catch (error) {
    console.error('Erreur publication offre d\'emploi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication de l\'offre d\'emploi'
    });
  }
};

// Obtenir les statistiques des offres d'emploi
const getJobStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_jobs,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_jobs,
        COUNT(CASE WHEN urgent = true THEN 1 END) as urgent_jobs,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_jobs,
        AVG(views_count) as avg_views,
        SUM(applications_count) as total_applications
      FROM job_postings
    `);

    const [industryStats] = await pool.query(`
      SELECT 
        c.industry,
        COUNT(jp.id) as job_count
      FROM job_postings jp
      LEFT JOIN companies c ON jp.company_id = c.id
      WHERE jp.status = 'published' AND c.industry IS NOT NULL
      GROUP BY c.industry
      ORDER BY job_count DESC
      LIMIT 10
    `);

    const [locationStats] = await pool.query(`
      SELECT 
        location,
        COUNT(*) as job_count
      FROM job_postings
      WHERE status = 'published' AND location IS NOT NULL
      GROUP BY location
      ORDER BY job_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        ...stats[0],
        industry_breakdown: industryStats,
        location_breakdown: locationStats
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  publishJobPosting,
  getJobStats
};
