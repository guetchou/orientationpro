const { pool } = require('../config/database');

// Postuler à une offre d'emploi
const applyToJob = async (req, res) => {
  try {
    const {
      job_posting_id,
      candidate_id,
      cover_letter,
      expected_salary,
      availability_date,
      source = 'website'
    } = req.body;

    // Vérifier si le candidat n'a pas déjà postulé
    const [existingApplication] = await pool.query(`
      SELECT id FROM job_applications 
      WHERE job_posting_id = ? AND candidate_id = ?
    `, [job_posting_id, candidate_id]);

    if (existingApplication.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà postulé à cette offre d\'emploi'
      });
    }

    // Vérifier que l'offre d'emploi est publiée
    const [jobCheck] = await pool.query(`
      SELECT id, status FROM job_postings WHERE id = ?
    `, [job_posting_id]);

    if (jobCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    if (jobCheck[0].status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cette offre d\'emploi n\'est pas disponible'
      });
    }

    // Créer la candidature
    const [result] = await pool.query(`
      INSERT INTO job_applications (
        job_posting_id, candidate_id, cover_letter, 
        expected_salary, availability_date, source
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [job_posting_id, candidate_id, cover_letter, expected_salary, availability_date, source]);

    // Incrémenter le compteur de candidatures
    await pool.query(`
      UPDATE job_postings 
      SET applications_count = applications_count + 1 
      WHERE id = ?
    `, [job_posting_id]);

    // Déclencher le matching automatique si possible
    try {
      const { matchCandidateToJob } = require('./matching.controller');
      await matchCandidateToJob(candidate_id, job_posting_id);
    } catch (matchingError) {
      console.log('Matching automatique non disponible:', matchingError.message);
    }

    res.json({
      success: true,
      message: 'Candidature envoyée avec succès',
      application_id: result.insertId
    });

  } catch (error) {
    console.error('Erreur candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la candidature'
    });
  }
};

// Obtenir les candidatures d'un candidat
const getCandidateApplications = async (req, res) => {
  try {
    const { candidate_id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT 
        ja.*,
        jp.title as job_title,
        jp.location as job_location,
        jp.employment_type,
        jp.experience_level,
        jp.salary_min,
        jp.salary_max,
        jp.currency,
        jp.status as job_status,
        jp.application_deadline,
        c.name as company_name,
        c.logo_url as company_logo,
        c.is_verified as company_verified,
        jm.match_score,
        jm.is_auto_matched
      FROM job_applications ja
      LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
      LEFT JOIN companies c ON jp.company_id = c.id
      LEFT JOIN job_matching jm ON ja.job_posting_id = jm.job_posting_id AND ja.candidate_id = jm.candidate_id
      WHERE ja.candidate_id = ?
    `;

    const params = [candidate_id];

    if (status) {
      query += ' AND ja.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ja.applied_at DESC';

    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [applications] = await pool.query(query, params);

    res.json({
      success: true,
      applications: applications.map(app => ({
        ...app,
        job_title: app.job_title,
        company_name: app.company_name,
        match_score: app.match_score || 0,
        is_auto_matched: app.is_auto_matched || false
      }))
    });

  } catch (error) {
    console.error('Erreur récupération candidatures candidat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures'
    });
  }
};

// Obtenir les candidatures pour une offre d'emploi (recruteur)
const getJobApplications = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { status, page = 1, limit = 20, sort_by = 'applied_at', sort_order = 'DESC' } = req.query;

    let query = `
      SELECT 
        ja.*,
        u.first_name as candidate_first_name,
        u.last_name as candidate_last_name,
        u.email as candidate_email,
        u.phone as candidate_phone,
        ca.ats_score,
        ca.completeness_score,
        ca.relevance_score,
        jm.match_score,
        jm.skills_match,
        jm.experience_match,
        jm.education_match,
        jm.is_auto_matched
      FROM job_applications ja
      LEFT JOIN users u ON ja.candidate_id = u.id
      LEFT JOIN cv_analysis ca ON ja.cv_analysis_id = ca.id
      LEFT JOIN job_matching jm ON ja.job_posting_id = jm.job_posting_id AND ja.candidate_id = jm.candidate_id
      WHERE ja.job_posting_id = ?
    `;

    const params = [job_id];

    if (status) {
      query += ' AND ja.status = ?';
      params.push(status);
    }

    // Tri
    const validSortFields = ['applied_at', 'match_score', 'ats_score', 'rating'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'applied_at';
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortField} ${order}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [applications] = await pool.query(query, params);

    res.json({
      success: true,
      applications: applications.map(app => ({
        ...app,
        match_score: app.match_score || 0,
        ats_score: app.ats_score || 0,
        is_auto_matched: app.is_auto_matched || false
      }))
    });

  } catch (error) {
    console.error('Erreur récupération candidatures offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures'
    });
  }
};

// Mettre à jour le statut d'une candidature
const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { status, notes, rating, feedback } = req.body;

    const updateFields = ['status = ?'];
    const params = [status];

    if (notes) {
      updateFields.push('notes = ?');
      params.push(notes);
    }

    if (rating) {
      updateFields.push('rating = ?');
      params.push(rating);
    }

    if (feedback) {
      updateFields.push('feedback = ?');
      params.push(feedback);
    }

    params.push(application_id);

    await pool.query(`
      UPDATE job_applications 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'Statut de la candidature mis à jour'
    });

  } catch (error) {
    console.error('Erreur mise à jour statut candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// Obtenir les statistiques des candidatures
const getApplicationStats = async (req, res) => {
  try {
    const { company_id, job_id } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (company_id) {
      whereClause += ' AND jp.company_id = ?';
      params.push(company_id);
    }

    if (job_id) {
      whereClause += ' AND ja.job_posting_id = ?';
      params.push(job_id);
    }

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN ja.status = 'applied' THEN 1 END) as applied_count,
        COUNT(CASE WHEN ja.status = 'reviewed' THEN 1 END) as reviewed_count,
        COUNT(CASE WHEN ja.status = 'shortlisted' THEN 1 END) as shortlisted_count,
        COUNT(CASE WHEN ja.status = 'interview_scheduled' THEN 1 END) as interview_scheduled_count,
        COUNT(CASE WHEN ja.status = 'interviewed' THEN 1 END) as interviewed_count,
        COUNT(CASE WHEN ja.status = 'offered' THEN 1 END) as offered_count,
        COUNT(CASE WHEN ja.status = 'hired' THEN 1 END) as hired_count,
        COUNT(CASE WHEN ja.status = 'rejected' THEN 1 END) as rejected_count,
        AVG(ja.rating) as avg_rating,
        AVG(jm.match_score) as avg_match_score
      FROM job_applications ja
      LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
      LEFT JOIN job_matching jm ON ja.job_posting_id = jm.job_posting_id AND ja.candidate_id = jm.candidate_id
      WHERE ${whereClause}
    `, params);

    const [recentApplications] = await pool.query(`
      SELECT 
        ja.id,
        ja.applied_at,
        ja.status,
        jp.title as job_title,
        u.first_name,
        u.last_name,
        jm.match_score
      FROM job_applications ja
      LEFT JOIN job_postings jp ON ja.job_posting_id = jp.id
      LEFT JOIN users u ON ja.candidate_id = u.id
      LEFT JOIN job_matching jm ON ja.job_posting_id = jm.job_posting_id AND ja.candidate_id = jm.candidate_id
      WHERE ${whereClause}
      ORDER BY ja.applied_at DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      stats: {
        ...stats[0],
        recent_applications: recentApplications
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  applyToJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationStats
};
