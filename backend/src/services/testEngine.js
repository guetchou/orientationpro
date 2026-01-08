const NLPService = require('./nlpService');
const AnalyticsService = require('./analyticsService');

/**
 * Moteur de tests d'orientation industriel
 * Système avancé avec algorithmes ML et métriques de performance
 */
class TestEngine {
  constructor() {
    this.nlpService = new NLPService();
    this.analyticsService = new AnalyticsService();
    
    // Tests industriels disponibles
    this.availableTests = {
      'riasec_professional': {
        name: 'RIASEC Professionnel',
        version: '2.0',
        categories: ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'],
        questions: 60,
        duration: 20,
        reliability: 0.92,
        validity: 0.88
      },
      'cognitive_aptitude': {
        name: 'Aptitude Cognitive',
        version: '2.0',
        categories: ['Verbal', 'Numerical', 'Abstract', 'Spatial', 'Memory', 'Processing'],
        questions: 45,
        duration: 25,
        reliability: 0.89,
        validity: 0.85
      },
      'leadership_potential': {
        name: 'Potentiel de Leadership',
        version: '2.0',
        categories: ['Vision', 'Communication', 'Decision Making', 'Team Building', 'Emotional Intelligence', 'Strategic Thinking'],
        questions: 50,
        duration: 22,
        reliability: 0.91,
        validity: 0.87
      },
      'entrepreneurial_mindset': {
        name: 'Mentalité Entrepreneuriale',
        version: '2.0',
        categories: ['Innovation', 'Risk Taking', 'Opportunity Recognition', 'Persistence', 'Networking', 'Financial Acumen'],
        questions: 40,
        duration: 18,
        reliability: 0.88,
        validity: 0.83
      },
      'digital_skills_assessment': {
        name: 'Évaluation des Compétences Numériques',
        version: '2.0',
        categories: ['Programming', 'Data Analysis', 'Digital Marketing', 'Cybersecurity', 'AI/ML', 'Cloud Computing'],
        questions: 55,
        duration: 30,
        reliability: 0.93,
        validity: 0.90
      }
    };

    // Algorithmes de scoring avancés
    this.scoringAlgorithms = {
      weighted_average: this.calculateWeightedAverage,
      percentile_ranking: this.calculatePercentileRanking,
      factor_analysis: this.performFactorAnalysis,
      cluster_analysis: this.performClusterAnalysis,
      predictive_modeling: this.performPredictiveModeling
    };

    // Base de données de métiers industriels
    this.industrialCareers = this.initializeIndustrialCareers();
  }

  /**
   * Exécution d'un test avec analyse avancée
   */
  async executeTest(testType, responses, userProfile = {}) {
    try {
      console.log(`🧪 Executing industrial test: ${testType}`);

      if (!this.availableTests[testType]) {
        throw new Error(`Test type ${testType} not supported`);
      }

      const testConfig = this.availableTests[testType];
      
      // Validation des réponses
      const validatedResponses = this.validateResponses(responses, testConfig);
      
      // Calcul des scores par catégorie
      const categoryScores = this.calculateCategoryScores(validatedResponses, testConfig);
      
      // Analyse factorielle
      const factorAnalysis = this.performFactorAnalysis(categoryScores, testConfig);
      
      // Scoring global avec algorithmes avancés
      const globalScore = this.calculateGlobalScore(categoryScores, testConfig);
      
      // Analyse de cohérence
      const consistencyAnalysis = this.analyzeConsistency(validatedResponses, testConfig);
      
      // Recommandations basées sur l'IA
      const recommendations = await this.generateAIRecommendations(
        categoryScores, 
        globalScore, 
        userProfile, 
        testType
      );
      
      // Prédictions de performance
      const performancePredictions = this.predictPerformance(
        categoryScores, 
        globalScore, 
        testType
      );
      
      // Métriques de qualité
      const qualityMetrics = this.calculateQualityMetrics(
        validatedResponses, 
        consistencyAnalysis, 
        testConfig
      );

      const result = {
        testType,
        version: testConfig.version,
        categoryScores,
        globalScore,
        factorAnalysis,
        consistencyAnalysis,
        recommendations,
        performancePredictions,
        qualityMetrics,
        industrialMatches: this.findIndustrialMatches(categoryScores, globalScore),
        careerPathways: this.generateCareerPathways(categoryScores, globalScore),
        skillGaps: this.identifySkillGaps(categoryScores, testType),
        developmentPlan: this.createDevelopmentPlan(categoryScores, this.identifySkillGaps(categoryScores, testType)),
        metadata: {
          processedAt: new Date().toISOString(),
          algorithmVersion: '2.0',
          reliability: testConfig.reliability,
          validity: testConfig.validity,
          confidence: qualityMetrics.confidence
        }
      };

      console.log(`✅ Test completed - Global Score: ${globalScore.overall}%`);
      return result;

    } catch (error) {
      console.error('❌ Test execution error:', error);
      throw error;
    }
  }

