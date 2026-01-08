/**
 * Moteur de recommandations intelligentes basé sur ML
 * Génère des recommandations personnalisées pour candidats et recruteurs
 */

import { CandidateProfile, JobRequirements } from './PredictiveScoringService';
import { MatchResult } from './IntelligentMatchingService';

export interface Recommendation {
  id: string;
  type: 'job' | 'skill' | 'career_path' | 'training' | 'action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  estimatedImpact?: number;
}

export interface RecommendationContext {
  candidate?: CandidateProfile;
  job?: JobRequirements;
  match?: MatchResult;
  cvScore?: number;
  historicalData?: any;
  userPreferences?: any;
}

export class RecommendationEngine {
  /**
   * Génère des recommandations pour un candidat
   */
  generateCandidateRecommendations(
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 1. Recommandations de jobs
    const jobRecommendations = this.generateJobRecommendations(context);
    recommendations.push(...jobRecommendations);

    // 2. Recommandations de compétences
    const skillRecommendations = this.generateSkillRecommendations(context);
    recommendations.push(...skillRecommendations);

    // 3. Recommandations de carrière
    const careerRecommendations = this.generateCareerRecommendations(context);
    recommendations.push(...careerRecommendations);

    // 4. Recommandations de formations
    const trainingRecommendations = this.generateTrainingRecommendations(context);
    recommendations.push(...trainingRecommendations);

    // 5. Recommandations d'actions
    const actionRecommendations = this.generateActionRecommendations(context);
    recommendations.push(...actionRecommendations);

    // Trier par priorité et confiance
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.confidence - a.confidence;
    });
  }

  /**
   * Génère des recommandations de jobs
   */
  private generateJobRecommendations(
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!context.candidate) return recommendations;

    const candidate = context.candidate;
    const cvScore = context.cvScore || candidate.cvScore || 0;

    // Analyse du profil
    if (cvScore < 60) {
      recommendations.push({
        id: 'rec_job_low_score',
        type: 'action',
        title: 'Améliorez votre CV avant de postuler',
        description: 'Votre score CV est faible. Optimisez votre CV pour augmenter vos chances de succès.',
        priority: 'high',
        confidence: 90,
        category: 'cv_optimization',
        estimatedImpact: 40,
      });
    }

    // Recommandations basées sur l'expérience
    if (candidate.yearsExperience < 2) {
      recommendations.push({
        id: 'rec_job_junior',
        type: 'job',
        title: 'Postes Junior recommandés',
        description: 'Ciblez des postes junior pour maximiser vos chances avec votre niveau d\'expérience actuel.',
        priority: 'high',
        confidence: 85,
        category: 'job_matching',
        metadata: {
          suggestedLevel: 'junior',
          matchProbability: 75,
        },
      });
    } else if (candidate.yearsExperience >= 5) {
      recommendations.push({
        id: 'rec_job_senior',
        type: 'job',
        title: 'Postes Senior accessibles',
        description: 'Avec votre expérience, vous pouvez viser des postes senior ou de leadership.',
        priority: 'medium',
        confidence: 80,
        category: 'job_matching',
        metadata: {
          suggestedLevel: 'senior',
          matchProbability: 70,
        },
      });
    }

    // Recommandations basées sur les compétences
    if (candidate.technicalSkills.length > 5) {
      const topSkills = candidate.technicalSkills.slice(0, 3);
      recommendations.push({
        id: 'rec_job_skills_match',
        type: 'job',
        title: `Postes nécessitant ${topSkills.join(', ')}`,
        description: `Recherchez des postes qui utilisent vos compétences principales : ${topSkills.join(', ')}`,
        priority: 'medium',
        confidence: 75,
        category: 'job_matching',
        metadata: {
          requiredSkills: topSkills,
        },
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations de compétences
   */
  private generateSkillRecommendations(
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!context.candidate) return recommendations;

    const candidate = context.candidate;
    const currentSkills = candidate.technicalSkills.map(s => s.toLowerCase());

    // Compétences tendance à acquérir
    const trendingSkills = [
      { name: 'TypeScript', category: 'programming', trend: 'up' },
      { name: 'Next.js', category: 'frontend', trend: 'up' },
      { name: 'Docker', category: 'devops', trend: 'up' },
      { name: 'Kubernetes', category: 'devops', trend: 'up' },
      { name: 'AWS', category: 'cloud', trend: 'up' },
      { name: 'GraphQL', category: 'backend', trend: 'up' },
    ];

    for (const skill of trendingSkills) {
      const hasSkill = currentSkills.some(s => s.includes(skill.name.toLowerCase()));
      
      if (!hasSkill && this.isRelevantSkill(skill, candidate)) {
        recommendations.push({
          id: `rec_skill_${skill.name.toLowerCase().replace(/\s+/g, '_')}`,
          type: 'skill',
          title: `Apprendre ${skill.name}`,
          description: `${skill.name} est une compétence en forte demande dans votre domaine. L'acquérir augmenterait votre employabilité.`,
          priority: 'medium',
          confidence: 70,
          category: skill.category,
          metadata: {
            skillName: skill.name,
            trend: skill.trend,
            estimatedTimeToLearn: '2-3 mois',
          },
          estimatedImpact: 25,
        });
      }
    }

    return recommendations;
  }

  /**
   * Vérifie si une compétence est pertinente pour le candidat
   */
  private isRelevantSkill(skill: { name: string; category: string }, candidate: CandidateProfile): boolean {
    const candidateCategories = this.getCandidateCategories(candidate);
    return candidateCategories.some(cat => 
      skill.category.includes(cat) || cat.includes(skill.category)
    );
  }

  /**
   * Obtient les catégories du candidat
   */
  private getCandidateCategories(candidate: CandidateProfile): string[] {
    const categories: string[] = [];
    
    if (candidate.technicalSkills.some(s => ['React', 'Vue', 'Angular'].includes(s))) {
      categories.push('frontend');
    }
    
    if (candidate.technicalSkills.some(s => ['Node', 'Django', 'Spring'].some(tech => s.includes(tech)))) {
      categories.push('backend');
    }
    
    if (candidate.technicalSkills.some(s => ['Docker', 'Kubernetes'].includes(s))) {
      categories.push('devops');
    }
    
    if (candidate.technicalSkills.some(s => ['AWS', 'Azure', 'GCP'].includes(s))) {
      categories.push('cloud');
    }

    return categories.length > 0 ? categories : ['general'];
  }

  /**
   * Génère des recommandations de carrière
   */
  private generateCareerRecommendations(
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!context.candidate) return recommendations;

    const candidate = context.candidate;

    // Recommandations basées sur l'expérience
    if (candidate.yearsExperience >= 3 && candidate.yearsExperience < 5) {
      recommendations.push({
        id: 'rec_career_mid_senior',
        type: 'career_path',
        title: 'Transition vers Senior',
        description: 'Vous êtes prêt pour des postes senior. Développez vos compétences de leadership et technique avancées.',
        priority: 'medium',
        confidence: 75,
        category: 'career_development',
        estimatedImpact: 30,
      });
    }

    // Recommandations basées sur les compétences
    if (candidate.technicalSkills.length >= 10) {
      recommendations.push({
        id: 'rec_career_specialist',
        type: 'career_path',
        title: 'Devenir Expert Technique',
        description: 'Avec votre large palette de compétences, considérez devenir un expert technique ou architecte.',
        priority: 'low',
        confidence: 65,
        category: 'career_development',
        estimatedImpact: 20,
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations de formations
   */
  private generateTrainingRecommendations(
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!context.candidate) return recommendations;

    const candidate = context.candidate;

    // Si peu de certifications
    if (candidate.certifications.length < 2 && candidate.yearsExperience < 5) {
      recommendations.push({
        id: 'rec_training_certifications',
        type: 'training',
        title: 'Obtenir des certifications',
        description: 'Les certifications renforcent votre crédibilité et augmentent votre employabilité.',
        priority: 'medium',
        confidence: 70,
        category: 'professional_development',
        metadata: {
          suggestedCertifications: this.suggestCertifications(candidate),
        },
        estimatedImpact: 25,
      });
    }

    return recommendations;
  }

  /**
   * Suggère des certifications pertinentes
   */
  private suggestCertifications(candidate: CandidateProfile): string[] {
    const suggestions: string[] = [];

    if (candidate.technicalSkills.some(s => s.toLowerCase().includes('aws'))) {
      suggestions.push('AWS Certified Solutions Architect');
    }

    if (candidate.technicalSkills.some(s => s.toLowerCase().includes('react'))) {
      suggestions.push('React Developer Certification');
    }

    if (candidate.technicalSkills.some(s => s.toLowerCase().includes('node'))) {
      suggestions.push('Node.js Application Development');
    }

    return suggestions.length > 0 ? suggestions : ['Certification technique générale'];
  }

  /**
   * Génère des recommandations d'actions
   */
  private generateActionRecommendations(
    context: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!context.candidate) return recommendations;

    const candidate = context.candidate;
    const cvScore = context.cvScore || candidate.cvScore || 0;

    // Actions prioritaires basées sur le score CV
    if (cvScore < 70) {
      recommendations.push({
        id: 'rec_action_improve_cv',
        type: 'action',
        title: 'Action prioritaire : Optimiser le CV',
        description: `Votre CV a un score de ${cvScore}/100. Focus sur : ajouter des compétences, inclure des résultats chiffrés, optimiser les mots-clés.`,
        priority: 'high',
        confidence: 95,
        category: 'cv_optimization',
        estimatedImpact: 35,
      });
    }

    // Actions basées sur les données manquantes
    if (!candidate.linkedIn) {
      recommendations.push({
        id: 'rec_action_add_linkedin',
        type: 'action',
        title: 'Ajouter votre profil LinkedIn',
        description: 'Un profil LinkedIn complet augmente votre visibilité professionnelle de 40%.',
        priority: 'high',
        confidence: 85,
        category: 'profile_completion',
        estimatedImpact: 15,
      });
    }

    if (candidate.quantifiableResults < 2) {
      recommendations.push({
        id: 'rec_action_add_metrics',
        type: 'action',
        title: 'Ajouter des résultats chiffrés',
        description: 'Incluez au moins 3 résultats quantifiables pour montrer votre impact concret.',
        priority: 'high',
        confidence: 90,
        category: 'cv_optimization',
        estimatedImpact: 20,
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations pour un recruteur
   */
  generateRecruiterRecommendations(
    matches: MatchResult[],
    context?: RecommendationContext
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Top candidats recommandés
    const topMatches = matches
      .filter(m => m.recommendation === 'strong_recommend' || m.overallMatch >= 85)
      .slice(0, 5);

    if (topMatches.length > 0) {
      recommendations.push({
        id: 'rec_recruiter_top_candidates',
        type: 'action',
        title: `${topMatches.length} candidats hautement recommandés`,
        description: `Ces candidats ont un score de matching élevé et méritent une attention prioritaire.`,
        priority: 'high',
        confidence: 90,
        category: 'candidate_review',
        metadata: {
          candidateCount: topMatches.length,
          averageScore: topMatches.reduce((sum, m) => sum + m.overallMatch, 0) / topMatches.length,
        },
        estimatedImpact: 50,
      });
    }

    // Candidats nécessitant une révision
    const needsReview = matches.filter(
      m => m.overallMatch >= 60 && m.overallMatch < 75 && m.concerns.length > 0
    );

    if (needsReview.length > 0) {
      recommendations.push({
        id: 'rec_recruiter_review_needed',
        type: 'action',
        title: `${needsReview.length} candidats nécessitent une révision`,
        description: 'Ces candidats ont un potentiel mais nécessitent une évaluation approfondie.',
        priority: 'medium',
        confidence: 75,
        category: 'candidate_review',
        estimatedImpact: 30,
      });
    }

    return recommendations;
  }
}

// Export instance singleton
export const recommendationEngine = new RecommendationEngine();

