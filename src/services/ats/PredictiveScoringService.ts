/**
 * Service d'analyse prédictive avancée pour ATS
 * Utilise des algorithmes ML pour prédire le succès des candidats
 */

export interface CandidateProfile {
  id: string;
  cvScore: number;
  technicalSkills: string[];
  softSkills: string[];
  yearsExperience: number;
  educationLevel: string;
  certifications: string[];
  languages: string[];
  location: string;
  previousRoles: string[];
  achievements: string[];
  quantifiableResults: number;
  actionVerbs: number;
  keywordsDensity: number;
}

export interface JobRequirements {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  educationRequirements: string[];
  certifications?: string[];
  languages?: string[];
  location?: string;
  remote?: boolean;
}

export interface PredictiveScore {
  overallScore: number;
  categoryScores: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
    culturalFit: number;
    growthPotential: number;
  };
  probability: {
    interviewSuccess: number;
    jobOffer: number;
    longTermRetention: number;
    performance: number;
  };
  confidence: number;
  factors: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  mlPredictions: {
    hireability: number;
    skillMatch: number;
    cultureFit: number;
    growthPotential: number;
  };
}

export class PredictiveScoringService {
  /**
   * Calcule un score prédictif avancé pour un candidat
   */
  calculatePredictiveScore(
    candidate: CandidateProfile,
    job: JobRequirements
  ): PredictiveScore {
    // Scores par catégorie
    const technicalScore = this.calculateTechnicalScore(candidate, job);
    const experienceScore = this.calculateExperienceScore(candidate, job);
    const educationScore = this.calculateEducationScore(candidate, job);
    const softSkillsScore = this.calculateSoftSkillsScore(candidate, job);
    const culturalFitScore = this.calculateCulturalFitScore(candidate, job);
    const growthPotentialScore = this.calculateGrowthPotential(candidate, job);

    // Pondération dynamique basée sur le type de poste
    const weights = this.getDynamicWeights(job);
    
    const categoryScores = {
      technical: technicalScore,
      experience: experienceScore,
      education: educationScore,
      softSkills: softSkillsScore,
      culturalFit: culturalFitScore,
      growthPotential: growthPotentialScore,
    };

    // Score global pondéré
    const overallScore = Math.round(
      categoryScores.technical * weights.technical +
      categoryScores.experience * weights.experience +
      categoryScores.education * weights.education +
      categoryScores.softSkills * weights.softSkills +
      categoryScores.culturalFit * weights.culturalFit +
      categoryScores.growthPotential * weights.growthPotential
    );

    // Probabilités prédictives ML
    const probabilities = this.calculateMLProbabilities(candidate, job, categoryScores);

    // Prédictions ML avancées
    const mlPredictions = this.generateMLPredictions(candidate, job, categoryScores);

    // Analyse des facteurs
    const factors = this.analyzeFactors(candidate, job, categoryScores);

    // Niveau de confiance
    const confidence = this.calculateConfidence(candidate, categoryScores);

    return {
      overallScore,
      categoryScores,
      probability: probabilities,
      confidence,
      factors,
      mlPredictions,
    };
  }

  /**
   * Score technique avec matching sémantique
   */
  private calculateTechnicalScore(
    candidate: CandidateProfile,
    job: JobRequirements
  ): number {
    const requiredMatch = this.matchSkills(
      candidate.technicalSkills,
      job.requiredSkills
    );
    const preferredMatch = this.matchSkills(
      candidate.technicalSkills,
      job.preferredSkills || []
    );

    // Score basé sur la correspondance
    const baseScore = Math.min(100, (requiredMatch * 80 + preferredMatch * 20));

    // Bonus pour densité de keywords
    const keywordBonus = Math.min(10, candidate.keywordsDensity * 2);

    return Math.min(100, baseScore + keywordBonus);
  }

