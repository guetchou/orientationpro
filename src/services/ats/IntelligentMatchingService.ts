/**
 * Service de matching intelligent multi-critères
 * Utilise des algorithmes avancés pour matcher candidats et postes
 */

import { PredictiveScoringService, CandidateProfile, JobRequirements } from './PredictiveScoringService';

export interface MatchResult {
  candidateId: string;
  jobId: string;
  overallMatch: number;
  categoryMatches: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
    culturalFit: number;
    growthPotential: number;
  };
  compatibilityScore: number;
  recommendation: 'strong_recommend' | 'recommend' | 'consider' | 'not_recommended';
  matchReasons: string[];
  concerns: string[];
  suggestedInterviewQuestions: string[];
  estimatedSalaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  timelineRecommendation: {
    stage: 'phone_screen' | 'technical_test' | 'interview' | 'final';
    estimatedDays: number;
  };
}

export interface MatchingConfig {
  weights?: {
    technical?: number;
    experience?: number;
    education?: number;
    softSkills?: number;
    culturalFit?: number;
    growthPotential?: number;
  };
  minMatchScore?: number;
  prioritizeSkills?: boolean;
  considerGrowthPotential?: boolean;
}

export class IntelligentMatchingService {
  private predictiveScoring: PredictiveScoringService;

  constructor() {
    this.predictiveScoring = new PredictiveScoringService();
  }

  /**
   * Match un candidat avec un poste
   */
  matchCandidateToJob(
    candidate: CandidateProfile,
    job: JobRequirements,
    config: MatchingConfig = {}
  ): MatchResult {
    // Calcul du score prédictif
    const predictiveScore = this.predictiveScoring.calculatePredictiveScore(candidate, job);

    // Score de compatibilité global
    const compatibilityScore = this.calculateCompatibilityScore(candidate, job, predictiveScore);

    // Recommandation
    const recommendation = this.getRecommendation(predictiveScore.overallScore, compatibilityScore);

    // Raisons du match
    const matchReasons = this.identifyMatchReasons(candidate, job, predictiveScore);

    // Préoccupations
    const concerns = predictiveScore.factors.concerns;

    // Questions d'entretien suggérées
    const suggestedQuestions = this.generateInterviewQuestions(candidate, job, predictiveScore);

    // Fourchette salariale estimée
    const salaryRange = this.estimateSalaryRange(candidate, job);

    // Recommandation de timeline
    const timelineRecommendation = this.getTimelineRecommendation(predictiveScore.overallScore);

    return {
      candidateId: candidate.id,
      jobId: job.id,
      overallMatch: predictiveScore.overallScore,
      categoryMatches: predictiveScore.categoryScores,
      compatibilityScore,
      recommendation,
      matchReasons,
      concerns,
      suggestedInterviewQuestions: suggestedQuestions,
      estimatedSalaryRange: salaryRange,
      timelineRecommendation,
    };
  }

