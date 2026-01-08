const MatchingService = require('./matchingService');

/**
 * Service d'analytics prédictifs et de dashboards temps réel
 * Fournit des insights avancés sur le recrutement et les performances
 */
class AnalyticsService {
  constructor() {
    this.matchingService = new MatchingService();
    
    // Métriques de base
    this.metrics = {
      totalCandidates: 0,
      totalJobs: 0,
      totalMatches: 0,
      averageMatchScore: 0,
      topSkills: [],
      hiringFunnel: {
        applications: 0,
        screenings: 0,
        interviews: 0,
        offers: 0,
        hired: 0
      },
      timeToHire: {
        average: 0,
        median: 0,
        best: 0,
        worst: 0
      },
      sourceEffectiveness: {},
      diversityMetrics: {},
      performancePredictions: {}
    };

    // Modèles prédictifs
    this.predictionModels = {
      successProbability: this.buildSuccessProbabilityModel(),
      timeToHire: this.buildTimeToHireModel(),
      retentionRisk: this.buildRetentionRiskModel(),
      performanceScore: this.buildPerformanceScoreModel()
    };
  }

  /**
   * Génération d'un dashboard complet
   */
  async generateDashboard(timeRange = '30d', filters = {}) {
    try {
      console.log('📊 Generating comprehensive analytics dashboard...');

      const dashboard = {
        overview: await this.generateOverviewMetrics(timeRange, filters),
        hiringFunnel: await this.generateHiringFunnel(timeRange, filters),
        skillsAnalysis: await this.generateSkillsAnalysis(timeRange, filters),
        diversityReport: await this.generateDiversityReport(timeRange, filters),
        performancePredictions: await this.generatePerformancePredictions(timeRange, filters),
        trends: await this.generateTrendsAnalysis(timeRange, filters),
        recommendations: await this.generateActionableRecommendations(timeRange, filters),
        metadata: {
          generatedAt: new Date().toISOString(),
          timeRange,
          filters,
          version: '2.0'
        }
      };

      console.log('✅ Dashboard generated successfully');
      return dashboard;

    } catch (error) {
      console.error('❌ Error generating dashboard:', error);
      throw error;
    }
  }

  /**
   * Métriques d'aperçu général
   */
  async generateOverviewMetrics(timeRange, filters) {
    // Simulation de données - à remplacer par des requêtes DB réelles
    const mockData = this.getMockOverviewData(timeRange);
    
    return {
      totalCandidates: mockData.totalCandidates,
      totalJobs: mockData.totalJobs,
      activeApplications: mockData.activeApplications,
      averageMatchScore: mockData.averageMatchScore,
      topPerformingSources: mockData.topPerformingSources,
      conversionRates: {
        applicationToScreening: mockData.conversionRates.applicationToScreening,
        screeningToInterview: mockData.conversionRates.screeningToInterview,
        interviewToOffer: mockData.conversionRates.interviewToOffer,
        offerToHire: mockData.conversionRates.offerToHire
      },
      timeToHire: {
        average: mockData.timeToHire.average,
        median: mockData.timeToHire.median,
        trend: mockData.timeToHire.trend
      },
      qualityScore: mockData.qualityScore,
      satisfactionScore: mockData.satisfactionScore
    };
  }

  /**
   * Analyse du pipeline de recrutement
   */
  async generateHiringFunnel(timeRange, filters) {
    const mockData = this.getMockFunnelData(timeRange);
    
    return {
      stages: [
        {
          name: 'Applications',
          count: mockData.applications,
          conversionRate: 100,
          trend: mockData.trends.applications
        },
        {
          name: 'Screenings',
          count: mockData.screenings,
          conversionRate: mockData.conversionRates.applicationToScreening,
          trend: mockData.trends.screenings
        },
        {
          name: 'Interviews',
          count: mockData.interviews,
          conversionRate: mockData.conversionRates.screeningToInterview,
          trend: mockData.trends.interviews
        },
        {
          name: 'Offers',
          count: mockData.offers,
          conversionRate: mockData.conversionRates.interviewToOffer,
          trend: mockData.trends.offers
        },
        {
          name: 'Hired',
          count: mockData.hired,
          conversionRate: mockData.conversionRates.offerToHire,
          trend: mockData.trends.hired
        }
      ],
      bottlenecks: this.identifyBottlenecks(mockData),
      recommendations: this.generateFunnelRecommendations(mockData)
    };
  }