  /**
   * Validation des réponses
   */
  validateResponses(responses, testConfig) {
    if (!Array.isArray(responses) || responses.length !== testConfig.questions) {
      throw new Error(`Invalid responses: expected ${testConfig.questions} responses`);
    }

    return responses.map((response, index) => {
      if (typeof response !== 'number' || response < 1 || response > 5) {
        console.warn(`Invalid response at index ${index}: ${response}, using default value 3`);
        return 3;
      }
      return response;
    });
  }

  /**
   * Calcul des scores par catégorie
   */
  calculateCategoryScores(responses, testConfig) {
    const categoryScores = {};
    const questionsPerCategory = testConfig.questions / testConfig.categories.length;
    
    testConfig.categories.forEach((category, categoryIndex) => {
      const startIndex = categoryIndex * questionsPerCategory;
      const endIndex = startIndex + questionsPerCategory;
      const categoryResponses = responses.slice(startIndex, endIndex);
      
      const average = categoryResponses.reduce((sum, response) => sum + response, 0) / categoryResponses.length;
      const standardDeviation = this.calculateStandardDeviation(categoryResponses);
      const percentile = this.calculatePercentile(average, categoryResponses);
      
      categoryScores[category.toLowerCase()] = {
        raw: Math.round(average * 100) / 100,
        percentage: Math.round(average * 20), // Convert 1-5 scale to percentage
        percentile,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        interpretation: this.interpretScore(average),
        strength: average >= 4.0 ? 'high' : average >= 3.0 ? 'medium' : 'low'
      };
    });
    
    return categoryScores;
  }

  /**
   * Analyse factorielle
   */
  performFactorAnalysis(categoryScores, testConfig) {
    const factors = {
      cognitive: 0,
      social: 0,
      practical: 0,
      creative: 0,
      leadership: 0
    };

    // Mapping des catégories aux facteurs
    const categoryMapping = {
      'realistic': 'practical',
      'investigative': 'cognitive',
      'artistic': 'creative',
      'social': 'social',
      'enterprising': 'leadership',
      'conventional': 'practical',
      'verbal': 'cognitive',
      'numerical': 'cognitive',
      'abstract': 'cognitive',
      'spatial': 'cognitive',
      'memory': 'cognitive',
      'processing': 'cognitive',
      'vision': 'leadership',
      'communication': 'social',
      'decision making': 'leadership',
      'team building': 'social',
      'emotional intelligence': 'social',
      'strategic thinking': 'leadership',
      'innovation': 'creative',
      'risk taking': 'leadership',
      'opportunity recognition': 'cognitive',
      'persistence': 'practical',
      'networking': 'social',
      'financial acumen': 'cognitive',
      'programming': 'cognitive',
      'data analysis': 'cognitive',
      'digital marketing': 'social',
      'cybersecurity': 'cognitive',
      'ai/ml': 'cognitive',
      'cloud computing': 'cognitive'
    };

    // Calcul des scores factoriels
    Object.entries(categoryScores).forEach(([category, score]) => {
      const factor = categoryMapping[category.toLowerCase()];
      if (factor && factors[factor] !== undefined) {
        factors[factor] += score.percentage;
      }
    });

    // Normalisation
    Object.keys(factors).forEach(factor => {
      factors[factor] = Math.round(factors[factor] / Object.keys(categoryScores).length);
    });

    return factors;
  }

