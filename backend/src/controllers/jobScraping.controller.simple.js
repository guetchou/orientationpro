const { pool } = require('../config/database');

/**
 * Contrôleur simplifié pour la gestion des offres d'emploi
 * Utilise mysql2 directement pour éviter les problèmes de dépendances
 */
class JobScrapingController {
  
  /**
   * Obtenir toutes les offres d'emploi actives
   */
  async getAllJobs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        location,
        type,
        keywords,
        featured,
        verified
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Construction de la requête SQL
      let whereConditions = ['isActive = TRUE'];
      let params = [];
      let paramIndex = 1;

      if (category && category !== 'all') {
        whereConditions.push(`category = ?`);
        params.push(category);
      }

      if (location) {
        whereConditions.push(`location LIKE ?`);
        params.push(`%${location}%`);
      }

      if (type && type !== 'all') {
        whereConditions.push(`type = ?`);
        params.push(type);
      }

      if (keywords) {
        whereConditions.push(`(title LIKE ? OR description LIKE ? OR company LIKE ?)`);
        const keywordParam = `%${keywords}%`;
        params.push(keywordParam, keywordParam, keywordParam);
      }

      if (featured === 'true') {
        whereConditions.push('isFeatured = TRUE');
      }

      if (verified === 'true') {
        whereConditions.push('isVerified = TRUE');
      }

      const whereClause = whereConditions.join(' AND ');
      
      // Requête pour compter le total
      const countQuery = `SELECT COUNT(*) as total FROM jobs WHERE ${whereClause}`;
      const [countResult] = await pool.execute(countQuery, params);
      const totalJobs = countResult[0].total;