  /**
   * Analyse des compétences et tendances
   */
  async generateSkillsAnalysis(timeRange, filters) {
    const mockData = this.getMockSkillsData(timeRange);
    
    return {
      mostDemandedSkills: mockData.mostDemandedSkills,
      mostMatchedSkills: mockData.mostMatchedSkills,
      skillGaps: mockData.skillGaps,
      emergingSkills: mockData.emergingSkills,
      skillTrends: mockData.skillTrends,
      recommendations: this.generateSkillRecommendations(mockData)
    };
  }

  /**
   * Rapport de diversité
   */
  async generateDiversityReport(timeRange, filters) {
    const mockData = this.getMockDiversityData(timeRange);
    
    return {
      genderDistribution: mockData.genderDistribution,
      ageDistribution: mockData.ageDistribution,
      educationDistribution: mockData.educationDistribution,
      experienceDistribution: mockData.experienceDistribution,
      locationDistribution: mockData.locationDistribution,
      diversityScore: mockData.diversityScore,
      recommendations: this.generateDiversityRecommendations(mockData)
    };
  }

  /**
   * Prédictions de performance
   */
  async generatePerformancePredictions(timeRange, filters) {
    const mockData = this.getMockPerformanceData(timeRange);
    
    return {
      successProbability: {
        high: mockData.successProbability.high,
        medium: mockData.successProbability.medium,
        low: mockData.successProbability.low
      },
      retentionRisk: {
        high: mockData.retentionRisk.high,
        medium: mockData.retentionRisk.medium,
        low: mockData.retentionRisk.low
      },
      performanceScore: {
        average: mockData.performanceScore.average,
        distribution: mockData.performanceScore.distribution
      },
      predictions: mockData.predictions,
      confidence: mockData.confidence
    };
  }

  /**
   * Analyse des tendances
   */
  async generateTrendsAnalysis(timeRange, filters) {
    const mockData = this.getMockTrendsData(timeRange);
    
    return {
      applicationTrends: mockData.applicationTrends,
      matchScoreTrends: mockData.matchScoreTrends,
      timeToHireTrends: mockData.timeToHireTrends,
      skillDemandTrends: mockData.skillDemandTrends,
      seasonalPatterns: mockData.seasonalPatterns,
      predictions: mockData.predictions
    };
  }

  /**
   * Recommandations actionables
   */
  async generateActionableRecommendations(timeRange, filters) {
    const dashboard = await this.generateDashboard(timeRange, filters);
    
    const recommendations = [];
    
    // Recommandations basées sur le pipeline
    if (dashboard.hiringFunnel.bottlenecks.length > 0) {
      recommendations.push({
        type: 'pipeline',
        priority: 'high',
        title: 'Optimiser le pipeline de recrutement',
        description: 'Identifiez et résolvez les goulots d\'étranglement',
        actions: dashboard.hiringFunnel.recommendations,
        impact: 'Réduction du temps de recrutement de 20-30%'
      });
    }
    
    // Recommandations basées sur les compétences
    if (dashboard.skillsAnalysis.skillGaps.length > 0) {
      recommendations.push({
        type: 'skills',
        priority: 'medium',
        title: 'Combler les lacunes de compétences',
        description: 'Développez les compétences manquantes',
        actions: dashboard.skillsAnalysis.recommendations,
        impact: 'Amélioration du matching de 15-25%'
      });
    }
    
    // Recommandations basées sur la diversité
    if (dashboard.diversityReport.diversityScore < 70) {
      recommendations.push({
        type: 'diversity',
        priority: 'medium',
        title: 'Améliorer la diversité',
        description: 'Élargissez les sources de recrutement',
        actions: dashboard.diversityReport.recommendations,
        impact: 'Amélioration de l\'innovation et de la performance'
      });
    }
    
    return recommendations;
  }

