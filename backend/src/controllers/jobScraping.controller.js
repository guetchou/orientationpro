const { Job } = require('../models/job.model');
const jobScrapingService = require('../services/jobScrapingService');
const { Op } = require('sequelize');

/**
 * Contrôleur pour la gestion des offres d'emploi
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
        verified,
        sortBy = 'publishedDate',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { isActive: true };

      // Filtres
      if (category && category !== 'all') {
        whereClause.category = category;
      }

      if (location) {
        whereClause.location = {
          [Op.like]: `%${location}%`
        };
      }

      if (type && type !== 'all') {
        whereClause.type = type;
      }

      if (keywords) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${keywords}%` } },
          { description: { [Op.like]: `%${keywords}%` } },
          { company: { [Op.like]: `%${keywords}%` } }
        ];
      }

      if (featured === 'true') {
        whereClause.isFeatured = true;
      }

      if (verified === 'true') {
        whereClause.isVerified = true;
      }

      // Tri
      const orderClause = [[sortBy, sortOrder.toUpperCase()]];
      if (sortBy !== 'isFeatured') {
        orderClause.unshift(['isFeatured', 'DESC']);
      }

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereClause,
        order: orderClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'title', 'company', 'location', 'description', 'url', 
          'salary', 'type', 'category', 'source', 'publishedDate', 
          'requirements', 'benefits', 'views', 'applications', 
          'isVerified', 'isFeatured'
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalJobs: count,
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

      const job = await Job.findOne({
        where: { id, isActive: true },
        attributes: [
          'id', 'title', 'company', 'location', 'description', 'url', 
          'salary', 'type', 'category', 'source', 'publishedDate', 
          'requirements', 'benefits', 'views', 'applications', 
          'isVerified', 'isFeatured', 'scrapedAt'
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Offre d\'emploi non trouvée'
        });
      }

      // Incrémenter le compteur de vues
      await job.increment('views');

      res.json({
        success: true,
        data: { job }
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
   * Rechercher des offres d'emploi
   */
  async searchJobs(req, res) {
    try {
      const {
        q: query,
        category,
        location,
        type,
        minSalary,
        maxSalary,
        experience,
        page = 1,
        limit = 20
      } = req.body;

      const offset = (page - 1) * limit;
      const whereClause = { isActive: true };

      // Recherche textuelle
      if (query) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { company: { [Op.like]: `%${query}%` } },
          { requirements: { [Op.like]: `%${query}%` } }
        ];
      }

      // Filtres
      if (category) {
        whereClause.category = category;
      }

      if (location) {
        whereClause.location = {
          [Op.like]: `%${location}%`
        };
      }

      if (type) {
        whereClause.type = type;
      }

      // Filtre par salaire (si disponible)
      if (minSalary || maxSalary) {
        whereClause.salary = {
          [Op.ne]: null
        };
      }

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereClause,
        order: [
          ['isFeatured', 'DESC'],
          ['isVerified', 'DESC'],
          ['publishedDate', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Filtrage par salaire côté application (car les données sont en texte)
      let filteredJobs = jobs;
      if (minSalary || maxSalary) {
        filteredJobs = jobs.filter(job => {
          if (!job.salary) return false;
          
          const salaryMatch = job.salary.match(/(\d+)/g);
          if (!salaryMatch) return false;
          
          const salary = parseInt(salaryMatch[0]);
          const min = minSalary ? parseInt(minSalary) : 0;
          const max = maxSalary ? parseInt(maxSalary) : Infinity;
          
          return salary >= min && salary <= max;
        });
      }

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          jobs: filteredJobs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalJobs: filteredJobs.length,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          filters: {
            query,
            category,
            location,
            type,
            minSalary,
            maxSalary,
            experience
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
   * Obtenir les offres d'emploi en vedette
   */
  async getFeaturedJobs(req, res) {
    try {
      const { limit = 10 } = req.query;

      const jobs = await Job.findAll({
        where: { 
          isActive: true,
          isFeatured: true
        },
        order: [['publishedDate', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: { jobs }
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
      const [
        totalJobs,
        activeJobs,
        featuredJobs,
        verifiedJobs,
        categories,
        companies,
        sources,
        recentJobs
      ] = await Promise.all([
        Job.count(),
        Job.count({ where: { isActive: true } }),
        Job.count({ where: { isFeatured: true } }),
        Job.count({ where: { isVerified: true } }),
        Job.findAll({
          attributes: [
            'category',
            [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
          ],
          group: ['category'],
          order: [[Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'DESC']]
        }),
        Job.findAll({
          attributes: [
            'company',
            [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
          ],
          group: ['company'],
          order: [[Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'DESC']],
          limit: 10
        }),
        Job.findAll({
          attributes: [
            'source',
            [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
          ],
          group: ['source'],
          order: [[Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'DESC']]
        }),
        Job.count({
          where: {
            publishedDate: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalJobs,
            activeJobs,
            featuredJobs,
            verifiedJobs,
            recentJobs
          },
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
      const categories = await Job.findAll({
        attributes: [
          'category',
          [Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['category'],
        order: [[Job.sequelize.fn('COUNT', Job.sequelize.col('id')), 'DESC']]
      });

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
   * Déclencher manuellement le scraping
   */
  async triggerScraping(req, res) {
    try {
      // Démarrer le scraping en arrière-plan
      jobScrapingService.scrapeAllSources().catch(console.error);

      res.json({
        success: true,
        message: 'Scraping des offres d\'emploi démarré'
      });
    } catch (error) {
      console.error('Erreur lors du déclenchement du scraping:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du déclenchement du scraping'
      });
    }
  }

  /**
   * Marquer une offre comme candidature
   */
  async incrementApplication(req, res) {
    try {
      const { id } = req.params;

      const job = await Job.findOne({
        where: { id, isActive: true }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Offre d\'emploi non trouvée'
        });
      }

      await job.increment('applications');

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
}

module.exports = new JobScrapingController();