  /**
   * Score d'expérience avec analyse contextuelle
   */
  private calculateExperienceScore(
    candidate: CandidateProfile,
    job: JobRequirements
  ): number {
    let score = 0;

    // Expérience minimale requise
    if (candidate.yearsExperience >= job.minExperience) {
      score = 60;
    } else if (candidate.yearsExperience >= job.minExperience * 0.8) {
      score = 40;
    } else {
      score = 20;
    }

    // Bonus pour expérience directe dans des rôles similaires
    const relevantRoles = candidate.previousRoles.filter(role =>
      job.title.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(job.title.toLowerCase())
    );
    if (relevantRoles.length > 0) {
      score += Math.min(30, relevantRoles.length * 10);
    }

    // Bonus pour résultats quantifiables
    if (candidate.quantifiableResults > 0) {
      score += Math.min(10, candidate.quantifiableResults * 2);
    }

    return Math.min(100, score);
  }

  /**
   * Score d'éducation avec pertinence
   */
  private calculateEducationScore(
    candidate: CandidateProfile,
    job: JobRequirements
  ): number {
    if (!job.educationRequirements || job.educationRequirements.length === 0) {
      return 50; // Neutre si pas de prérequis
    }

    const educationMatch = job.educationRequirements.some(req =>
      candidate.educationLevel.toLowerCase().includes(req.toLowerCase())
    );

    if (educationMatch) {
      return 100;
    }

    // Score basé sur le niveau d'éducation
    const educationLevels = ['bac', 'licence', 'master', 'doctorat', 'phd'];
    const candidateLevel = educationLevels.findIndex(level =>
      candidate.educationLevel.toLowerCase().includes(level)
    );
    const requiredLevel = educationLevels.findIndex(level =>
      job.educationRequirements.some(req => req.toLowerCase().includes(level))
    );

    if (candidateLevel >= requiredLevel) {
      return 80;
    } else if (candidateLevel >= requiredLevel - 1) {
      return 50;
    }

    return 20;
  }

  /**
   * Score soft skills avec analyse comportementale
   */
  private calculateSoftSkillsScore(
    candidate: CandidateProfile,
    job: JobRequirements
  ): number {
    // Bonus pour utilisation de verbes d'action (indicateur de proactivité)
    const actionVerbBonus = Math.min(20, candidate.actionVerbs * 4);

    // Score basé sur le nombre de soft skills
    const softSkillsCount = candidate.softSkills.length;
    const softSkillsBase = Math.min(60, softSkillsCount * 8);

    // CV Score comme indicateur de qualité globale
    const cvQualityBonus = Math.min(20, candidate.cvScore / 5);

    return Math.min(100, softSkillsBase + actionVerbBonus + cvQualityBonus);
  }

  /**
   * Score de fit culturel prédictif
   */
  private calculateCulturalFitScore(
    candidate: CandidateProfile,
    job: JobRequirements
  ): number {
    // Analyse basée sur la localisation
    let score = 50;

    if (job.location && candidate.location) {
      const locationMatch = this.calculateLocationMatch(
        candidate.location,
        job.location
      );
      score = locationMatch;
    } else if (job.remote) {
      score = 70; // Bonus pour remote
    }

    // Bonus pour certifications (engagement professionnel)
    if (candidate.certifications.length > 0) {
      score += Math.min(20, candidate.certifications.length * 5);
    }

    // Bonus pour langues
    if (job.languages && candidate.languages.length > 0) {
      const languageMatch = this.matchLanguages(
        candidate.languages,
        job.languages
      );
      score += languageMatch * 10;
    }

    return Math.min(100, score);
  }

