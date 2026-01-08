const NLPService = require('./nlpService');

/**
 * Service de matching intelligent multi-critères
 * Utilise des algorithmes ML et des pondérations dynamiques
 */
class MatchingService {
  constructor() {
    this.nlpService = new NLPService();
    
    // Poids par défaut pour les critères de matching
    this.defaultWeights = {
      skills: 0.35,           // Compétences techniques
      experience: 0.25,       // Expérience professionnelle
      education: 0.15,        // Formation
      softSkills: 0.10,       // Soft skills
      location: 0.05,         // Localisation
      salary: 0.05,           // Attentes salariales
      availability: 0.05      // Disponibilité
    };

    // Critères de matching par type de poste
    this.jobTypeWeights = {
      'developer': {
        skills: 0.45,
        experience: 0.30,
        education: 0.10,
        softSkills: 0.10,
        location: 0.03,
        salary: 0.02
      },
      'manager': {
        skills: 0.20,
        experience: 0.40,
        education: 0.15,
        softSkills: 0.20,
        location: 0.03,
        salary: 0.02
      },
      'designer': {
        skills: 0.40,
        experience: 0.25,
        education: 0.15,
        softSkills: 0.15,
        location: 0.03,
        salary: 0.02
      },
      'sales': {
        skills: 0.25,
        experience: 0.30,
        education: 0.10,
        softSkills: 0.30,
        location: 0.03,
        salary: 0.02
      }
    };

    // Dictionnaire de compétences par seniorité
    this.senioritySkills = {
      'junior': ['html', 'css', 'javascript', 'git', 'sql'],
      'mid': ['react', 'node.js', 'python', 'aws', 'docker', 'api'],
      'senior': ['kubernetes', 'microservices', 'architecture', 'leadership', 'mentoring'],
      'lead': ['strategy', 'team management', 'budget', 'stakeholder', 'roadmap']
    };

    // Mots-clés pour détecter la seniorité
    this.seniorityKeywords = {
      'junior': ['junior', 'entry', 'débutant', 'stagiaire', 'trainee'],
      'mid': ['mid', 'intermediate', 'intermédiaire', '2-5 ans', '3-6 ans'],
      'senior': ['senior', 'expert', 'expérimenté', '5+ ans', '6+ ans'],
      'lead': ['lead', 'principal', 'head', 'director', 'manager', 'chef']
    };
  }

  /**
   * Matching intelligent entre un CV et une offre d'emploi
   */
  async matchCandidateToJob(cvData, jobData) {
    try {
      console.log(`🔍 Starting intelligent matching for job: ${jobData.title}`);
      
      const analysis = {
        candidate: cvData,
        job: jobData,
        matching: {
          overallScore: 0,
          detailedScores: {},
          recommendations: [],
          strengths: [],
          weaknesses: [],
          fitLevel: 'unknown'
        },
        metadata: {
          processedAt: new Date().toISOString(),
          algorithmVersion: '2.0',
          confidence: 0
        }
      };

      // 1. Analyse des compétences
      const skillsMatch = this.analyzeSkillsMatch(cvData.skills, jobData.requirements);
      analysis.matching.detailedScores.skills = skillsMatch;

      // 2. Analyse de l'expérience
      const experienceMatch = this.analyzeExperienceMatch(cvData.experience, jobData.requirements);
      analysis.matching.detailedScores.experience = experienceMatch;

      // 3. Analyse de la formation
      const educationMatch = this.analyzeEducationMatch(cvData.education, jobData.requirements);
      analysis.matching.detailedScores.education = educationMatch;

      // 4. Analyse des soft skills
      const softSkillsMatch = this.analyzeSoftSkillsMatch(cvData.skills, jobData.requirements);
      analysis.matching.detailedScores.softSkills = softSkillsMatch;

      // 5. Analyse de la localisation
      const locationMatch = this.analyzeLocationMatch(cvData.personal, jobData.location);
      analysis.matching.detailedScores.location = locationMatch;

      // 6. Analyse des attentes salariales
      const salaryMatch = this.analyzeSalaryMatch(cvData, jobData.salary);
      analysis.matching.detailedScores.salary = salaryMatch;

      // 7. Calcul du score global avec pondérations dynamiques
      const weights = this.getWeightsForJobType(jobData.type || 'developer');
      analysis.matching.overallScore = this.calculateOverallScore(
        analysis.matching.detailedScores, 
        weights
      );

      // 8. Génération des recommandations
      analysis.matching.recommendations = this.generateMatchingRecommendations(
        analysis.matching.detailedScores,
        cvData,
        jobData
      );

      // 9. Identification des forces et faiblesses
      analysis.matching.strengths = this.identifyStrengths(analysis.matching.detailedScores);
      analysis.matching.weaknesses = this.identifyWeaknesses(analysis.matching.detailedScores);

      // 10. Détermination du niveau de fit
      analysis.matching.fitLevel = this.determineFitLevel(analysis.matching.overallScore);

      // 11. Calcul de la confiance
      analysis.metadata.confidence = this.calculateConfidence(analysis.matching.detailedScores);

      console.log(`✅ Matching completed - Score: ${analysis.matching.overallScore}%`);
      return analysis;

    } catch (error) {
      console.error('❌ Error in intelligent matching:', error);
      throw error;
    }
  }

