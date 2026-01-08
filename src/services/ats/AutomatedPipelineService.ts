/**
 * Service d'automatisation avancée du pipeline ATS
 * Gère les workflows automatisés pour le recrutement
 */

import { CandidateProfile, JobRequirements } from './PredictiveScoringService';
import { MatchResult } from './IntelligentMatchingService';

export type PipelineStage =
  | 'received'
  | 'screening'
  | 'phone_interview'
  | 'technical_test'
  | 'interview'
  | 'final_review'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface CandidateInPipeline {
  candidateId: string;
  jobId: string;
  currentStage: PipelineStage;
  matchScore: number;
  enteredAt: string;
  lastUpdated: string;
  nextActionDate?: string;
  assignedTo?: string;
  notes: string[];
  automationRules: string[];
}

export interface AutomationRule {
  id: string;
  name: string;
  condition: (candidate: CandidateInPipeline, match: MatchResult) => boolean;
  action: (candidate: CandidateInPipeline, match: MatchResult) => PipelineStage | null;
  priority: number;
}

export interface PipelineStats {
  totalCandidates: number;
  byStage: Record<PipelineStage, number>;
  averageTimeInStage: Record<PipelineStage, number>;
  conversionRate: Record<PipelineStage, number>;
  bottleneckStages: PipelineStage[];
}

export class AutomatedPipelineService {
  private automationRules: AutomationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialise les règles d'automatisation par défaut
   */
  private initializeDefaultRules(): void {
    // Règle 1: Auto-avance pour scores élevés
    this.addRule({
      id: 'auto_advance_high_score',
      name: 'Auto-avance pour candidats avec score élevé',
      condition: (candidate, match) => match.overallMatch >= 85,
      action: (candidate, match) => {
        if (candidate.currentStage === 'received') return 'screening';
        if (candidate.currentStage === 'screening') return 'phone_interview';
        return null;
      },
      priority: 1,
    });

    // Règle 2: Auto-rejet pour scores faibles
    this.addRule({
      id: 'auto_reject_low_score',
      name: 'Auto-rejet pour candidats avec score faible',
      condition: (candidate, match) => match.overallMatch < 50,
      action: () => 'rejected',
      priority: 2,
    });

    // Règle 3: Fast-track pour strong_recommend
    this.addRule({
      id: 'fast_track_strong_recommend',
      name: 'Fast-track pour recommandation forte',
      condition: (candidate, match) => match.recommendation === 'strong_recommend',
      action: (candidate, match) => {
        if (candidate.currentStage === 'screening') return 'phone_interview';
        if (candidate.currentStage === 'phone_interview') return 'technical_test';
        return null;
      },
      priority: 1,
    });

    // Règle 4: Alert pour candidats stagnants
    this.addRule({
      id: 'alert_stagnant_candidates',
      name: 'Alert pour candidats stagnants',
      condition: (candidate, match) => {
        const daysInStage = this.getDaysInStage(candidate);
        return daysInStage > 7 && candidate.currentStage !== 'hired' && candidate.currentStage !== 'rejected';
      },
      action: (candidate) => {
        // Ne change pas de stage, mais génère une alerte
        return null;
      },
      priority: 3,
    });

    // Règle 5: Auto-assign pour rôles spécifiques
    this.addRule({
      id: 'auto_assign_specialized',
      name: 'Auto-assign pour rôles spécialisés',
      condition: (candidate, match) => {
        // Exemple: auto-assign pour postes techniques à un recruteur technique
        return match.categoryMatches.technical >= 90;
      },
      action: (candidate) => {
        // Auto-assign logique (à implémenter selon votre système)
        return null;
      },
      priority: 2,
    });
  }