  /**
   * Prédiction de succès d'un candidat
   */
  async predictCandidateSuccess(cvData, jobData, historicalData = {}) {
    try {
      console.log('🔮 Predicting candidate success...');

      // Analyse de matching
      const matchingAnalysis = await this.matchingService.matchCandidateToJob(cvData, jobData);
      
      // Facteurs de prédiction
      const factors = {
        matchScore: matchingAnalysis.matching.overallScore,
        experienceLevel: this.calculateExperienceLevel(cvData.experience),
        educationLevel: this.calculateEducationLevel(cvData.education),
        skillRelevance: this.calculateSkillRelevance(cvData.skills, jobData.requirements),
        softSkillsMatch: this.calculateSoftSkillsMatch(cvData.skills, jobData.requirements),
        locationMatch: this.calculateLocationMatch(cvData.personal, jobData.location),
        salaryExpectations: this.calculateSalaryCompatibility(cvData, jobData.salary)
      };

      // Modèle de prédiction (simplifié)
      const successProbability = this.calculateSuccessProbability(factors);
      const retentionRisk = this.calculateRetentionRisk(factors);
      const performanceScore = this.calculatePerformanceScore(factors);

      const prediction = {
        successProbability: Math.round(successProbability * 100),
        retentionRisk: Math.round(retentionRisk * 100),
        performanceScore: Math.round(performanceScore * 100),
        factors,
        recommendations: this.generateCandidateRecommendations(factors),
        confidence: this.calculatePredictionConfidence(factors),
        metadata: {
          predictedAt: new Date().toISOString(),
          modelVersion: '2.0'
        }
      };

      console.log(`✅ Success prediction: ${prediction.successProbability}%`);
      return prediction;

    } catch (error) {
      console.error('❌ Error predicting candidate success:', error);
      throw error;
    }
  }

  /**
   * Analyse comparative des sources de recrutement
   */
  async analyzeSourceEffectiveness(timeRange = '30d') {
    const mockData = this.getMockSourceData(timeRange);
    
    return {
      sources: mockData.sources.map(source => ({
        name: source.name,
        applications: source.applications,
        qualityScore: source.qualityScore,
        conversionRate: source.conversionRate,
        timeToHire: source.timeToHire,
        costPerHire: source.costPerHire,
        roi: source.roi,
        recommendations: this.generateSourceRecommendations(source)
      })),
      bestPerformingSource: mockData.bestPerformingSource,
      worstPerformingSource: mockData.worstPerformingSource,
      recommendations: this.generateOverallSourceRecommendations(mockData)
    };
  }

  // Méthodes utilitaires pour les prédictions
  calculateExperienceLevel(experiences) {
    if (!experiences || experiences.length === 0) return 0;
    
    const totalYears = experiences.reduce((sum, exp) => {
      const years = this.extractYearsFromDuration(exp.duration);
      return sum + years;
    }, 0);
    
    return Math.min(1, totalYears / 10); // Normalisé sur 10 ans
  }

  calculateEducationLevel(educations) {
    if (!educations || educations.length === 0) return 0;
    
    const levels = {
      'bts': 0.3, 'dut': 0.4, 'licence': 0.6, 'bachelor': 0.6,
      'master': 0.8, 'doctorat': 1.0, 'phd': 1.0
    };
    
    let maxLevel = 0;
    for (const edu of educations) {
      const institution = edu.institution.toLowerCase();
      for (const [level, score] of Object.entries(levels)) {
        if (institution.includes(level)) {
          maxLevel = Math.max(maxLevel, score);
        }
      }
    }
    
    return maxLevel;
  }

  calculateSkillRelevance(cvSkills, jobRequirements) {
    if (!jobRequirements.skills || !cvSkills.categorized) return 0;
    
    const requiredSkills = jobRequirements.skills;
    const cvSkillsList = this.extractAllSkills(cvSkills);
    
    let matches = 0;
    for (const required of requiredSkills) {
      if (cvSkillsList.some(skill => skill.toLowerCase().includes(required.toLowerCase()))) {
        matches++;
      }
    }
    
    return matches / requiredSkills.length;
  }

  calculateSoftSkillsMatch(cvSkills, jobRequirements) {
    if (!jobRequirements.softSkills || !cvSkills.categorized?.soft_skills) return 0;
    
    const requiredSoftSkills = jobRequirements.softSkills;
    const cvSoftSkills = cvSkills.categorized.soft_skills.skills.map(s => s.toLowerCase());
    
    let matches = 0;
    for (const required of requiredSoftSkills) {
      if (cvSoftSkills.some(skill => skill.includes(required.toLowerCase()))) {
        matches++;
      }
    }
    
    return matches / requiredSoftSkills.length;
  }

  calculateLocationMatch(cvPersonal, jobLocation) {
    if (!cvPersonal.location || !jobLocation) return 0.5;
    
    const cvLocation = cvPersonal.location.toLowerCase();
    const jobLocationLower = jobLocation.toLowerCase();
    
    if (cvLocation.includes(jobLocationLower) || jobLocationLower.includes(cvLocation)) {
      return 1.0;
    }
    
    return 0.3; // Match partiel
  }