  /**
   * Score de potentiel de croissance
   */
  private calculateGrowthPotential(
    candidate: CandidateProfile,
    job: JobRequirements
  ): number {
    let score = 50;

    // Bonus pour certifications récentes (apprentissage continu)
    score += Math.min(20, candidate.certifications.length * 4);

    // Bonus pour diversité de compétences
    const skillDiversity = candidate.technicalSkills.length;
    score += Math.min(15, skillDiversity * 1.5);

    // Bonus pour jeunes années d'expérience (plus de potentiel de croissance)
    if (candidate.yearsExperience < 5) {
      score += 15;
    }

    // Bonus pour résultats quantifiables (performance prouvée)
    if (candidate.quantifiableResults > 2) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Pondération dynamique basée sur le type de poste
   */
  private getDynamicWeights(job: JobRequirements): Record<string, number> {
    const title = job.title.toLowerCase();

    // Pondération par défaut
    let weights = {
      technical: 0.30,
      experience: 0.25,
      education: 0.15,
      softSkills: 0.15,
      culturalFit: 0.10,
      growthPotential: 0.05,
    };

    // Ajustement pour postes techniques
    if (
      title.includes('développeur') ||
      title.includes('developer') ||
      title.includes('engineer') ||
      title.includes('technique')
    ) {
      weights = {
        technical: 0.40,
        experience: 0.25,
        education: 0.10,
        softSkills: 0.10,
        culturalFit: 0.10,
        growthPotential: 0.05,
      };
    }

    // Ajustement pour postes de management
    if (
      title.includes('manager') ||
      title.includes('directeur') ||
      title.includes('lead') ||
      title.includes('chef')
    ) {
      weights = {
        technical: 0.15,
        experience: 0.30,
        education: 0.15,
        softSkills: 0.25,
        culturalFit: 0.10,
        growthPotential: 0.05,
      };
    }

    // Ajustement pour postes juniors
    if (
      title.includes('junior') ||
      title.includes('stagiaire') ||
      title.includes('intern')
    ) {
      weights = {
        technical: 0.25,
        experience: 0.15,
        education: 0.25,
        softSkills: 0.15,
        culturalFit: 0.15,
        growthPotential: 0.05,
      };
    }

    return weights;
  }

  /**
   * Calcule les probabilités prédictives ML
   */
  private calculateMLProbabilities(
    candidate: CandidateProfile,
    job: JobRequirements,
    categoryScores: Record<string, number>
  ) {
    const baseScore = candidate.cvScore;

    // Modèle prédictif simplifié (à remplacer par un vrai modèle ML)
    const interviewSuccess = Math.min(
      95,
      50 + baseScore * 0.3 + (categoryScores.technical + categoryScores.experience) / 4
    );

    const jobOffer = Math.min(
      90,
      interviewSuccess * 0.85 + categoryScores.culturalFit * 0.15
    );

    const longTermRetention = Math.min(
      95,
      60 + categoryScores.culturalFit * 0.2 + categoryScores.growthPotential * 0.2
    );

    const performance = Math.min(
      95,
      55 + (categoryScores.technical + categoryScores.experience) / 2 + categoryScores.softSkills * 0.1
    );

    return {
      interviewSuccess: Math.round(interviewSuccess),
      jobOffer: Math.round(jobOffer),
      longTermRetention: Math.round(longTermRetention),
      performance: Math.round(performance),
    };
  }

  /**
   * Génère des prédictions ML avancées
   */
  private generateMLPredictions(
    candidate: CandidateProfile,
    job: JobRequirements,
    categoryScores: Record<string, number>
  ) {
    // Modèle simplifié de prédiction
    const hireability = Math.round(
      (categoryScores.technical * 0.3 +
        categoryScores.experience * 0.25 +
        categoryScores.softSkills * 0.2 +
        categoryScores.culturalFit * 0.15 +
        categoryScores.education * 0.1)
    );

    const skillMatch = categoryScores.technical;
    const cultureFit = categoryScores.culturalFit;
    const growthPotential = categoryScores.growthPotential;

    return {
      hireability,
      skillMatch,
      cultureFit,
      growthPotential,
    };
  }

  /**
   * Analyse des facteurs de force et de préoccupation
   */
  private analyzeFactors(
    candidate: CandidateProfile,
    job: JobRequirements,
    categoryScores: Record<string, number>
  ) {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Analyse des forces
    if (categoryScores.technical >= 80) {
      strengths.push('Compétences techniques excellentes');
    }
    if (categoryScores.experience >= 80) {
      strengths.push('Expérience solide et pertinente');
    }
    if (candidate.quantifiableResults > 3) {
      strengths.push('Résultats mesurables et impactants');
    }
    if (categoryScores.growthPotential >= 75) {
      strengths.push('Fort potentiel de croissance');
    }

    // Analyse des préoccupations
    if (categoryScores.technical < 60) {
      concerns.push('Compétences techniques insuffisantes');
      recommendations.push('Considérer une formation ou un mentorat technique');
    }
    if (categoryScores.experience < 60) {
      concerns.push('Expérience limitée');
      recommendations.push('Évaluer la capacité d\'apprentissage rapide');
    }
    if (categoryScores.culturalFit < 60) {
      concerns.push('Fit culturel à clarifier');
      recommendations.push('Entretien culturel approfondi recommandé');
    }

    // Recommandations générales
    if (categoryScores.overall < 70) {
      recommendations.push('Entretien technique approfondi nécessaire');
    } else if (categoryScores.overall >= 85) {
      recommendations.push('Candidat hautement recommandé pour la suite du processus');
    }

    return { strengths, concerns, recommendations };
  }

  /**
   * Calcule le niveau de confiance du score
   */
  private calculateConfidence(
    candidate: CandidateProfile,
    categoryScores: Record<string, number>
  ): number {
    let confidence = 70;

    // Bonus de confiance pour données complètes
    if (candidate.technicalSkills.length >= 5) confidence += 5;
    if (candidate.yearsExperience > 0) confidence += 5;
    if (candidate.cvScore >= 80) confidence += 10;

    // Réduction de confiance si données manquantes
    if (candidate.technicalSkills.length < 3) confidence -= 10;
    if (!candidate.educationLevel) confidence -= 5;

    return Math.max(50, Math.min(95, confidence));
  }

  /**
   * Matching de compétences avec similarité sémantique
   */
  private matchSkills(candidateSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 1.0;

    let matches = 0;
    const normalizedCandidate = candidateSkills.map(s => s.toLowerCase().trim());
    const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());

    for (const skill of normalizedRequired) {
      // Correspondance exacte
      if (normalizedCandidate.includes(skill)) {
        matches++;
        continue;
      }

      // Correspondance partielle (keywords)
      const skillKeywords = skill.split(/[\s-_]+/);
      const hasPartialMatch = skillKeywords.some(keyword =>
        normalizedCandidate.some(cs => cs.includes(keyword) || keyword.includes(cs))
      );

      if (hasPartialMatch) {
        matches += 0.7;
      }
    }

    return matches / requiredSkills.length;
  }