  /**
   * Analyse du matching des compétences
   */
  analyzeSkillsMatch(cvSkills, jobRequirements) {
    const requiredSkills = jobRequirements.skills || [];
    const cvSkillsList = this.extractAllSkills(cvSkills);
    
    if (requiredSkills.length === 0) {
      return { score: 0, matched: [], missing: [], confidence: 0 };
    }

    const matched = [];
    const missing = [];

    for (const requiredSkill of requiredSkills) {
      const skillMatch = this.findBestSkillMatch(requiredSkill, cvSkillsList);
      if (skillMatch.score > 0.7) {
        matched.push({
          required: requiredSkill,
          found: skillMatch.skill,
          score: skillMatch.score
        });
      } else {
        missing.push(requiredSkill);
      }
    }

    const score = (matched.length / requiredSkills.length) * 100;
    const confidence = this.calculateSkillConfidence(matched, requiredSkills.length);

    return {
      score: Math.round(score),
      matched,
      missing,
      confidence,
      coverage: `${matched.length}/${requiredSkills.length}`
    };
  }

  /**
   * Analyse du matching de l'expérience
   */
  analyzeExperienceMatch(cvExperience, jobRequirements) {
    const requiredExperience = jobRequirements.experience || 0;
    const requiredSeniority = jobRequirements.seniority || 'mid';
    
    if (!cvExperience || cvExperience.length === 0) {
      return { score: 0, years: 0, seniority: 'unknown', confidence: 0 };
    }

    // Calcul des années d'expérience totales
    const totalYears = this.calculateTotalExperience(cvExperience);
    
    // Détermination de la seniorité
    const detectedSeniority = this.detectSeniority(cvExperience, totalYears);
    
    // Score basé sur les années d'expérience
    let experienceScore = 0;
    if (totalYears >= requiredExperience) {
      experienceScore = Math.min(100, (totalYears / requiredExperience) * 100);
    } else {
      experienceScore = Math.max(0, (totalYears / requiredExperience) * 80);
    }

    // Bonus pour la seniorité correspondante
    const seniorityBonus = this.calculateSeniorityBonus(detectedSeniority, requiredSeniority);
    const finalScore = Math.min(100, experienceScore + seniorityBonus);

    return {
      score: Math.round(finalScore),
      years: totalYears,
      seniority: detectedSeniority,
      required: requiredExperience,
      confidence: this.calculateExperienceConfidence(totalYears, cvExperience.length)
    };
  }