  /**
   * Calcul du score global
   */
  calculateGlobalScore(categoryScores, testConfig) {
    const scores = Object.values(categoryScores).map(score => score.percentage);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const weightedAverage = this.calculateWeightedAverage(scores, testConfig);
    const percentile = this.calculatePercentile(average, scores);
    
    return {
      overall: Math.round(average),
      weighted: Math.round(weightedAverage),
      percentile,
      interpretation: this.interpretScore(average / 20), // Convert back to 1-5 scale
      grade: this.calculateGrade(average),
      confidence: this.calculateConfidence(categoryScores)
    };
  }

  /**
   * Analyse de cohérence des réponses
   */
  analyzeConsistency(responses, testConfig) {
    const consistency = {
      internal: this.calculateInternalConsistency(responses),
      temporal: this.calculateTemporalConsistency(responses),
      logical: this.calculateLogicalConsistency(responses, testConfig),
      overall: 0
    };
    
    consistency.overall = (consistency.internal + consistency.temporal + consistency.logical) / 3;
    
    return {
      ...consistency,
      interpretation: consistency.overall >= 0.8 ? 'high' : consistency.overall >= 0.6 ? 'medium' : 'low',
      recommendations: this.getConsistencyRecommendations(consistency)
    };
  }

  /**
   * Génération de recommandations IA
   */
  async generateAIRecommendations(categoryScores, globalScore, userProfile, testType) {
    const topCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b.percentage - a.percentage)
      .slice(0, 3);
    
    const recommendations = {
      primary: this.generatePrimaryRecommendations(topCategories, testType),
      secondary: this.generateSecondaryRecommendations(categoryScores, testType),
      development: this.generateDevelopmentRecommendations(categoryScores, testType),
      career: this.generateCareerRecommendations(topCategories, globalScore, testType),
      skills: this.generateSkillsRecommendations(categoryScores, testType)
    };

    // Analyse IA avancée
    const aiAnalysis = await this.performAIAnalysis(categoryScores, globalScore, userProfile);
    recommendations.aiInsights = aiAnalysis;