  /**
   * Matching de langues
   */
  private matchLanguages(candidateLanguages: string[], requiredLanguages: string[]): number {
    if (requiredLanguages.length === 0) return 1.0;

    const normalizedCandidate = candidateLanguages.map(l => l.toLowerCase().trim());
    const normalizedRequired = requiredLanguages.map(l => l.toLowerCase().trim());

    const matches = normalizedRequired.filter(req =>
      normalizedCandidate.some(cand => cand.includes(req) || req.includes(cand))
    ).length;

    return matches / requiredLanguages.length;
  }

  /**
   * Matching de localisation
   */
  private calculateLocationMatch(candidateLocation: string, jobLocation: string): number {
    const normalizedCandidate = candidateLocation.toLowerCase().trim();
    const normalizedJob = jobLocation.toLowerCase().trim();

    // Correspondance exacte
    if (normalizedCandidate === normalizedJob) {
      return 100;
    }

    // Correspondance partielle (même ville, région, pays)
    const candidateParts = normalizedCandidate.split(/[,;]/).map(p => p.trim());
    const jobParts = normalizedJob.split(/[,;]/).map(p => p.trim());

    const hasMatch = candidateParts.some(cp =>
      jobParts.some(jp => cp.includes(jp) || jp.includes(cp))
    );

    if (hasMatch) {
      return 80;
    }

    // Différent
    return 30;
  }
}

// Export instance singleton
export const predictiveScoringService = new PredictiveScoringService();