  calculateSalaryCompatibility(cvData, jobSalary) {
    // Logique simplifiée - à améliorer avec des données réelles
    return 0.7; // Valeur par défaut
  }

  calculateSuccessProbability(factors) {
    const weights = {
      matchScore: 0.3,
      experienceLevel: 0.25,
      educationLevel: 0.15,
      skillRelevance: 0.15,
      softSkillsMatch: 0.10,
      locationMatch: 0.03,
      salaryExpectations: 0.02
    };
    
    let probability = 0;
    for (const [factor, value] of Object.entries(factors)) {
      probability += value * (weights[factor] || 0);
    }
    
    return Math.min(1, Math.max(0, probability));
  }

  calculateRetentionRisk(factors) {
    // Facteurs qui augmentent le risque de départ
    const riskFactors = {
      lowMatchScore: factors.matchScore < 0.7 ? 0.3 : 0,
      highSalaryExpectations: factors.salaryExpectations > 0.8 ? 0.2 : 0,
      locationMismatch: factors.locationMatch < 0.5 ? 0.2 : 0,
      overQualification: factors.educationLevel > 0.9 && factors.experienceLevel > 0.8 ? 0.3 : 0
    };
    
    const totalRisk = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0);
    return Math.min(1, totalRisk);
  }

  calculatePerformanceScore(factors) {
    // Score de performance basé sur les facteurs clés
    const performanceFactors = {
      matchScore: factors.matchScore * 0.4,
      experienceLevel: factors.experienceLevel * 0.3,
      skillRelevance: factors.skillRelevance * 0.2,
      softSkillsMatch: factors.softSkillsMatch * 0.1
    };
    
    return Object.values(performanceFactors).reduce((sum, score) => sum + score, 0);
  }

  calculatePredictionConfidence(factors) {
    // Confiance basée sur la complétude des données
    const completeness = Object.values(factors).filter(value => value > 0).length / Object.keys(factors).length;
    return Math.round(completeness * 100) / 100;
  }

  generateCandidateRecommendations(factors) {
    const recommendations = [];
    
    if (factors.matchScore < 0.7) {
      recommendations.push('Améliorer le matching des compétences techniques');
    }
    
    if (factors.softSkillsMatch < 0.5) {
      recommendations.push('Développer les compétences comportementales');
    }
    
    if (factors.locationMatch < 0.5) {
      recommendations.push('Considérer la mobilité géographique');
    }
    
    return recommendations;
  }

  // Méthodes de données simulées (à remplacer par des requêtes DB réelles)
  getMockOverviewData(timeRange) {
    return {
      totalCandidates: 1250,
      totalJobs: 45,
      activeApplications: 320,
      averageMatchScore: 72,
      topPerformingSources: ['LinkedIn', 'Indeed', 'Referrals'],
      conversionRates: {
        applicationToScreening: 0.35,
        screeningToInterview: 0.60,
        interviewToOffer: 0.40,
        offerToHire: 0.85
      },
      timeToHire: {
        average: 28,
        median: 24,
        trend: '+5%'
      },
      qualityScore: 78,
      satisfactionScore: 82
    };
  }

  getMockFunnelData(timeRange) {
    return {
      applications: 320,
      screenings: 112,
      interviews: 67,
      offers: 27,
      hired: 23,
      conversionRates: {
        applicationToScreening: 0.35,
        screeningToInterview: 0.60,
        interviewToOffer: 0.40,
        offerToHire: 0.85
      },
      trends: {
        applications: '+12%',
        screenings: '+8%',
        interviews: '+15%',
        offers: '+5%',
        hired: '+18%'
      }
    };
  }

  getMockSkillsData(timeRange) {
    return {
      mostDemandedSkills: [
        { skill: 'JavaScript', demand: 85, trend: '+15%' },
        { skill: 'Python', demand: 78, trend: '+12%' },
        { skill: 'React', demand: 72, trend: '+8%' },
        { skill: 'AWS', demand: 68, trend: '+20%' },
        { skill: 'Docker', demand: 65, trend: '+25%' }
      ],
      mostMatchedSkills: [
        { skill: 'JavaScript', matches: 92, trend: '+10%' },
        { skill: 'Python', matches: 88, trend: '+8%' },
        { skill: 'React', matches: 85, trend: '+12%' },
        { skill: 'Node.js', matches: 82, trend: '+15%' },
        { skill: 'SQL', matches: 78, trend: '+5%' }
      ],
      skillGaps: [
        { skill: 'Kubernetes', gap: 45, impact: 'High' },
        { skill: 'Machine Learning', gap: 38, impact: 'Medium' },
        { skill: 'DevOps', gap: 32, impact: 'High' },
        { skill: 'GraphQL', gap: 28, impact: 'Medium' }
      ],
      emergingSkills: [
        { skill: 'Rust', growth: '+45%', adoption: 15 },
        { skill: 'WebAssembly', growth: '+38%', adoption: 12 },
        { skill: 'Edge Computing', growth: '+32%', adoption: 8 }
      ],
      skillTrends: {
        programming: '+8%',
        frameworks: '+12%',
        cloud: '+20%',
        ai_ml: '+25%'
      }
    };
  }

  getMockDiversityData(timeRange) {
    return {
      genderDistribution: {
        male: 58,
        female: 38,
        other: 4
      },
      ageDistribution: {
        '18-25': 15,
        '26-35': 45,
        '36-45': 28,
        '46-55': 10,
        '55+': 2
      },
      educationDistribution: {
        'BTS/DUT': 25,
        'Licence': 35,
        'Master': 30,
        'Doctorat': 10
      },
      experienceDistribution: {
        '0-2 ans': 20,
        '3-5 ans': 35,
        '6-10 ans': 30,
        '10+ ans': 15
      },
      locationDistribution: {
        'Paris': 45,
        'Lyon': 15,
        'Marseille': 10,
        'Toulouse': 8,
        'Autres': 22
      },
      diversityScore: 72,
      recommendations: [
        'Élargir les sources de recrutement',
        'Implémenter des quotas de diversité',
        'Améliorer l\'inclusion dans les offres'
      ]
    };
  }

  getMockPerformanceData(timeRange) {
    return {
      successProbability: {
        high: 35,
        medium: 45,
        low: 20
      },
      retentionRisk: {
        high: 15,
        medium: 25,
        low: 60
      },
      performanceScore: {
        average: 78,
        distribution: {
          '90-100': 20,
          '80-89': 35,
          '70-79': 30,
          '60-69': 12,
          '0-59': 3
        }
      },
      predictions: [
        'Augmentation de 15% des embauches de qualité',
        'Réduction de 20% du turnover',
        'Amélioration de 25% de la satisfaction'
      ],
      confidence: 0.82
    };
  }

  getMockTrendsData(timeRange) {
    return {
      applicationTrends: [
        { month: 'Jan', count: 280 },
        { month: 'Fév', count: 320 },
        { month: 'Mar', count: 350 },
        { month: 'Avr', count: 380 }
      ],
      matchScoreTrends: [
        { month: 'Jan', score: 68 },
        { month: 'Fév', score: 72 },
        { month: 'Mar', score: 75 },
        { month: 'Avr', score: 78 }
      ],
      timeToHireTrends: [
        { month: 'Jan', days: 32 },
        { month: 'Fév', days: 28 },
        { month: 'Mar', days: 26 },
        { month: 'Avr', days: 24 }
      ],
      skillDemandTrends: {
        'JavaScript': [85, 87, 89, 91],
        'Python': [78, 80, 82, 84],
        'React': [72, 74, 76, 78]
      },
      seasonalPatterns: {
        'Q1': 'High activity',
        'Q2': 'Moderate activity',
        'Q3': 'Low activity',
        'Q4': 'High activity'
      },
      predictions: [
        'Croissance de 20% des applications',
        'Amélioration de 10% du matching',
        'Réduction de 15% du temps de recrutement'
      ]
    };
  }

  getMockSourceData(timeRange) {
    return {
      sources: [
        {
          name: 'LinkedIn',
          applications: 150,
          qualityScore: 85,
          conversionRate: 0.35,
          timeToHire: 25,
          costPerHire: 1200,
          roi: 3.2
        },
        {
          name: 'Indeed',
          applications: 200,
          qualityScore: 72,
          conversionRate: 0.28,
          timeToHire: 30,
          costPerHire: 800,
          roi: 2.8
        },
        {
          name: 'Referrals',
          applications: 50,
          qualityScore: 92,
          conversionRate: 0.60,
          timeToHire: 20,
          costPerHire: 500,
          roi: 4.5
        }
      ],
      bestPerformingSource: 'Referrals',
      worstPerformingSource: 'Indeed'
    };
  }

  // Méthodes utilitaires
  extractAllSkills(cvSkills) {
    const allSkills = [];
    if (cvSkills.categorized) {
      for (const category of Object.values(cvSkills.categorized)) {
        allSkills.push(...category.skills);
      }
    }
    return allSkills.map(skill => skill.toLowerCase());
  }

  extractYearsFromDuration(duration) {
    if (!duration) return 0;
    const yearMatch = duration.match(/(\d+)\s*(ans?|years?)/i);
    if (yearMatch) return parseInt(yearMatch[1]);
    const monthMatch = duration.match(/(\d+)\s*(mois|months?)/i);
    if (monthMatch) return parseInt(monthMatch[1]) / 12;
    return 0;
  }

  identifyBottlenecks(funnelData) {
    const bottlenecks = [];
    const stages = ['applications', 'screenings', 'interviews', 'offers', 'hired'];
    const values = [funnelData.applications, funnelData.screenings, funnelData.interviews, funnelData.offers, funnelData.hired];
    
    for (let i = 1; i < values.length; i++) {
      const conversionRate = values[i] / values[i-1];
      if (conversionRate < 0.3) {
        bottlenecks.push({
          stage: stages[i],
          conversionRate: Math.round(conversionRate * 100),
          impact: 'High'
        });
      }
    }
    
    return bottlenecks;
  }

  generateFunnelRecommendations(funnelData) {
    const recommendations = [];
    
    if (funnelData.conversionRates.applicationToScreening < 0.3) {
      recommendations.push('Améliorer la qualité des candidatures initiales');
    }
    
    if (funnelData.conversionRates.screeningToInterview < 0.5) {
      recommendations.push('Optimiser le processus de screening');
    }
    
    if (funnelData.conversionRates.interviewToOffer < 0.4) {
      recommendations.push('Améliorer la qualité des entretiens');
    }
    
    return recommendations;
  }

  generateSkillRecommendations(skillsData) {
    const recommendations = [];
    
    if (skillsData.skillGaps.length > 0) {
      recommendations.push('Développer des programmes de formation pour les compétences manquantes');
    }
    
    if (skillsData.emergingSkills.length > 0) {
      recommendations.push('Investir dans les compétences émergentes');
    }
    
    return recommendations;
  }

  generateDiversityRecommendations(diversityData) {
    const recommendations = [];
    
    if (diversityData.diversityScore < 70) {
      recommendations.push('Élargir les sources de recrutement');
      recommendations.push('Implémenter des quotas de diversité');
    }
    
    return recommendations;
  }

  generateSourceRecommendations(source) {
    const recommendations = [];
    
    if (source.conversionRate < 0.3) {
      recommendations.push('Améliorer la qualité des candidatures de cette source');
    }
    
    if (source.timeToHire > 30) {
      recommendations.push('Optimiser le processus de recrutement pour cette source');
    }
    
    return recommendations;
  }

  generateOverallSourceRecommendations(sourceData) {
    return [
      'Investir davantage dans les sources à fort ROI',
      'Optimiser les sources sous-performantes',
      'Diversifier les canaux de recrutement'
    ];
  }

  // Modèles prédictifs (simplifiés)
  buildSuccessProbabilityModel() {
    return {
      factors: ['matchScore', 'experienceLevel', 'educationLevel', 'skillRelevance'],
      weights: [0.4, 0.3, 0.2, 0.1],
      threshold: 0.7
    };
  }

  buildTimeToHireModel() {
    return {
      factors: ['matchScore', 'source', 'jobComplexity', 'marketConditions'],
      weights: [0.3, 0.2, 0.3, 0.2],
      baseline: 28
    };
  }

  buildRetentionRiskModel() {
    return {
      factors: ['matchScore', 'salaryExpectations', 'locationMatch', 'overQualification'],
      weights: [0.4, 0.3, 0.2, 0.1],
      threshold: 0.6
    };
  }

  buildPerformanceScoreModel() {
    return {
      factors: ['matchScore', 'experienceLevel', 'skillRelevance', 'softSkillsMatch'],
      weights: [0.4, 0.3, 0.2, 0.1],
      scale: 100
    };
  }
}

module.exports = AnalyticsService;