  /**
   * Analyse du matching de la formation
   */
  analyzeEducationMatch(cvEducation, jobRequirements) {
    const requiredEducation = jobRequirements.education || 'any';
    const requiredField = jobRequirements.field || 'any';
    
    if (!cvEducation || cvEducation.length === 0) {
      return { score: 0, level: 'unknown', field: 'unknown', confidence: 0 };
    }

    // Détection du niveau d'éducation le plus élevé
    const highestEducation = this.findHighestEducation(cvEducation);
    
    // Détection du domaine d'études
    const educationField = this.detectEducationField(cvEducation);
    
    // Score basé sur le niveau d'éducation
    const levelScore = this.calculateEducationLevelScore(highestEducation, requiredEducation);
    
    // Score basé sur le domaine
    const fieldScore = this.calculateFieldRelevanceScore(educationField, requiredField);
    
    const finalScore = (levelScore + fieldScore) / 2;

    return {
      score: Math.round(finalScore),
      level: highestEducation,
      field: educationField,
      required: requiredEducation,
      confidence: this.calculateEducationConfidence(cvEducation.length)
    };
  }

  /**
   * Analyse du matching des soft skills
   */
  analyzeSoftSkillsMatch(cvSkills, jobRequirements) {
    const requiredSoftSkills = jobRequirements.softSkills || [];
    const cvSoftSkills = this.extractSoftSkills(cvSkills);
    
    if (requiredSoftSkills.length === 0) {
      return { score: 0, matched: [], missing: [], confidence: 0 };
    }

    const matched = [];
    const missing = [];

    for (const requiredSkill of requiredSoftSkills) {
      const skillMatch = this.findSoftSkillMatch(requiredSkill, cvSoftSkills);
      if (skillMatch.score > 0.6) {
        matched.push({
          required: requiredSkill,
          found: skillMatch.skill,
          score: skillMatch.score
        });
      } else {
        missing.push(requiredSkill);
      }
    }

    const score = (matched.length / requiredSoftSkills.length) * 100;

    return {
      score: Math.round(score),
      matched,
      missing,
      confidence: this.calculateSoftSkillsConfidence(matched, requiredSoftSkills.length)
    };
  }

  /**
   * Analyse du matching de la localisation
   */
  analyzeLocationMatch(cvPersonal, jobLocation) {
    if (!jobLocation || !cvPersonal.location) {
      return { score: 50, match: false, confidence: 0 };
    }

    const cvLocation = cvPersonal.location.toLowerCase();
    const jobLocationLower = jobLocation.toLowerCase();
    
    // Matching exact
    if (cvLocation.includes(jobLocationLower) || jobLocationLower.includes(cvLocation)) {
      return { score: 100, match: true, confidence: 0.9 };
    }

    // Matching par ville principale
    const majorCities = {
      'paris': ['paris', 'idf', 'île-de-france'],
      'lyon': ['lyon', 'rhône'],
      'marseille': ['marseille', 'paca'],
      'toulouse': ['toulouse', 'haute-garonne']
    };

    for (const [city, aliases] of Object.entries(majorCities)) {
      if (aliases.some(alias => cvLocation.includes(alias)) && 
          aliases.some(alias => jobLocationLower.includes(alias))) {
        return { score: 90, match: true, confidence: 0.8 };
      }
    }

    // Matching par région
    const regions = {
      'nord': ['nord', 'lille', 'hauts-de-france'],
      'sud': ['sud', 'provence', 'côte d\'azur'],
      'ouest': ['ouest', 'bretagne', 'nantes', 'rennes'],
      'est': ['est', 'alsace', 'strasbourg']
    };

    for (const [region, cities] of Object.entries(regions)) {
      if (cities.some(city => cvLocation.includes(city)) && 
          cities.some(city => jobLocationLower.includes(city))) {
        return { score: 70, match: true, confidence: 0.6 };
      }
    }

    return { score: 30, match: false, confidence: 0.3 };
  }