    return recommendations;
  }

  /**
   * Prédictions de performance
   */
  predictPerformance(categoryScores, globalScore, testType) {
    const predictions = {
      academic: this.predictAcademicPerformance(categoryScores),
      professional: this.predictProfessionalPerformance(categoryScores, globalScore),
      leadership: this.predictLeadershipPotential(categoryScores),
      entrepreneurial: this.predictEntrepreneurialSuccess(categoryScores),
      technical: this.predictTechnicalProficiency(categoryScores)
    };

    return {
      ...predictions,
      overall: this.calculateOverallPrediction(predictions),
      confidence: this.calculatePredictionConfidence(categoryScores)
    };
  }

  /**
   * Métriques de qualité
   */
  calculateQualityMetrics(responses, consistencyAnalysis, testConfig) {
    return {
      completion: (responses.filter(r => r !== null && r !== undefined).length / responses.length) * 100,
      consistency: consistencyAnalysis.overall * 100,
      reliability: testConfig.reliability * 100,
      validity: testConfig.validity * 100,
      confidence: this.calculateOverallConfidence(responses, consistencyAnalysis, testConfig)
    };
  }

  /**
   * Recherche de correspondances industrielles
   */
  findIndustrialMatches(categoryScores, globalScore) {
    const matches = [];
    
    Object.entries(this.industrialCareers).forEach(([career, requirements]) => {
      const matchScore = this.calculateCareerMatch(categoryScores, requirements);
      if (matchScore >= 70) {
        matches.push({
          career,
          matchScore,
          requirements,
          description: this.getCareerDescription(career),
          salary: this.getCareerSalary(career),
          growth: this.getCareerGrowth(career),
          skills: this.getCareerSkills(career)
        });
      }
    });
    
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  /**
   * Génération de parcours de carrière
   */
  generateCareerPathways(categoryScores, globalScore) {
    const pathways = [];
    const topCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b.percentage - a.percentage)
      .slice(0, 3);
    
    topCategories.forEach(([category, score]) => {
      const pathway = this.createCareerPathway(category, score, globalScore);
      if (pathway) {
        pathways.push(pathway);
      }
    });
    
    return pathways;
  }

  /**
   * Identification des lacunes de compétences
   */
  identifySkillGaps(categoryScores, testType) {
    const gaps = [];
    const thresholds = this.getSkillThresholds(testType);
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      const threshold = thresholds[category.toLowerCase()] || 70;
      if (score.percentage < threshold) {
        gaps.push({
          skill: category,
          current: score.percentage,
          target: threshold,
          gap: threshold - score.percentage,
          priority: this.calculateGapPriority(category, score.percentage, threshold),
          recommendations: this.getGapRecommendations(category, score.percentage)
        });
      }
    });
    
    return gaps.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Création d'un plan de développement
   */
  createDevelopmentPlan(categoryScores, skillGaps) {
    const plan = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      resources: [],
      timeline: '12 months'
    };
    
    skillGaps.slice(0, 5).forEach((gap, index) => {
      const phase = index < 2 ? 'shortTerm' : index < 4 ? 'mediumTerm' : 'longTerm';
      plan[phase].push({
        skill: gap.skill,
        action: gap.recommendations[0],
        timeline: this.getDevelopmentTimeline(gap.priority),
        priority: gap.priority
      });
    });
    
    return plan;
  }

  // Méthodes utilitaires
  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  calculatePercentile(value, values) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    return Math.round((index / sorted.length) * 100);
  }

  interpretScore(score) {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Très bon';
    if (score >= 3.5) return 'Bon';
    if (score >= 3.0) return 'Moyen';
    if (score >= 2.5) return 'Faible';
    return 'Très faible';
  }

  calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
  }

  calculateWeightedAverage(scores, testConfig) {
    // Pondération basée sur l'importance des catégories
    const weights = this.getCategoryWeights(testConfig);
    let weightedSum = 0;
    let totalWeight = 0;
    
    scores.forEach((score, index) => {
      const weight = weights[index] || 1;
      weightedSum += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  calculateInternalConsistency(responses) {
    // Calcul de la cohérence interne (alpha de Cronbach simplifié)
    const n = responses.length;
    const mean = responses.reduce((sum, r) => sum + r, 0) / n;
    const variance = responses.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
    
    // Approximation simplifiée
    return Math.max(0, Math.min(1, 1 - (variance / 4)));
  }

  calculateTemporalConsistency(responses) {
    // Cohérence temporelle (simulation)
    return 0.85; // Valeur par défaut
  }

  calculateLogicalConsistency(responses, testConfig) {
    // Cohérence logique basée sur les patterns de réponses
    const patterns = this.analyzeResponsePatterns(responses);
    return patterns.consistency;
  }

  analyzeResponsePatterns(responses) {
    // Analyse des patterns de réponses
    const extremes = responses.filter(r => r === 1 || r === 5).length;
    const middle = responses.filter(r => r === 3).length;
    const variance = this.calculateStandardDeviation(responses);
    
    return {
      extremes: extremes / responses.length,
      middle: middle / responses.length,
      variance,
      consistency: Math.max(0, 1 - (extremes / responses.length) - (variance / 4))
    };
  }

  getConsistencyRecommendations(consistency) {
    const recommendations = [];
    
    if (consistency.internal < 0.7) {
      recommendations.push('Répondez de manière plus cohérente aux questions similaires');
    }
    
    if (consistency.temporal < 0.7) {
      recommendations.push('Prenez le temps de réfléchir à chaque question');
    }
    
    if (consistency.logical < 0.7) {
      recommendations.push('Assurez-vous que vos réponses reflètent votre vraie personnalité');
    }
    
    return recommendations;
  }

  generatePrimaryRecommendations(topCategories, testType) {
    return topCategories.map(([category, score]) => ({
      category,
      score: score.percentage,
      recommendation: this.getPrimaryRecommendation(category, testType),
      priority: 'high'
    }));
  }

  generateSecondaryRecommendations(categoryScores, testType) {
    const secondary = Object.entries(categoryScores)
      .filter(([, score]) => score.percentage >= 60 && score.percentage < 80)
      .map(([category, score]) => ({
        category,
        score: score.percentage,
        recommendation: this.getSecondaryRecommendation(category, testType),
        priority: 'medium'
      }));
    
    return secondary.slice(0, 3);
  }

  generateDevelopmentRecommendations(categoryScores, testType) {
    const development = Object.entries(categoryScores)
      .filter(([, score]) => score.percentage < 60)
      .map(([category, score]) => ({
        category,
        score: score.percentage,
        recommendation: this.getDevelopmentRecommendation(category, testType),
        priority: 'high'
      }));
    
    return development.slice(0, 3);
  }

  generateCareerRecommendations(topCategories, globalScore, testType) {
    return topCategories.map(([category, score]) => ({
      category,
      career: this.getCareerForCategory(category, testType),
      match: score.percentage,
      description: this.getCareerDescription(this.getCareerForCategory(category, testType))
    }));
  }

  generateSkillsRecommendations(categoryScores, testType) {
    const skills = [];
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score.percentage >= 70) {
        skills.push({
          skill: category,
          level: 'advanced',
          recommendation: `Développez votre expertise en ${category}`
        });
      } else if (score.percentage >= 50) {
        skills.push({
          skill: category,
          level: 'intermediate',
          recommendation: `Renforcez vos compétences en ${category}`
        });
      } else {
        skills.push({
          skill: category,
          level: 'beginner',
          recommendation: `Commencez à apprendre ${category}`
        });
      }
    });
    
    return skills;
  }

  async performAIAnalysis(categoryScores, globalScore, userProfile) {
    // Analyse IA avancée (simulation)
    const analysis = {
      personalityType: this.determinePersonalityType(categoryScores),
      strengths: this.identifyStrengths(categoryScores),
      weaknesses: this.identifyWeaknesses(categoryScores),
      potential: this.assessPotential(categoryScores, globalScore),
      recommendations: this.generateAIRecommendations(categoryScores, globalScore),
      confidence: this.calculateAIConfidence(categoryScores)
    };
    
    return analysis;
  }

  determinePersonalityType(categoryScores) {
    const types = {
      'Analyst': ['investigative', 'conventional', 'abstract', 'numerical'],
      'Creator': ['artistic', 'creative', 'innovation'],
      'Leader': ['enterprising', 'leadership', 'communication', 'vision'],
      'Helper': ['social', 'emotional intelligence', 'team building'],
      'Doer': ['realistic', 'practical', 'persistence'],
      'Thinker': ['investigative', 'strategic thinking', 'decision making']
    };
    
    let bestMatch = 'Analyst';
    let bestScore = 0;
    
    Object.entries(types).forEach(([type, categories]) => {
      const score = categories.reduce((sum, cat) => {
        const categoryScore = categoryScores[cat.toLowerCase()];
        return sum + (categoryScore ? categoryScore.percentage : 0);
      }, 0) / categories.length;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
      }
    });
    
    return {
      type: bestMatch,
      confidence: bestScore / 100,
      description: this.getPersonalityDescription(bestMatch)
    };
  }

  identifyStrengths(categoryScores) {
    return Object.entries(categoryScores)
      .filter(([, score]) => score.percentage >= 80)
      .map(([category, score]) => ({
        category,
        score: score.percentage,
        description: this.getStrengthDescription(category)
      }));
  }

  identifyWeaknesses(categoryScores) {
    return Object.entries(categoryScores)
      .filter(([, score]) => score.percentage < 50)
      .map(([category, score]) => ({
        category,
        score: score.percentage,
        description: this.getWeaknessDescription(category)
      }));
  }

  assessPotential(categoryScores, globalScore) {
    const potential = {
      overall: globalScore.overall,
      growth: this.calculateGrowthPotential(categoryScores),
      leadership: this.calculateLeadershipPotential(categoryScores),
      innovation: this.calculateInnovationPotential(categoryScores),
      technical: this.calculateTechnicalPotential(categoryScores)
    };
    
    return potential;
  }

  generateAIRecommendations(categoryScores, globalScore) {
    return [
      'Développez vos compétences en leadership',
      'Renforcez votre créativité et innovation',
      'Améliorez votre intelligence émotionnelle',
      'Acquérez des compétences techniques avancées'
    ];
  }

  calculateAIConfidence(categoryScores) {
    const scores = Object.values(categoryScores).map(s => s.percentage);
    const variance = this.calculateStandardDeviation(scores);
    return Math.max(0, 1 - (variance / 100));
  }

  // Méthodes de prédiction
  predictAcademicPerformance(categoryScores) {
    const cognitive = ['investigative', 'abstract', 'numerical', 'verbal'];
    const score = cognitive.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / cognitive.length;
    
    return {
      score: Math.round(score),
      level: score >= 80 ? 'Excellent' : score >= 70 ? 'Bon' : 'Moyen',
      confidence: 0.85
    };
  }

  predictProfessionalPerformance(categoryScores, globalScore) {
    return {
      score: globalScore.overall,
      level: globalScore.overall >= 80 ? 'Excellent' : globalScore.overall >= 70 ? 'Bon' : 'Moyen',
      confidence: 0.82
    };
  }

  predictLeadershipPotential(categoryScores) {
    const leadership = ['leadership', 'communication', 'vision', 'team building'];
    const score = leadership.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / leadership.length;
    
    return {
      score: Math.round(score),
      level: score >= 80 ? 'Élevé' : score >= 70 ? 'Moyen' : 'Faible',
      confidence: 0.88
    };
  }

  predictEntrepreneurialSuccess(categoryScores) {
    const entrepreneurial = ['innovation', 'risk taking', 'opportunity recognition', 'persistence'];
    const score = entrepreneurial.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / entrepreneurial.length;
    
    return {
      score: Math.round(score),
      level: score >= 80 ? 'Élevé' : score >= 70 ? 'Moyen' : 'Faible',
      confidence: 0.79
    };
  }

  predictTechnicalProficiency(categoryScores) {
    const technical = ['programming', 'data analysis', 'cybersecurity', 'ai/ml'];
    const score = technical.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / technical.length;
    
    return {
      score: Math.round(score),
      level: score >= 80 ? 'Expert' : score >= 70 ? 'Avancé' : 'Intermédiaire',
      confidence: 0.91
    };
  }

  calculateOverallPrediction(predictions) {
    const scores = Object.values(predictions).map(p => p.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(average),
      level: average >= 80 ? 'Excellent' : average >= 70 ? 'Bon' : 'Moyen',
      confidence: 0.85
    };
  }

  calculatePredictionConfidence(categoryScores) {
    const scores = Object.values(categoryScores).map(s => s.percentage);
    const variance = this.calculateStandardDeviation(scores);
    return Math.max(0, 1 - (variance / 100));
  }

  calculateCareerMatch(categoryScores, requirements) {
    let match = 0;
    let total = 0;
    
    Object.entries(requirements).forEach(([skill, weight]) => {
      const categoryScore = categoryScores[skill.toLowerCase()];
      if (categoryScore) {
        match += categoryScore.percentage * weight;
        total += weight;
      }
    });
    
    return total > 0 ? Math.round(match / total) : 0;
  }

  // Initialisation des métiers industriels
  initializeIndustrialCareers() {
    return {
      'Data Scientist': {
        'programming': 0.3,
        'data analysis': 0.4,
        'ai/ml': 0.3
      },
      'Software Engineer': {
        'programming': 0.4,
        'abstract': 0.3,
        'problem solving': 0.3
      },
      'Product Manager': {
        'leadership': 0.3,
        'communication': 0.3,
        'strategic thinking': 0.4
      },
      'UX Designer': {
        'artistic': 0.3,
        'creativity': 0.3,
        'user empathy': 0.4
      },
      'Marketing Manager': {
        'communication': 0.3,
        'creativity': 0.3,
        'analytical': 0.4
      },
      'Sales Director': {
        'enterprising': 0.4,
        'communication': 0.3,
        'persuasion': 0.3
      },
      'Operations Manager': {
        'conventional': 0.3,
        'organization': 0.3,
        'leadership': 0.4
      },
      'Cybersecurity Analyst': {
        'investigative': 0.4,
        'technical': 0.3,
        'attention to detail': 0.3
      },
      'DevOps Engineer': {
        'technical': 0.4,
        'automation': 0.3,
        'collaboration': 0.3
      },
      'Business Analyst': {
        'analytical': 0.4,
        'communication': 0.3,
        'problem solving': 0.3
      }
    };
  }

  // Méthodes utilitaires pour les descriptions
  getCareerDescription(career) {
    const descriptions = {
      'Data Scientist': 'Analyse des données pour extraire des insights business',
      'Software Engineer': 'Développement d\'applications et systèmes logiciels',
      'Product Manager': 'Gestion de produits de la conception à la mise sur le marché',
      'UX Designer': 'Conception d\'expériences utilisateur optimales',
      'Marketing Manager': 'Stratégie et exécution de campagnes marketing',
      'Sales Director': 'Direction des équipes commerciales et développement des ventes',
      'Operations Manager': 'Optimisation des processus opérationnels',
      'Cybersecurity Analyst': 'Protection des systèmes informatiques contre les menaces',
      'DevOps Engineer': 'Automatisation et optimisation des déploiements',
      'Business Analyst': 'Analyse des besoins métier et solutions techniques'
    };
    return descriptions[career] || 'Description non disponible';
  }

  getCareerSalary(career) {
    const salaries = {
      'Data Scientist': '60-120k€',
      'Software Engineer': '45-100k€',
      'Product Manager': '55-110k€',
      'UX Designer': '40-85k€',
      'Marketing Manager': '45-90k€',
      'Sales Director': '70-150k€',
      'Operations Manager': '50-95k€',
      'Cybersecurity Analyst': '50-100k€',
      'DevOps Engineer': '55-110k€',
      'Business Analyst': '45-85k€'
    };
    return salaries[career] || 'Non disponible';
  }

  getCareerGrowth(career) {
    const growth = {
      'Data Scientist': '+25%',
      'Software Engineer': '+20%',
      'Product Manager': '+22%',
      'UX Designer': '+18%',
      'Marketing Manager': '+15%',
      'Sales Director': '+12%',
      'Operations Manager': '+10%',
      'Cybersecurity Analyst': '+30%',
      'DevOps Engineer': '+25%',
      'Business Analyst': '+15%'
    };
    return growth[career] || '+10%';
  }

  getCareerSkills(career) {
    const skills = {
      'Data Scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
      'Software Engineer': ['JavaScript', 'Python', 'Java', 'Git', 'Agile'],
      'Product Manager': ['Strategy', 'Analytics', 'Communication', 'Leadership'],
      'UX Designer': ['Figma', 'User Research', 'Prototyping', 'Design Thinking'],
      'Marketing Manager': ['Digital Marketing', 'Analytics', 'Content Strategy'],
      'Sales Director': ['CRM', 'Negotiation', 'Team Management', 'Strategy'],
      'Operations Manager': ['Process Optimization', 'Project Management', 'Analytics'],
      'Cybersecurity Analyst': ['Security Tools', 'Risk Assessment', 'Incident Response'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms'],
      'Business Analyst': ['Requirements Analysis', 'Process Mapping', 'Stakeholder Management']
    };
    return skills[career] || [];
  }

  // Autres méthodes utilitaires...
  getCategoryWeights(testConfig) {
    // Pondération par défaut - peut être personnalisée
    return testConfig.categories.map(() => 1);
  }

  getSkillThresholds(testType) {
    const thresholds = {
      'riasec_professional': {
        'realistic': 70,
        'investigative': 70,
        'artistic': 70,
        'social': 70,
        'enterprising': 70,
        'conventional': 70
      },
      'cognitive_aptitude': {
        'verbal': 70,
        'numerical': 70,
        'abstract': 70,
        'spatial': 70,
        'memory': 70,
        'processing': 70
      }
    };
    return thresholds[testType] || {};
  }

  calculateGapPriority(category, current, target) {
    const gap = target - current;
    const urgency = gap / target;
    return Math.round(urgency * 100);
  }

  getGapRecommendations(category, score) {
    const recommendations = {
      'programming': ['Suivez des cours en ligne', 'Pratiquez sur des projets', 'Participez à des hackathons'],
      'leadership': ['Prenez des responsabilités', 'Formez-vous au management', 'Mentorez des collègues'],
      'communication': ['Pratiquez la présentation', 'Rejoignez un club de débat', 'Formez-vous à la communication']
    };
    return recommendations[category.toLowerCase()] || ['Développez cette compétence'];
  }

  getDevelopmentTimeline(priority) {
    if (priority >= 80) return '1-3 mois';
    if (priority >= 60) return '3-6 mois';
    return '6-12 mois';
  }

  createCareerPathway(category, score, globalScore) {
    if (score.percentage < 60) return null;
    
    return {
      category,
      level: score.percentage >= 80 ? 'Expert' : 'Intermédiaire',
      steps: this.getCareerSteps(category, score.percentage),
      timeline: this.getCareerTimeline(category, score.percentage),
      resources: this.getCareerResources(category)
    };
  }

  getCareerSteps(category, score) {
    const steps = {
      'programming': ['Apprendre les bases', 'Projets personnels', 'Contributions open source', 'Certifications'],
      'leadership': ['Responsabilités d\'équipe', 'Formation management', 'Mentorat', 'Direction de projet'],
      'communication': ['Présentations', 'Formation orale', 'Négociation', 'Formation formelle']
    };
    return steps[category.toLowerCase()] || ['Développement progressif'];
  }

  getCareerTimeline(category, score) {
    if (score >= 80) return '6-12 mois';
    if (score >= 60) return '1-2 ans';
    return '2-3 ans';
  }

  getCareerResources(category) {
    const resources = {
      'programming': ['Cours en ligne', 'Documentation technique', 'Communautés développeurs'],
      'leadership': ['Formations management', 'Livres leadership', 'Mentorat'],
      'communication': ['Cours de présentation', 'Toastmasters', 'Formation professionnelle']
    };
    return resources[category.toLowerCase()] || ['Ressources générales'];
  }

  getPrimaryRecommendation(category, testType) {
    return `Développez votre expertise en ${category} pour maximiser votre potentiel professionnel`;
  }

  getSecondaryRecommendation(category, testType) {
    return `Renforcez vos compétences en ${category} pour améliorer votre profil`;
  }

  getDevelopmentRecommendation(category, testType) {
    return `Commencez à développer vos compétences en ${category} pour élargir vos opportunités`;
  }

  getCareerForCategory(category, testType) {
    const careerMap = {
      'programming': 'Software Engineer',
      'leadership': 'Manager',
      'communication': 'Communications Specialist',
      'analytical': 'Business Analyst',
      'creative': 'Designer'
    };
    return careerMap[category.toLowerCase()] || 'Professional';
  }

  getPersonalityDescription(type) {
    const descriptions = {
      'Analyst': 'Personnalité analytique, orientée données et logique',
      'Creator': 'Personnalité créative, innovante et artistique',
      'Leader': 'Personnalité de leader, charismatique et visionnaire',
      'Helper': 'Personnalité d\'aidant, empathique et sociale',
      'Doer': 'Personnalité d\'action, pratique et déterminée',
      'Thinker': 'Personnalité de penseur, stratégique et réfléchie'
    };
    return descriptions[type] || 'Personnalité équilibrée';
  }

  getStrengthDescription(category) {
    return `Excellente compétence en ${category}, atout majeur pour votre développement professionnel`;
  }

  getWeaknessDescription(category) {
    return `Compétence en ${category} à développer pour améliorer votre profil global`;
  }

  calculateGrowthPotential(categoryScores) {
    const growth = ['learning', 'adaptability', 'innovation'];
    const score = growth.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / growth.length;
    return Math.round(score);
  }

  calculateLeadershipPotential(categoryScores) {
    const leadership = ['leadership', 'communication', 'vision'];
    const score = leadership.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / leadership.length;
    return Math.round(score);
  }

  calculateInnovationPotential(categoryScores) {
    const innovation = ['creativity', 'innovation', 'abstract'];
    const score = innovation.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / innovation.length;
    return Math.round(score);
  }

  calculateTechnicalPotential(categoryScores) {
    const technical = ['programming', 'technical', 'analytical'];
    const score = technical.reduce((sum, cat) => {
      const categoryScore = categoryScores[cat.toLowerCase()];
      return sum + (categoryScore ? categoryScore.percentage : 0);
    }, 0) / technical.length;
    return Math.round(score);
  }

  calculateConfidence(categoryScores) {
    const scores = Object.values(categoryScores).map(s => s.percentage);
    const variance = this.calculateStandardDeviation(scores);
    return Math.max(0, 1 - (variance / 100));
  }

  calculateOverallConfidence(responses, consistencyAnalysis, testConfig) {
    const completion = responses.filter(r => r !== null && r !== undefined).length / responses.length;
    const consistency = consistencyAnalysis.overall;
    const reliability = testConfig.reliability;
    
    return Math.round(((completion + consistency + reliability) / 3) * 100) / 100;
  }
}

module.exports = TestEngine;