  /**
   * Match multiple candidats avec un poste (ranking)
   */
  rankCandidatesForJob(
    candidates: CandidateProfile[],
    job: JobRequirements,
    config: MatchingConfig = {}
  ): MatchResult[] {
    const matches = candidates.map(candidate =>
      this.matchCandidateToJob(candidate, job, config)
    );

    // Trier par score de compatibilité décroissant
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  /**
   * Match un candidat avec multiple postes (recommendations)
   */
  findMatchingJobsForCandidate(
    candidate: CandidateProfile,
    jobs: JobRequirements[],
    config: MatchingConfig = {}
  ): MatchResult[] {
    const matches = jobs.map(job =>
      this.matchCandidateToJob(candidate, job, config)
    );

    // Filtrer par score minimum si configuré
    const minScore = config.minMatchScore || 60;
    const filtered = matches.filter(m => m.overallMatch >= minScore);

    // Trier par score décroissant
    return filtered.sort((a, b) => b.overallMatch - a.overallMatch);
  }

  /**
   * Calcule le score de compatibilité global
   */
  private calculateCompatibilityScore(
    candidate: CandidateProfile,
    job: JobRequirements,
    predictiveScore: any
  ): number {
    // Score de base (moyenne pondérée)
    let compatibility = predictiveScore.overallScore;

    // Bonus pour correspondance parfaite de compétences clés
    const keySkillsMatch = this.calculateKeySkillsMatch(candidate, job);
    if (keySkillsMatch >= 0.9) {
      compatibility += 5;
    }

    // Bonus pour expérience directe
    const directExperience = candidate.previousRoles.some(role =>
      role.toLowerCase().includes(job.title.toLowerCase())
    );
    if (directExperience) {
      compatibility += 3;
    }

    // Bonus pour certifications pertinentes
    if (job.certifications && candidate.certifications.length > 0) {
      const certMatch = this.matchSkills(candidate.certifications, job.certifications);
      if (certMatch > 0.5) {
        compatibility += 2;
      }
    }

    // Ajustement pour probabilité d'offre d'emploi
    const offerProbability = predictiveScore.probability.jobOffer / 100;
    compatibility = compatibility * 0.7 + (compatibility * offerProbability * 0.3);

    return Math.min(100, Math.round(compatibility));
  }

  /**
   * Obtient la recommandation basée sur les scores
   */
  private getRecommendation(
    overallScore: number,
    compatibilityScore: number
  ): 'strong_recommend' | 'recommend' | 'consider' | 'not_recommended' {
    const averageScore = (overallScore + compatibilityScore) / 2;

    if (averageScore >= 85) {
      return 'strong_recommend';
    } else if (averageScore >= 70) {
      return 'recommend';
    } else if (averageScore >= 60) {
      return 'consider';
    } else {
      return 'not_recommended';
    }
  }

  /**
   * Identifie les raisons du match
   */
  private identifyMatchReasons(
    candidate: CandidateProfile,
    job: JobRequirements,
    predictiveScore: any
  ): string[] {
    const reasons: string[] = [];

    if (predictiveScore.categoryScores.technical >= 85) {
      reasons.push('Compétences techniques exceptionnelles');
    } else if (predictiveScore.categoryScores.technical >= 70) {
      reasons.push('Compétences techniques solides');
    }

    if (predictiveScore.categoryScores.experience >= 85) {
      reasons.push('Expérience pertinente et substantielle');
    }

    if (predictiveScore.categoryScores.growthPotential >= 80) {
      reasons.push('Fort potentiel de croissance et développement');
    }

    if (predictiveScore.probability.jobOffer >= 80) {
      reasons.push('Probabilité élevée de succès dans le processus');
    }

    if (candidate.quantifiableResults > 2) {
      reasons.push('Historique de résultats mesurables');
    }

    const directExperience = candidate.previousRoles.some(role =>
      role.toLowerCase().includes(job.title.toLowerCase())
    );
    if (directExperience) {
      reasons.push('Expérience directe dans un rôle similaire');
    }

    return reasons;
  }

  /**
   * Génère des questions d'entretien personnalisées
   */
  private generateInterviewQuestions(
    candidate: CandidateProfile,
    job: JobRequirements,
    predictiveScore: any
  ): string[] {
    const questions: string[] = [];

    // Questions basées sur les faiblesses détectées
    if (predictiveScore.categoryScores.technical < 70) {
      questions.push(`Pouvez-vous détailler votre expérience avec ${job.requiredSkills[0]} ?`);
      questions.push('Comment avez-vous résolu un défi technique récent ?');
    }

    if (predictiveScore.categoryScores.experience < 70) {
      questions.push('Comment vos expériences passées vous préparent-elles pour ce rôle ?');
    }

    if (predictiveScore.categoryScores.softSkills < 70) {
      questions.push('Pouvez-vous donner un exemple de travail d\'équipe ?');
      questions.push('Comment gérez-vous les situations de stress ou de conflit ?');
    }

    // Questions basées sur les forces
    if (candidate.quantifiableResults > 0) {
      questions.push('Pouvez-vous détailler l\'un de vos résultats quantifiables mentionnés dans votre CV ?');
    }

    // Questions génériques pertinentes
    questions.push(`Pourquoi êtes-vous intéressé par ce poste de ${job.title} ?`);
    questions.push('Comment voyez-vous votre évolution dans cette fonction ?');

    return questions.slice(0, 5); // Limiter à 5 questions
  }

  /**
   * Estime la fourchette salariale
   */
  private estimateSalaryRange(
    candidate: CandidateProfile,
    job: JobRequirements
  ): { min: number; max: number; currency: string } {
    // Estimation simplifiée basée sur l'expérience
    const baseSalary = this.getBaseSalaryForExperience(candidate.yearsExperience);
    
    // Ajustements
    let min = baseSalary * 0.85;
    let max = baseSalary * 1.25;

    // Bonus pour compétences rares
    const rareSkills = this.detectRareSkills(candidate.technicalSkills);
    if (rareSkills.length > 0) {
      min += 50000;
      max += 100000;
    }

    // Bonus pour certifications
    if (candidate.certifications.length > 2) {
      min += 20000;
      max += 40000;
    }

    return {
      min: Math.round(min),
      max: Math.round(max),
      currency: 'XAF', // Franc CFA
    };
  }

  /**
   * Obtient le salaire de base selon l'expérience
   */
  private getBaseSalaryForExperience(years: number): number {
    if (years < 2) return 1500000; // Junior
    if (years < 5) return 2500000; // Mid-level
    if (years < 10) return 4000000; // Senior
    return 6000000; // Expert
  }

  /**
   * Détecte les compétences rares/valuables
   */
  private detectRareSkills(skills: string[]): string[] {
    const rareSkills = [
      'kubernetes',
      'terraform',
      'machine learning',
      'blockchain',
      'microservices',
      'serverless',
    ];

    return skills.filter(skill =>
      rareSkills.some(rare => skill.toLowerCase().includes(rare))
    );
  }

  /**
   * Recommandation de timeline
   */
  private getTimelineRecommendation(overallScore: number): {
    stage: 'phone_screen' | 'technical_test' | 'interview' | 'final';
    estimatedDays: number;
  } {
    if (overallScore >= 85) {
      return {
        stage: 'technical_test',
        estimatedDays: 3,
      };
    } else if (overallScore >= 70) {
      return {
        stage: 'phone_screen',
        estimatedDays: 5,
      };
    } else if (overallScore >= 60) {
      return {
        stage: 'phone_screen',
        estimatedDays: 7,
      };
    } else {
      return {
        stage: 'phone_screen',
        estimatedDays: 10,
      };
    }
  }

  /**
   * Calcule le match des compétences clés
   */
  private calculateKeySkillsMatch(candidate: CandidateProfile, job: JobRequirements): number {
    if (job.requiredSkills.length === 0) return 1.0;

    const candidateLower = candidate.technicalSkills.map(s => s.toLowerCase());
    const requiredLower = job.requiredSkills.map(s => s.toLowerCase());

    let matches = 0;
    for (const required of requiredLower) {
      if (candidateLower.includes(required)) {
        matches++;
      } else {
        // Vérifier correspondance partielle
        const hasPartial = candidateLower.some(c =>
          c.includes(required) || required.includes(c)
        );
        if (hasPartial) {
          matches += 0.7;
        }
      }
    }

    return matches / job.requiredSkills.length;
  }

  /**
   * Matching de compétences (utilitaire)
   */
  private matchSkills(candidateSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 1.0;

    const candidateLower = candidateSkills.map(s => s.toLowerCase());
    const requiredLower = requiredSkills.map(s => s.toLowerCase());

    const matches = requiredLower.filter(req =>
      candidateLower.some(cand => cand.includes(req) || req.includes(cand))
    ).length;

    return matches / requiredSkills.length;
  }
}

// Export instance singleton
export const intelligentMatchingService = new IntelligentMatchingService();