  /**
   * Analyse du matching des attentes salariales
   */
  analyzeSalaryMatch(cvData, jobSalary) {
    if (!jobSalary || !cvData.personal) {
      return { score: 50, match: false, confidence: 0 };
    }

    // Extraction des attentes salariales du CV (si disponibles)
    const cvSalaryExpectations = this.extractSalaryExpectations(cvData);
    
    if (!cvSalaryExpectations) {
      return { score: 50, match: false, confidence: 0 };
    }

    const salaryRange = this.parseSalaryRange(jobSalary);
    const cvRange = this.parseSalaryRange(cvSalaryExpectations);

    if (!salaryRange || !cvRange) {
      return { score: 50, match: false, confidence: 0 };
    }

    // Calcul de la compatibilité salariale
    const overlap = this.calculateSalaryOverlap(cvRange, salaryRange);
    const score = Math.round(overlap * 100);

    return {
      score,
      match: score > 70,
      cvExpectations: cvRange,
      jobOffer: salaryRange,
      confidence: this.calculateSalaryConfidence(cvRange, salaryRange)
    };
  }

  /**
   * Calcul du score global avec pondérations
   */
  calculateOverallScore(detailedScores, weights) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [criterion, score] of Object.entries(detailedScores)) {
      const weight = weights[criterion] || 0;
      totalScore += score.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Génération des recommandations de matching
   */
  generateMatchingRecommendations(scores, cvData, jobData) {
    const recommendations = [];

    // Recommandations basées sur les compétences
    if (scores.skills.score < 70) {
      recommendations.push({
        type: 'skills',
        priority: 'high',
        message: `Compétences manquantes: ${scores.skills.missing.join(', ')}`,
        action: 'Formation recommandée dans les technologies requises',
        impact: 'Impact majeur sur le matching'
      });
    }

    // Recommandations basées sur l'expérience
    if (scores.experience.score < 60) {
      recommendations.push({
        type: 'experience',
        priority: 'medium',
        message: `Expérience insuffisante: ${scores.experience.years} ans vs ${scores.experience.required} requis`,
        action: 'Considérer un poste junior ou une formation accélérée',
        impact: 'Impact modéré sur le matching'
      });
    }

    // Recommandations basées sur la formation
    if (scores.education.score < 50) {
      recommendations.push({
        type: 'education',
        priority: 'low',
        message: `Formation non optimale: ${scores.education.level} vs ${scores.education.required} requis`,
        action: 'Mettre en avant l\'expérience pratique et les certifications',
        impact: 'Impact mineur sur le matching'
      });
    }

    return recommendations;
  }

  // Méthodes utilitaires
  extractAllSkills(cvSkills) {
    const allSkills = [];
    if (cvSkills.categorized) {
      for (const category of Object.values(cvSkills.categorized)) {
        allSkills.push(...category.skills);
      }
    }
    if (cvSkills.uncategorized) {
      allSkills.push(...cvSkills.uncategorized);
    }
    return allSkills.map(skill => skill.toLowerCase());
  }

  findBestSkillMatch(requiredSkill, cvSkills) {
    const required = requiredSkill.toLowerCase();
    
    // Matching exact
    const exactMatch = cvSkills.find(skill => skill === required);
    if (exactMatch) {
      return { skill: exactMatch, score: 1.0 };
    }

    // Matching partiel
    const partialMatches = cvSkills.filter(skill => 
      skill.includes(required) || required.includes(skill)
    );

    if (partialMatches.length > 0) {
      const bestMatch = partialMatches[0];
      const score = this.calculateSimilarity(required, bestMatch);
      return { skill: bestMatch, score };
    }

    return { skill: null, score: 0 };
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
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
  }

  calculateTotalExperience(experiences) {
    let totalYears = 0;
    
    for (const exp of experiences) {
      const years = this.extractYearsFromDuration(exp.duration);
      totalYears += years;
    }
    
    return totalYears;
  }

  extractYearsFromDuration(duration) {
    if (!duration) return 0;
    
    const yearMatch = duration.match(/(\d+)\s*(ans?|years?)/i);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    
    const monthMatch = duration.match(/(\d+)\s*(mois|months?)/i);
    if (monthMatch) {
      return parseInt(monthMatch[1]) / 12;
    }
    
    return 0;
  }

  detectSeniority(experiences, totalYears) {
    // Analyse des titres de poste
    for (const exp of experiences) {
      const position = exp.position.toLowerCase();
      for (const [level, keywords] of Object.entries(this.seniorityKeywords)) {
        if (keywords.some(keyword => position.includes(keyword))) {
          return level;
        }
      }
    }
    
    // Analyse basée sur les années d'expérience
    if (totalYears >= 8) return 'lead';
    if (totalYears >= 5) return 'senior';
    if (totalYears >= 2) return 'mid';
    return 'junior';
  }

  calculateSeniorityBonus(detected, required) {
    const bonusMap = {
      'junior': { 'junior': 20, 'mid': 0, 'senior': -10, 'lead': -20 },
      'mid': { 'junior': 10, 'mid': 20, 'senior': 5, 'lead': -10 },
      'senior': { 'junior': 0, 'mid': 10, 'senior': 20, 'lead': 10 },
      'lead': { 'junior': 0, 'mid': 5, 'senior': 15, 'lead': 20 }
    };
    
    return bonusMap[detected]?.[required] || 0;
  }

  findHighestEducation(educations) {
    const levels = ['bts', 'dut', 'licence', 'bachelor', 'master', 'doctorat', 'phd'];
    let highest = 'unknown';
    let highestIndex = -1;
    
    for (const edu of educations) {
      const institution = edu.institution.toLowerCase();
      for (let i = 0; i < levels.length; i++) {
        if (institution.includes(levels[i]) && i > highestIndex) {
          highest = levels[i];
          highestIndex = i;
        }
      }
    }
    
    return highest;
  }

  detectEducationField(educations) {
    const fields = ['informatique', 'computer', 'gestion', 'management', 'marketing', 'finance', 'santé', 'medical'];
    
    for (const edu of educations) {
      const institution = edu.institution.toLowerCase();
      for (const field of fields) {
        if (institution.includes(field)) {
          return field;
        }
      }
    }
    
    return 'unknown';
  }

  calculateEducationLevelScore(level, required) {
    const levelScores = {
      'bts': 20, 'dut': 25, 'licence': 40, 'bachelor': 40,
      'master': 70, 'doctorat': 90, 'phd': 90
    };
    
    const requiredScores = {
      'any': 0, 'bts': 20, 'licence': 40, 'master': 70, 'doctorat': 90
    };
    
    const levelScore = levelScores[level] || 0;
    const requiredScore = requiredScores[required] || 0;
    
    if (levelScore >= requiredScore) {
      return 100;
    } else {
      return Math.max(0, (levelScore / requiredScore) * 80);
    }
  }

  calculateFieldRelevanceScore(field, required) {
    if (required === 'any' || field === 'unknown') return 50;
    if (field === required) return 100;
    
    // Similarité sémantique basique
    const similarity = this.calculateSimilarity(field, required);
    return Math.round(similarity * 100);
  }

  extractSoftSkills(cvSkills) {
    if (cvSkills.categorized && cvSkills.categorized.soft_skills) {
      return cvSkills.categorized.soft_skills.skills.map(skill => skill.toLowerCase());
    }
    return [];
  }

  findSoftSkillMatch(required, cvSoftSkills) {
    const requiredLower = required.toLowerCase();
    
    // Matching exact
    const exactMatch = cvSoftSkills.find(skill => skill === requiredLower);
    if (exactMatch) {
      return { skill: exactMatch, score: 1.0 };
    }
    
    // Matching sémantique
    const bestMatch = cvSoftSkills.reduce((best, skill) => {
      const similarity = this.calculateSimilarity(requiredLower, skill);
      return similarity > best.score ? { skill, score: similarity } : best;
    }, { skill: null, score: 0 });
    
    return bestMatch;
  }

  extractSalaryExpectations(cvData) {
    // Recherche dans les informations personnelles
    if (cvData.personal && cvData.personal.salary) {
      return cvData.personal.salary;
    }
    
    // Recherche dans le texte du CV (à implémenter)
    return null;
  }

  parseSalaryRange(salaryText) {
    if (!salaryText) return null;
    
    const numbers = salaryText.match(/\d+/g);
    if (!numbers || numbers.length < 2) return null;
    
    const min = parseInt(numbers[0]);
    const max = parseInt(numbers[1]);
    
    return { min, max };
  }

  calculateSalaryOverlap(cvRange, jobRange) {
    const overlapMin = Math.max(cvRange.min, jobRange.min);
    const overlapMax = Math.min(cvRange.max, jobRange.max);
    
    if (overlapMin > overlapMax) return 0;
    
    const overlap = overlapMax - overlapMin;
    const cvRangeSize = cvRange.max - cvRange.min;
    const jobRangeSize = jobRange.max - jobRange.min;
    const totalRange = Math.max(cvRange.max, jobRange.max) - Math.min(cvRange.min, jobRange.min);
    
    return overlap / totalRange;
  }

  getWeightsForJobType(jobType) {
    return this.jobTypeWeights[jobType] || this.defaultWeights;
  }

  identifyStrengths(scores) {
    const strengths = [];
    
    for (const [criterion, score] of Object.entries(scores)) {
      if (score.score >= 80) {
        strengths.push({
          criterion,
          score: score.score,
          description: this.getCriterionDescription(criterion)
        });
      }
    }
    
    return strengths;
  }

  identifyWeaknesses(scores) {
    const weaknesses = [];
    
    for (const [criterion, score] of Object.entries(scores)) {
      if (score.score < 50) {
        weaknesses.push({
          criterion,
          score: score.score,
          description: this.getCriterionDescription(criterion),
          improvement: this.getImprovementSuggestion(criterion)
        });
      }
    }
    
    return weaknesses;
  }

  determineFitLevel(overallScore) {
    if (overallScore >= 90) return 'excellent';
    if (overallScore >= 80) return 'very_good';
    if (overallScore >= 70) return 'good';
    if (overallScore >= 60) return 'fair';
    if (overallScore >= 50) return 'poor';
    return 'very_poor';
  }

  calculateConfidence(scores) {
    const confidences = Object.values(scores).map(score => score.confidence || 0.5);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.round(avgConfidence * 100) / 100;
  }

  getCriterionDescription(criterion) {
    const descriptions = {
      skills: 'Compétences techniques',
      experience: 'Expérience professionnelle',
      education: 'Formation académique',
      softSkills: 'Compétences comportementales',
      location: 'Localisation géographique',
      salary: 'Attentes salariales'
    };
    return descriptions[criterion] || criterion;
  }

  getImprovementSuggestion(criterion) {
    const suggestions = {
      skills: 'Développer les compétences techniques manquantes',
      experience: 'Acquérir plus d\'expérience dans le domaine',
      education: 'Considérer une formation complémentaire',
      softSkills: 'Travailler sur les compétences comportementales',
      location: 'Envisager une mobilité géographique',
      salary: 'Ajuster les attentes salariales'
    };
    return suggestions[criterion] || 'Améliorer ce critère';
  }

  // Méthodes de calcul de confiance
  calculateSkillConfidence(matched, total) {
    return Math.min(1, matched.length / Math.max(total, 1));
  }

  calculateExperienceConfidence(years, expCount) {
    return Math.min(1, (years / 10) * (expCount / 5));
  }

  calculateEducationConfidence(eduCount) {
    return Math.min(1, eduCount / 3);
  }

  calculateSoftSkillsConfidence(matched, total) {
    return Math.min(1, matched.length / Math.max(total, 1));
  }

  calculateSalaryConfidence(cvRange, jobRange) {
    const rangeSize = Math.max(cvRange.max - cvRange.min, jobRange.max - jobRange.min);
    return Math.min(1, rangeSize / 20000); // Plus la fourchette est large, plus la confiance est faible
  }
}

module.exports = MatchingService;
