const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { Job } = require('../models/job.model');

/**
 * Service de récupération automatique des offres d'emploi
 * Sources principales pour le Congo :
 * - Indeed Congo
 * - Emploi.cg
 * - Jobartis Congo
 * - LinkedIn Jobs Congo
 * - Sites d'entreprises locales
 */
class JobScrapingService {
  constructor() {
    this.jobSources = [
      {
        name: 'Indeed Congo',
        url: 'https://cg.indeed.com/jobs?q=&l=Brazzaville',
        selector: '.job_seen_beacon',
        enabled: true
      },
      {
        name: 'Emploi.cg',
        url: 'https://emploi.cg/offres-emploi',
        selector: '.job-listing',
        enabled: true
      },
      {
        name: 'Jobartis Congo',
        url: 'https://www.jobartis.cg/offres-emploi',
        selector: '.offer-item',
        enabled: true
      }
    ];
    
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ];
  }

  /**
   * Démarrer le scraping automatique
   */
  startAutomaticScraping() {
    // Scraping toutes les 6 heures
    cron.schedule('0 */6 * * *', () => {
      console.log('🔄 Début du scraping automatique des offres d\'emploi...');
      this.scrapeAllSources();
    });

    // Scraping initial au démarrage
    console.log('🚀 Initialisation du scraping des offres d\'emploi...');
    this.scrapeAllSources();
  }

  /**
   * Scraper toutes les sources configurées
   */
  async scrapeAllSources() {
    const results = [];
    
    for (const source of this.jobSources) {
      if (!source.enabled) continue;
      
      try {
        console.log(`📡 Scraping ${source.name}...`);
        const jobs = await this.scrapeSource(source);
        results.push(...jobs);
        console.log(`✅ ${source.name}: ${jobs.length} offres trouvées`);
      } catch (error) {
        console.error(`❌ Erreur lors du scraping de ${source.name}:`, error.message);
      }
    }

    // Sauvegarder en base de données
    await this.saveJobsToDatabase(results);
    console.log(`💾 ${results.length} offres sauvegardées en base de données`);
  }

  /**
   * Scraper une source spécifique
   */
  async scrapeSource(source) {
    try {
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $(source.selector).each((index, element) => {
        try {
          const job = this.extractJobData($, element, source.name);
          if (job && this.validateJob(job)) {
            jobs.push(job);
          }
        } catch (error) {
          console.error('Erreur lors de l\'extraction d\'une offre:', error.message);
        }
      });

      return jobs;
    } catch (error) {
      throw new Error(`Impossible de scraper ${source.name}: ${error.message}`);
    }
  }

  /**
   * Extraire les données d'une offre d'emploi
   */
  extractJobData($, element, sourceName) {
    const $element = $(element);
    
    // Extraction des données communes
    let title = '';
    let company = '';
    let location = '';
    let description = '';
    let url = '';
    let salary = '';
    let type = 'CDI'; // Par défaut
    let publishedDate = new Date();

    // Extraction selon la source
    switch (sourceName) {
      case 'Indeed Congo':
        title = $element.find('.jobTitle a').text().trim() || 
                $element.find('h2 a').text().trim();
        company = $element.find('.companyName').text().trim() ||
                  $element.find('[data-testid="company-name"]').text().trim();
        location = $element.find('.companyLocation').text().trim() ||
                   $element.find('[data-testid="job-location"]').text().trim();
        description = $element.find('.job-snippet').text().trim() ||
                      $element.find('.summary').text().trim();
        url = $element.find('.jobTitle a').attr('href') ||
              $element.find('h2 a').attr('href');
        salary = $element.find('.salary-snippet').text().trim() ||
                 $element.find('[data-testid="attribute_snippet_testid"]').text().trim();
        
        if (url && !url.startsWith('http')) {
          url = 'https://cg.indeed.com' + url;
        }
        break;

      case 'Emploi.cg':
        title = $element.find('.job-title').text().trim() ||
                $element.find('h3').text().trim();
        company = $element.find('.company-name').text().trim() ||
                  $element.find('.employer').text().trim();
        location = $element.find('.location').text().trim() ||
                   $element.find('.job-location').text().trim();
        description = $element.find('.job-description').text().trim() ||
                      $element.find('.summary').text().trim();
        url = $element.find('a').first().attr('href');
        salary = $element.find('.salary').text().trim();
        
        if (url && !url.startsWith('http')) {
          url = 'https://emploi.cg' + url;
        }
        break;

      case 'Jobartis Congo':
        title = $element.find('.offer-title').text().trim() ||
                $element.find('.title').text().trim();
        company = $element.find('.company').text().trim() ||
                  $element.find('.employer-name').text().trim();
        location = $element.find('.location').text().trim();
        description = $element.find('.description').text().trim() ||
                      $element.find('.summary').text().trim();
        url = $element.find('a').first().attr('href');
        salary = $element.find('.salary-info').text().trim();
        
        if (url && !url.startsWith('http')) {
          url = 'https://www.jobartis.cg' + url;
        }
        break;
    }

    // Nettoyage et validation des données
    return {
      title: this.cleanText(title),
      company: this.cleanText(company),
      location: this.cleanLocation(location),
      description: this.cleanText(description),
      url: url,
      salary: this.cleanText(salary),
      type: this.detectJobType(title, description),
      source: sourceName,
      publishedDate: publishedDate,
      scrapedAt: new Date(),
      isActive: true,
      category: this.categorizeJob(title, description),
      requirements: this.extractRequirements(description),
      benefits: this.extractBenefits(description)
    };
  }

  /**
   * Nettoyer le texte extrait
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?()]/g, '')
      .trim();
  }

  /**
   * Nettoyer et standardiser la localisation
   */
  cleanLocation(location) {
    if (!location) return 'Brazzaville, Congo';
    
    const cleaned = this.cleanText(location);
    
    // Standardiser les villes du Congo
    const cityMappings = {
      'brazzaville': 'Brazzaville',
      'pointe-noire': 'Pointe-Noire',
      'dolisie': 'Dolisie',
      'owando': 'Owando',
      'kinkala': 'Kinkala'
    };

    const lowerLocation = cleaned.toLowerCase();
    for (const [key, value] of Object.entries(cityMappings)) {
      if (lowerLocation.includes(key)) {
        return `${value}, Congo`;
      }
    }

    return cleaned.includes('Congo') ? cleaned : `${cleaned}, Congo`;
  }

  /**
   * Détecter le type d'emploi
   */
  detectJobType(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('stage') || text.includes('stagiaire')) return 'Stage';
    if (text.includes('freelance') || text.includes('indépendant')) return 'Freelance';
    if (text.includes('temps partiel') || text.includes('mi-temps')) return 'Temps partiel';
    if (text.includes('cdd') || text.includes('contrat à durée déterminée')) return 'CDD';
    if (text.includes('interim') || text.includes('intérimaire')) return 'Intérim';
    
    return 'CDI';
  }

  /**
   * Catégoriser l'emploi
   */
  categorizeJob(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    const categories = {
      'Informatique': ['développeur', 'programmeur', 'analyste', 'ingénieur informatique', 'web', 'software', 'it'],
      'Finance': ['comptable', 'finance', 'audit', 'gestion', 'trésorier', 'banque'],
      'Marketing': ['marketing', 'communication', 'publicité', 'promotion', 'vente'],
      'Ressources Humaines': ['rh', 'recrutement', 'gestion du personnel', 'formation'],
      'Santé': ['médecin', 'infirmier', 'pharmacien', 'santé', 'médical'],
      'Éducation': ['professeur', 'enseignant', 'éducateur', 'formation', 'pédagogie'],
      'Ingénierie': ['ingénieur', 'technique', 'mécanique', 'électrique', 'civil'],
      'Commerce': ['commercial', 'vendeur', 'gestionnaire', 'directeur commercial'],
      'Administration': ['administrateur', 'secrétaire', 'assistant', 'gestionnaire'],
      'Logistique': ['logistique', 'transport', 'stock', 'approvisionnement']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'Autre';
  }

  /**
   * Extraire les exigences du poste
   */
  extractRequirements(description) {
    if (!description) return [];
    
    const requirements = [];
    const text = description.toLowerCase();
    
    // Diplômes
    if (text.includes('bac+2') || text.includes('bts')) requirements.push('Bac+2');
    if (text.includes('bac+3') || text.includes('licence')) requirements.push('Bac+3');
    if (text.includes('bac+5') || text.includes('master')) requirements.push('Bac+5');
    if (text.includes('doctorat') || text.includes('phd')) requirements.push('Doctorat');
    
    // Expérience
    if (text.includes('débutant') || text.includes('junior')) requirements.push('Débutant accepté');
    if (text.includes('2 ans') || text.includes('2ans')) requirements.push('2 ans d\'expérience');
    if (text.includes('3 ans') || text.includes('3ans')) requirements.push('3 ans d\'expérience');
    if (text.includes('5 ans') || text.includes('5ans')) requirements.push('5 ans d\'expérience');
    
    // Compétences
    if (text.includes('anglais')) requirements.push('Anglais requis');
    if (text.includes('excel') || text.includes('office')) requirements.push('Maîtrise Office');
    if (text.includes('permis')) requirements.push('Permis de conduire');
    
    return requirements;
  }

  /**
   * Extraire les avantages
   */
  extractBenefits(description) {
    if (!description) return [];
    
    const benefits = [];
    const text = description.toLowerCase();
    
    if (text.includes('mutuelle') || text.includes('assurance')) benefits.push('Mutuelle santé');
    if (text.includes('transport') || text.includes('navette')) benefits.push('Transport');
    if (text.includes('restauration') || text.includes('cantine')) benefits.push('Restauration');
    if (text.includes('formation') || text.includes('évolution')) benefits.push('Formation continue');
    if (text.includes('télétravail') || text.includes('remote')) benefits.push('Télétravail possible');
    
    return benefits;
  }

  /**
   * Valider une offre d'emploi
   */
  validateJob(job) {
    return (
      job.title &&
      job.title.length > 5 &&
      job.company &&
      job.company.length > 2 &&
      job.location &&
      job.url &&
      job.url.startsWith('http')
    );
  }

  /**
   * Sauvegarder les offres en base de données
   */
  async saveJobsToDatabase(jobs) {
    try {
      for (const jobData of jobs) {
        // Vérifier si l'offre existe déjà
        const existingJob = await Job.findOne({
          where: {
            title: jobData.title,
            company: jobData.company,
            url: jobData.url
          }
        });

        if (!existingJob) {
          await Job.create(jobData);
        } else {
          // Mettre à jour l'offre existante
          await existingJob.update({
            ...jobData,
            id: existingJob.id // Conserver l'ID existant
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  /**
   * Obtenir un User-Agent aléatoire
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Obtenir les offres récentes
   */
  async getRecentJobs(limit = 50) {
    try {
      return await Job.findAll({
        where: { isActive: true },
        order: [['publishedDate', 'DESC']],
        limit: limit
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      return [];
    }
  }

  /**
   * Rechercher des offres par critères
   */
  async searchJobs(criteria) {
    try {
      const whereClause = { isActive: true };
      
      if (criteria.category) {
        whereClause.category = criteria.category;
      }
      
      if (criteria.location) {
        whereClause.location = {
          [Op.like]: `%${criteria.location}%`
        };
      }
      
      if (criteria.keywords) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${criteria.keywords}%` } },
          { description: { [Op.like]: `%${criteria.keywords}%` } }
        ];
      }

      return await Job.findAll({
        where: whereClause,
        order: [['publishedDate', 'DESC']],
        limit: criteria.limit || 20
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }
}

module.exports = new JobScrapingService();