      // Requête pour récupérer les offres
      const jobsQuery = `
        SELECT 
          id, title, company, location, description, url, 
          salary, type, category, source, publishedDate, 
          requirements, benefits, views, applications, 
          isVerified, isFeatured, createdAt, updatedAt
        FROM jobs 
        WHERE ${whereClause}
        ORDER BY isFeatured DESC, publishedDate DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      const [jobs] = await pool.execute(jobsQuery, params);

      const totalPages = Math.ceil(totalJobs / limit);

      res.json({
        success: true,
        data: {
          jobs: jobs.map(job => ({
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            benefits: job.benefits ? JSON.parse(job.benefits) : []
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalJobs,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des offres d\'emploi'
      });
    }
  }

  /**
   * Obtenir une offre d'emploi par ID
   */
  async getJobById(req, res) {
    try {
      const { id } = req.params;

      const [jobs] = await pool.execute(
        'SELECT * FROM jobs WHERE id = ? AND isActive = TRUE',
        [id]
      );

      if (jobs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Offre d\'emploi non trouvée'
        });
      }

      const job = jobs[0];
      
      // Incrémenter le compteur de vues
      await pool.execute(
        'UPDATE jobs SET views = views + 1 WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: { 
          job: {
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            benefits: job.benefits ? JSON.parse(job.benefits) : []
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'offre:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'offre d\'emploi'
      });
    }
  }

  /**
   * Obtenir les offres d'emploi en vedette
   */
  async getFeaturedJobs(req, res) {
    try {
      const { limit = 10 } = req.query;

      const [jobs] = await pool.execute(
        `SELECT 
          id, title, company, location, description, url, 
          salary, type, category, source, publishedDate, 
          requirements, benefits, views, applications, 
          isVerified, isFeatured
        FROM jobs 
        WHERE isActive = TRUE AND isFeatured = TRUE
        ORDER BY publishedDate DESC
        LIMIT ?`,
        [parseInt(limit)]
      );

      res.json({
        success: true,
        data: { 
          jobs: jobs.map(job => ({
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            benefits: job.benefits ? JSON.parse(job.benefits) : []
          }))
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offres en vedette:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des offres en vedette'
      });
    }
  }

  /**
   * Obtenir les statistiques des offres d'emploi
   */
  async getJobStatistics(req, res) {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as totalJobs,
          COUNT(CASE WHEN isActive = TRUE THEN 1 END) as activeJobs,
          COUNT(CASE WHEN isFeatured = TRUE THEN 1 END) as featuredJobs,
          COUNT(CASE WHEN isVerified = TRUE THEN 1 END) as verifiedJobs,
          COUNT(CASE WHEN publishedDate >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recentJobs
        FROM jobs
      `);

      const [categories] = await pool.execute(`
        SELECT category, COUNT(*) as count 
        FROM jobs 
        WHERE isActive = TRUE 
        GROUP BY category 
        ORDER BY count DESC
      `);

      const [companies] = await pool.execute(`
        SELECT company, COUNT(*) as count 
        FROM jobs 
        WHERE isActive = TRUE 
        GROUP BY company 
        ORDER BY count DESC 
        LIMIT 10
      `);

      const [sources] = await pool.execute(`
        SELECT source, COUNT(*) as count 
        FROM jobs 
        WHERE isActive = TRUE 
        GROUP BY source 
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: {
          overview: stats[0],
          categories,
          topCompanies: companies,
          sources,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * Obtenir les catégories disponibles
   */
  async getCategories(req, res) {
    try {
      const [categories] = await pool.execute(`
        SELECT category, COUNT(*) as count 
        FROM jobs 
        WHERE isActive = TRUE 
        GROUP BY category 
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des catégories'
      });
    }
  }

  /**
   * Rechercher des offres d'emploi
   */
  async searchJobs(req, res) {
    try {
      const {
        q: query,
        category,
        location,
        type,
        page = 1,
        limit = 20
      } = req.body;

      const offset = (page - 1) * limit;
      
      let whereConditions = ['isActive = TRUE'];
      let params = [];

      if (query) {
        whereConditions.push('(title LIKE ? OR description LIKE ? OR company LIKE ? OR requirements LIKE ?)');
        const queryParam = `%${query}%`;
        params.push(queryParam, queryParam, queryParam, queryParam);
      }

      if (category) {
        whereConditions.push('category = ?');
        params.push(category);
      }

      if (location) {
        whereConditions.push('location LIKE ?');
        params.push(`%${location}%`);
      }

      if (type) {
        whereConditions.push('type = ?');
        params.push(type);
      }

      const whereClause = whereConditions.join(' AND ');

      // Compter le total
      const countQuery = `SELECT COUNT(*) as total FROM jobs WHERE ${whereClause}`;
      const [countResult] = await pool.execute(countQuery, params);
      const totalJobs = countResult[0].total;

      // Récupérer les offres
      const jobsQuery = `
        SELECT 
          id, title, company, location, description, url, 
          salary, type, category, source, publishedDate, 
          requirements, benefits, views, applications, 
          isVerified, isFeatured
        FROM jobs 
        WHERE ${whereClause}
        ORDER BY isFeatured DESC, isVerified DESC, publishedDate DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      const [jobs] = await pool.execute(jobsQuery, params);

      const totalPages = Math.ceil(totalJobs / limit);

      res.json({
        success: true,
        data: {
          jobs: jobs.map(job => ({
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            benefits: job.benefits ? JSON.parse(job.benefits) : []
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalJobs,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          filters: {
            query,
            category,
            location,
            type
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche d\'offres d\'emploi'
      });
    }
  }

  /**
   * Marquer une offre comme candidature
   */
  async incrementApplication(req, res) {
    try {
      const { id } = req.params;

      await pool.execute(
        'UPDATE jobs SET applications = applications + 1 WHERE id = ? AND isActive = TRUE',
        [id]
      );

      res.json({
        success: true,
        message: 'Candidature enregistrée'
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'enregistrement de la candidature'
      });
    }
  }

  /**
   * Déclencher manuellement le scraping (placeholder)
   */
  async triggerScraping(req, res) {
    try {
      res.json({
        success: true,
        message: 'Scraping des offres d\'emploi déclenché (mode simplifié)'
      });
    } catch (error) {
      console.error('Erreur lors du déclenchement du scraping:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du déclenchement du scraping'
      });
    }
  }
}

module.exports = new JobScrapingController();