  /**
   * Ajoute une règle d'automatisation
   */
  addRule(rule: AutomationRule): void {
    this.automationRules.push(rule);
    // Trier par priorité
    this.automationRules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Traite un candidat dans le pipeline
   */
  processCandidate(
    candidate: CandidateInPipeline,
    match: MatchResult
  ): CandidateInPipeline {
    let updatedCandidate = { ...candidate };

    // Appliquer les règles d'automatisation
    for (const rule of this.automationRules) {
      if (rule.condition(candidate, match)) {
        const newStage = rule.action(candidate, match);
        
        if (newStage) {
          updatedCandidate.currentStage = newStage;
          updatedCandidate.lastUpdated = new Date().toISOString();
          updatedCandidate.automationRules.push(rule.name);
          
          // Calculer la date d'action suivante
          updatedCandidate.nextActionDate = this.calculateNextActionDate(newStage);
        }
      }
    }

    return updatedCandidate;
  }

  /**
   * Calcule les statistiques du pipeline
   */
  calculatePipelineStats(candidates: CandidateInPipeline[]): PipelineStats {
    const totalCandidates = candidates.length;
    
    // Compter par stage
    const byStage: Record<PipelineStage, number> = {
      received: 0,
      screening: 0,
      phone_interview: 0,
      technical_test: 0,
      interview: 0,
      final_review: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    candidates.forEach(c => {
      byStage[c.currentStage] = (byStage[c.currentStage] || 0) + 1;
    });

    // Temps moyen par stage
    const averageTimeInStage: Record<PipelineStage, number> = {
      received: 0,
      screening: 0,
      phone_interview: 0,
      technical_test: 0,
      interview: 0,
      final_review: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    // Taux de conversion par stage
    const conversionRate: Record<PipelineStage, number> = {
      received: 0,
      screening: 0,
      phone_interview: 0,
      technical_test: 0,
      interview: 0,
      final_review: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };

    // Identifier les goulots d'étranglement
    const bottleneckStages = this.identifyBottlenecks(candidates);

    return {
      totalCandidates,
      byStage,
      averageTimeInStage,
      conversionRate,
      bottleneckStages,
    };
  }

  /**
   * Identifie les goulots d'étranglement dans le pipeline
   */
  private identifyBottlenecks(candidates: CandidateInPipeline[]): PipelineStage[] {
    const bottlenecks: PipelineStage[] = [];
    const stageCounts: Record<PipelineStage, number> = {} as Record<PipelineStage, number>;
    const stageAvgTime: Record<PipelineStage, number> = {} as Record<PipelineStage, number>;

    // Calculer les comptes et temps moyens
    candidates.forEach(candidate => {
      const stage = candidate.currentStage;
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      
      const daysInStage = this.getDaysInStage(candidate);
      if (!stageAvgTime[stage]) {
        stageAvgTime[stage] = 0;
      }
      stageAvgTime[stage] += daysInStage;
    });

    // Identifier les goulots (stages avec beaucoup de candidats OU temps moyen élevé)
    Object.keys(stageCounts).forEach(stage => {
      const count = stageCounts[stage as PipelineStage];
      const avgTime = stageAvgTime[stage as PipelineStage] / count;
      
      // Goulot si > 20% des candidats OU temps moyen > 10 jours
      if (count > candidates.length * 0.2 || avgTime > 10) {
        bottlenecks.push(stage as PipelineStage);
      }
    });

    return bottlenecks;
  }

  /**
   * Calcule le nombre de jours dans le stage actuel
   */
  private getDaysInStage(candidate: CandidateInPipeline): number {
    const entered = new Date(candidate.enteredAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entered.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcule la date d'action suivante
   */
  private calculateNextActionDate(stage: PipelineStage): string {
    const daysToAdd: Record<PipelineStage, number> = {
      received: 1,
      screening: 2,
      phone_interview: 3,
      technical_test: 5,
      interview: 7,
      final_review: 10,
      offer: 14,
      hired: 0,
      rejected: 0,
    };

    const date = new Date();
    date.setDate(date.getDate() + (daysToAdd[stage] || 0));
    return date.toISOString();
  }

  /**
   * Génère des recommandations d'amélioration du pipeline
   */
  generatePipelineRecommendations(stats: PipelineStats): string[] {
    const recommendations: string[] = [];

    // Recommandations pour goulots d'étranglement
    if (stats.bottleneckStages.length > 0) {
      stats.bottleneckStages.forEach(stage => {
        recommendations.push(
          `Accélérer le traitement au stage "${stage}" - ${stats.byStage[stage]} candidats en attente`
        );
      });
    }

    // Recommandations pour taux de conversion faibles
    Object.entries(stats.conversionRate).forEach(([stage, rate]) => {
      if (rate < 50 && stage !== 'rejected' && stage !== 'hired') {
        recommendations.push(
          `Améliorer le taux de conversion au stage "${stage}" - actuellement ${rate}%`
        );
      }
    });

    // Recommandations générales
    if (stats.totalCandidates > 100) {
      recommendations.push('Considérer l\'automatisation supplémentaire pour gérer le volume');
    }

    return recommendations;
  }

  /**
   * Crée un workflow personnalisé
   */
  createCustomWorkflow(
    stages: PipelineStage[],
    rules: AutomationRule[]
  ): void {
    // Réinitialiser les règles
    this.automationRules = [];
    
    // Ajouter les règles personnalisées
    rules.forEach(rule => this.addRule(rule));
  }

  /**
   * Génère un rapport de pipeline
   */
  generatePipelineReport(candidates: CandidateInPipeline[]): {
    summary: PipelineStats;
    recommendations: string[];
    insights: string[];
  } {
    const stats = this.calculatePipelineStats(candidates);
    const recommendations = this.generatePipelineRecommendations(stats);
    const insights = this.generateInsights(stats, candidates);

    return {
      summary: stats,
      recommendations,
      insights,
    };
  }

  /**
   * Génère des insights sur le pipeline
   */
  private generateInsights(
    stats: PipelineStats,
    candidates: CandidateInPipeline[]
  ): string[] {
    const insights: string[] = [];

    // Insight sur le taux de succès
    const hiredCount = stats.byStage.hired || 0;
    const rejectedCount = stats.byStage.rejected || 0;
    const successRate = ((hiredCount / (hiredCount + rejectedCount)) * 100) || 0;
    
    if (successRate > 20) {
      insights.push(`Excellent taux de succès : ${successRate.toFixed(1)}%`);
    } else if (successRate < 10) {
      insights.push(`Taux de succès faible : ${successRate.toFixed(1)}% - Réviser les critères de sélection`);
    }

    // Insight sur le temps moyen
    const avgTimeToHire = candidates
      .filter(c => c.currentStage === 'hired')
      .reduce((sum, c) => sum + this.getDaysInStage(c), 0) / hiredCount || 0;

    if (avgTimeToHire > 30) {
      insights.push(`Temps moyen d'embauche élevé : ${avgTimeToHire.toFixed(1)} jours`);
    } else if (avgTimeToHire < 15) {
      insights.push(`Temps moyen d'embauche rapide : ${avgTimeToHire.toFixed(1)} jours`);
    }

    return insights;
  }
}

// Export instance singleton
export const automatedPipelineService = new AutomatedPipelineService();

