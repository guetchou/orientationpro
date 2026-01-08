/**
 * Service de benchmarking et comparaison pour ATS
 * Compare les candidats et les performances du système
 */

import { CandidateProfile } from './PredictiveScoringService';

export interface BenchmarkData {
  candidateId: string;
  score: number;
  categoryScores: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
    culturalFit: number;
    growthPotential: number;
  };
  percentile: number;
  rank: number;
  comparisonGroup: 'top_10' | 'top_25' | 'average' | 'below_average';
}

export interface BenchmarkStats {
  totalCandidates: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
}

export interface ComparisonResult {
  candidateId: string;
  comparisonWith: string[];
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
  ranking: {
    position: number;
    outOf: number;
    percentile: number;
  };
}

export class BenchmarkingService {
  /**
   * Calcule les statistiques de benchmark pour un groupe de candidats
   */
  calculateBenchmarkStats(candidates: CandidateProfile[]): BenchmarkStats {
    if (candidates.length === 0) {
      return {
        totalCandidates: 0,
        averageScore: 0,
        medianScore: 0,
        standardDeviation: 0,
        minScore: 0,
        maxScore: 0,
        percentiles: {
          p10: 0,
          p25: 0,
          p50: 0,
          p75: 0,
          p90: 0,
          p95: 0,
        },
      };
    }

    // Extraire les scores (on suppose que le score est dans cvScore pour l'exemple)
    const scores = candidates.map(c => c.cvScore || 0).sort((a, b) => a - b);

    // Calculs statistiques
    const sum = scores.reduce((a, b) => a + b, 0);
    const averageScore = sum / scores.length;
    const medianScore = this.calculateMedian(scores);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Calcul des percentiles
    const percentiles = {
      p10: this.calculatePercentile(scores, 10),
      p25: this.calculatePercentile(scores, 25),
      p50: this.calculatePercentile(scores, 50),
      p75: this.calculatePercentile(scores, 75),
      p90: this.calculatePercentile(scores, 90),
      p95: this.calculatePercentile(scores, 95),
    };

    return {
      totalCandidates: candidates.length,
      averageScore: Math.round(averageScore * 100) / 100,
      medianScore: Math.round(medianScore * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      minScore,
      maxScore,
      percentiles,
    };
  }

  /**
   * Calcule le benchmark pour un candidat spécifique
   */
  calculateBenchmark(
    candidate: CandidateProfile,
    allCandidates: CandidateProfile[]
  ): BenchmarkData {
    const candidateScore = candidate.cvScore || 0;
    const scores = allCandidates.map(c => c.cvScore || 0).sort((a, b) => b - a);

    // Trouver le rang
    const rank = scores.findIndex(score => score <= candidateScore) + 1;
    const totalCandidates = scores.length;

    // Calculer le percentile
    const percentile = Math.round(((totalCandidates - rank + 1) / totalCandidates) * 100);

    // Déterminer le groupe de comparaison
    const stats = this.calculateBenchmarkStats(allCandidates);
    let comparisonGroup: 'top_10' | 'top_25' | 'average' | 'below_average';

    if (candidateScore >= stats.percentiles.p90) {
      comparisonGroup = 'top_10';
    } else if (candidateScore >= stats.percentiles.p75) {
      comparisonGroup = 'top_25';
    } else if (candidateScore >= stats.percentiles.p50) {
      comparisonGroup = 'average';
    } else {
      comparisonGroup = 'below_average';
    }

    // Calculer les scores par catégorie (simplifié)
    const categoryScores = {
      technical: this.calculateCategoryScore(candidate, allCandidates, 'technical'),
      experience: this.calculateCategoryScore(candidate, allCandidates, 'experience'),
      education: this.calculateCategoryScore(candidate, allCandidates, 'education'),
      softSkills: this.calculateCategoryScore(candidate, allCandidates, 'softSkills'),
      culturalFit: this.calculateCategoryScore(candidate, allCandidates, 'culturalFit'),
      growthPotential: this.calculateCategoryScore(candidate, allCandidates, 'growthPotential'),
    };

    return {
      candidateId: candidate.id,
      score: candidateScore,
      categoryScores,
      percentile,
      rank,
      comparisonGroup,
    };
  }

  /**
   * Compare un candidat avec d'autres candidats
   */
  compareCandidate(
    candidate: CandidateProfile,
    comparisonCandidates: CandidateProfile[]
  ): ComparisonResult {
    const candidateScore = candidate.cvScore || 0;
    const advantages: string[] = [];
    const disadvantages: string[] = [];
    const recommendations: string[] = [];

    // Comparer avec les autres candidats
    const betterCandidates = comparisonCandidates.filter(
      c => (c.cvScore || 0) > candidateScore
    );
    const worseCandidates = comparisonCandidates.filter(
      c => (c.cvScore || 0) < candidateScore
    );

    // Identifier les avantages
    if (candidate.technicalSkills.length > betterCandidates.reduce((max, c) => 
      Math.max(max, c.technicalSkills.length), 0
    )) {
      advantages.push('Plus de compétences techniques que la moyenne');
    }

    if (betterCandidates.length > 0) {
      const avgExperience = betterCandidates.reduce((sum, c) => sum + c.yearsExperience, 0) / betterCandidates.length;
      if (candidate.yearsExperience > avgExperience) {
        advantages.push('Expérience supérieure à la moyenne');
      }
    }

    if (candidate.quantifiableResults > betterCandidates.reduce((max, c) => 
      Math.max(max, c.quantifiableResults), 0
    )) {
      advantages.push('Plus de résultats quantifiables');
    }

    // Identifier les désavantages
    if (candidate.technicalSkills.length < worseCandidates.reduce((min, c) => 
      Math.min(min, c.technicalSkills.length), Infinity
    )) {
      disadvantages.push('Moins de compétences techniques que certains candidats');
      recommendations.push('Ajouter plus de compétences techniques au CV');
    }

    if (worseCandidates.length > 0) {
      const avgExperience = worseCandidates.reduce((sum, c) => sum + c.yearsExperience, 0) / worseCandidates.length;
      if (candidate.yearsExperience < avgExperience) {
        disadvantages.push('Expérience inférieure à la moyenne');
        recommendations.push('Mettre en avant l\'expérience acquise');
      }
    }

    // Calculer le rang
    const allCandidates = [candidate, ...comparisonCandidates];
    const scores = allCandidates.map(c => c.cvScore || 0).sort((a, b) => b - a);
    const rank = scores.findIndex(score => score <= candidateScore) + 1;
    const totalCandidates = allCandidates.length;
    const percentile = Math.round(((totalCandidates - rank + 1) / totalCandidates) * 100);

    return {
      candidateId: candidate.id,
      comparisonWith: comparisonCandidates.map(c => c.id),
      advantages,
      disadvantages,
      recommendations,
      ranking: {
        position: rank,
        outOf: totalCandidates,
        percentile,
      },
    };
  }

  /**
   * Génère un rapport de benchmarking
   */
  generateBenchmarkReport(
    candidates: CandidateProfile[]
  ): {
    stats: BenchmarkStats;
    benchmarks: BenchmarkData[];
    insights: string[];
    recommendations: string[];
  } {
    const stats = this.calculateBenchmarkStats(candidates);
    const benchmarks = candidates.map(candidate =>
      this.calculateBenchmark(candidate, candidates)
    );

    // Générer des insights
    const insights = this.generateInsights(stats, benchmarks);

    // Générer des recommandations
    const recommendations = this.generateRecommendations(stats, benchmarks);

    return {
      stats,
      benchmarks,
      insights,
      recommendations,
    };
  }

  /**
   * Génère des insights basés sur les benchmarks
   */
  private generateInsights(
    stats: BenchmarkStats,
    benchmarks: BenchmarkData[]
  ): string[] {
    const insights: string[] = [];

    // Insight sur la distribution
    const topPerformers = benchmarks.filter(b => b.comparisonGroup === 'top_10').length;
    const percentage = (topPerformers / benchmarks.length) * 100;
    
    if (percentage > 20) {
      insights.push(`Excellent pool de candidats : ${topPerformers} dans le top 10% (${percentage.toFixed(1)}%)`);
    } else if (percentage < 5) {
      insights.push(`Peu de candidats dans le top 10% : ${topPerformers} (${percentage.toFixed(1)}%)`);
    }

    // Insight sur l'écart-type
    if (stats.standardDeviation > 20) {
      insights.push(`Grande variabilité des scores : écart-type de ${stats.standardDeviation}`);
    } else if (stats.standardDeviation < 10) {
      insights.push(`Scores homogènes : écart-type de ${stats.standardDeviation}`);
    }

    // Insight sur la médiane vs moyenne
    const diff = Math.abs(stats.medianScore - stats.averageScore);
    if (diff > 5) {
      insights.push(`Distribution asymétrique : médiane (${stats.medianScore}) vs moyenne (${stats.averageScore})`);
    }

    return insights;
  }

  /**
   * Génère des recommandations basées sur les benchmarks
   */
  private generateRecommendations(
    stats: BenchmarkStats,
    benchmarks: BenchmarkData[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommandation pour les candidats en dessous de la moyenne
    const belowAverage = benchmarks.filter(b => b.comparisonGroup === 'below_average').length;
    const percentage = (belowAverage / benchmarks.length) * 100;
    
    if (percentage > 30) {
      recommendations.push(`Améliorer les critères de sélection : ${percentage.toFixed(1)}% des candidats en dessous de la moyenne`);
    }

    // Recommandation pour l'écart de performance
    if (stats.maxScore - stats.minScore > 50) {
      recommendations.push('Écart important entre les meilleurs et moins bons candidats - affiner les critères de sélection');
    }

    // Recommandation générale
    if (stats.averageScore < 60) {
      recommendations.push('Score moyen faible - réviser les critères de sélection ou améliorer l\'attraction des candidats');
    }

    return recommendations;
  }

  /**
   * Calcule la médiane
   */
  private calculateMedian(sortedScores: number[]): number {
    const mid = Math.floor(sortedScores.length / 2);
    return sortedScores.length % 2 === 0
      ? (sortedScores[mid - 1] + sortedScores[mid]) / 2
      : sortedScores[mid];
  }

  /**
   * Calcule un percentile
   */
  private calculatePercentile(sortedScores: number[], percentile: number): number {
    if (sortedScores.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedScores.length) - 1;
    return sortedScores[Math.max(0, Math.min(index, sortedScores.length - 1))];
  }

  /**
   * Calcule le score d'une catégorie par rapport aux autres candidats
   */
  private calculateCategoryScore(
    candidate: CandidateProfile,
    allCandidates: CandidateProfile[],
    category: string
  ): number {
    // Simplification : on retourne un score basé sur les données disponibles
    // À adapter selon la structure réelle des données
    switch (category) {
      case 'technical':
        const avgTechSkills = allCandidates.reduce((sum, c) => sum + c.technicalSkills.length, 0) / allCandidates.length;
        return Math.min(100, (candidate.technicalSkills.length / avgTechSkills) * 50);
      case 'experience':
        const avgExp = allCandidates.reduce((sum, c) => sum + c.yearsExperience, 0) / allCandidates.length;
        return Math.min(100, (candidate.yearsExperience / Math.max(avgExp, 1)) * 50);
      default:
        return 50; // Score neutre par défaut
    }
  }
}

// Export instance singleton
export const benchmarkingService = new BenchmarkingService();

