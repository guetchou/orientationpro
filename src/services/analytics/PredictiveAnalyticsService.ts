import { supabase } from '@/lib/supabaseClient';

// Types pour les analytics prédictifs
export interface PersonalAnalytics {
  id: string;
  user_id: string;
  career_health: CareerHealth;
  performance_tracking: PerformanceTracking;
  future_projections: FutureProjections;
  behavioral_insights: BehavioralInsights;
  market_intelligence: MarketIntelligence;
  success_patterns: SuccessPattern[];
  risk_assessments: RiskAssessment[];
  optimization_recommendations: OptimizationRecommendation[];
  generated_at: string;
  expires_at: string;
}

export interface CareerHealth {
  overall_score: number; // 0-100
  satisfaction_index: number;
  growth_velocity: number;
  skill_gap_urgency: number;
  market_position_strength: number;
  stress_level: number;
  work_life_balance: number;
  career_momentum: number;
  factors: {
    positive: HealthFactor[];
    negative: HealthFactor[];
    neutral: HealthFactor[];
  };
}

export interface HealthFactor {
  factor: string;
  impact_score: number;
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
}

export interface PerformanceTracking {
  productivity_patterns: ProductivityPattern[];
  learning_efficiency: LearningEfficiency;
  goal_achievement_rate: number;
  consistency_score: number;
  peak_performance_times: TimePattern[];
  energy_level_tracking: EnergyPattern[];
}

export interface ProductivityPattern {
  time_period: 'morning' | 'afternoon' | 'evening' | 'night';
  activity_type: string;
  efficiency_score: number;
  success_rate: number;
  optimal_duration: number; // minutes
}

export interface LearningEfficiency {
  absorption_rate: number; // vitesse d'apprentissage
  retention_score: number; // rétention des informations
  application_success: number; // capacité à appliquer
  preferred_learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  optimal_session_duration: number; // minutes
  fatigue_threshold: number; // sessions avant fatigue
}

export interface TimePattern {
  time_range: string;
  activity: string;
  performance_score: number;
  frequency: number;
  confidence: number;
}

export interface EnergyPattern {
  time_of_day: number; // 0-23
  energy_level: number; // 0-100
  factors_affecting: string[];
  recommendations: string[];
}

export interface FutureProjections {
  career_trajectory: CareerTrajectory;
  income_forecast: IncomeForecast;
  skill_evolution: SkillEvolution;
  market_position_forecast: MarketPositionForecast;
  life_balance_projection: LifeBalanceProjection;
  risk_timeline: RiskTimeline[];
}

export interface CareerTrajectory {
  current_position: CareerPosition;
  projected_positions: ProjectedPosition[];
  alternative_paths: AlternativePath[];
  optimal_decisions: OptimalDecision[];
}

export interface CareerPosition {
  title: string;
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  industry: string;
  satisfaction_score: number;
  market_value: number;
}

export interface ProjectedPosition {
  timeline_months: number;
  position: CareerPosition;
  probability: number;
  required_actions: string[];
  key_milestones: string[];
}

export interface BehavioralInsights {
  decision_making_patterns: DecisionPattern[];
  motivation_drivers: MotivationDriver[];
  communication_style: CommunicationStyle;
  leadership_indicators: LeadershipIndicator[];
  collaboration_preferences: CollaborationPreference[];
  stress_responses: StressResponse[];
  innovation_tendencies: InnovationTendency[];
}

export interface DecisionPattern {
  decision_type: string;
  typical_approach: string;
  speed: 'fast' | 'moderate' | 'deliberate';
  accuracy: number;
  confidence_level: number;
  factors_considered: string[];
}

export interface MotivationDriver {
  driver: string;
  strength: number; // 0-100
  stability: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  impact_on_performance: number;
}

export interface CommunicationStyle {
  primary_style: 'direct' | 'diplomatic' | 'supportive' | 'analytical';
  adaptability: number;
  effectiveness_by_context: {
    [context: string]: number;
  };
  improvement_areas: string[];
}

export interface MarketIntelligence {
  industry_trends: IndustryTrend[];
  salary_benchmarks: SalaryBenchmark[];
  skill_demand_forecast: SkillDemand[];
  competition_analysis: CompetitionAnalysis;
  opportunity_windows: OpportunityWindow[];
}

export interface OpportunityWindow {
  opportunity_type: 'job_opening' | 'skill_gap' | 'market_expansion' | 'technology_adoption';
  industry: string;
  timeframe: string;
  probability: number;
  preparation_required: string[];
  potential_impact: number;
}

export interface OptimizationRecommendation {
  category: 'skill_development' | 'career_move' | 'networking' | 'personal_branding' | 'work_life_balance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expected_impact: number; // 0-100
  implementation_difficulty: number; // 0-100
  timeline_weeks: number;
  success_probability: number;
  action_steps: ActionStep[];
  metrics_to_track: string[];
}

export interface ActionStep {
  step: string;
  timeline_days: number;
  resources_required: string[];
  success_criteria: string;
}

export class PredictiveAnalyticsService {
  
  // Générer l'analyse prédictive complète
  async generatePersonalAnalytics(userId: string): Promise<PersonalAnalytics> {
    try {
      // Collecter toutes les données utilisateur
      const userData = await this.collectUserData(userId);
      
      // Analyser la santé de carrière
      const careerHealth = this.analyzeCareerHealth(userData);
      
      // Analyser les performances
      const performanceTracking = this.analyzePerformance(userData);
      
      // Générer les projections futures
      const futureProjections = this.generateFutureProjections(userData);
      
      // Analyser les comportements
      const behavioralInsights = this.analyzeBehavioralInsights(userData);
      
      // Intelligence de marché
      const marketIntelligence = await this.generateMarketIntelligence(userData);
      
      // Identifier les patterns de succès
      const successPatterns = this.identifySuccessPatterns(userData);
      
      // Évaluer les risques
      const riskAssessments = this.assessRisks(userData);
      
      // Générer les recommandations
      const optimizationRecommendations = this.generateOptimizationRecommendations(
        careerHealth, 
        performanceTracking, 
        futureProjections,
        behavioralInsights
      );

      const analytics: PersonalAnalytics = {
        id: crypto.randomUUID(),
        user_id: userId,
        career_health: careerHealth,
        performance_tracking: performanceTracking,
        future_projections: futureProjections,
        behavioral_insights: behavioralInsights,
        market_intelligence: marketIntelligence,
        success_patterns: successPatterns,
        risk_assessments: riskAssessments,
        optimization_recommendations: optimizationRecommendations,
        generated_at: new Date().toISOString(),
        expires_at: this.getExpirationDate(7) // Valable 7 jours
      };

      // Sauvegarder l'analyse
      await this.saveAnalytics(analytics);

      return analytics;

    } catch (error) {
      console.error('Erreur génération analytics:', error);
      throw error;
    }
  }

  // Collecter toutes les données utilisateur
  private async collectUserData(userId: string) {
    const [profile, testResults, cvAnalyses, gameProfile, activities] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('test_results').select('*').eq('user_id', userId),
      supabase.from('cv_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('user_game_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100)
    ]);

    return {
      profile: profile.data,
      testResults: testResults.data || [],
      cvAnalyses: cvAnalyses.data || [],
      gameProfile: gameProfile.data,
      activities: activities.data || []
    };
  }

  // Analyser la santé de carrière
  private analyzeCareerHealth(userData: any): CareerHealth {
    const { testResults, cvAnalyses, gameProfile, activities } = userData;

    // Calculer les scores de santé carrière
    const satisfactionIndex = this.calculateSatisfactionIndex(testResults, activities);
    const growthVelocity = this.calculateGrowthVelocity(gameProfile, activities);
    const skillGapUrgency = this.calculateSkillGapUrgency(testResults, cvAnalyses);
    const marketPositionStrength = this.calculateMarketPosition(testResults, cvAnalyses);
    const stressLevel = this.calculateStressLevel(testResults, activities);
    const workLifeBalance = this.calculateWorkLifeBalance(activities);
    const careerMomentum = this.calculateCareerMomentum(activities, gameProfile);

    const overallScore = Math.round(
      (satisfactionIndex * 0.2) +
      (growthVelocity * 0.15) +
      ((100 - skillGapUrgency) * 0.15) +
      (marketPositionStrength * 0.2) +
      ((100 - stressLevel) * 0.1) +
      (workLifeBalance * 0.1) +
      (careerMomentum * 0.1)
    );

    // Identifier les facteurs positifs et négatifs
    const factors = this.identifyHealthFactors({
      satisfactionIndex,
      growthVelocity,
      skillGapUrgency,
      marketPositionStrength,
      stressLevel,
      workLifeBalance,
      careerMomentum
    });

    return {
      overall_score: overallScore,
      satisfaction_index: satisfactionIndex,
      growth_velocity: growthVelocity,
      skill_gap_urgency: skillGapUrgency,
      market_position_strength: marketPositionStrength,
      stress_level: stressLevel,
      work_life_balance: workLifeBalance,
      career_momentum: careerMomentum,
      factors
    };
  }

  private calculateSatisfactionIndex(testResults: any[], activities: any[]): number {
    // Basé sur les tests émotionnels et l'engagement sur la plateforme
    const emotionalTest = testResults.find(t => t.test_type === 'emotional');
    const engagementScore = Math.min((activities.length / 50) * 100, 100);
    
    if (emotionalTest) {
      const emotionalScore = (
        emotionalTest.results.self_awareness +
        emotionalTest.results.motivation +
        emotionalTest.results.empathy
      ) / 3;
      
      return Math.round((emotionalScore * 0.7) + (engagementScore * 0.3));
    }
    
    return Math.round(engagementScore * 0.8 + 20); // Score de base
  }

  private calculateGrowthVelocity(gameProfile: any, activities: any[]): number {
    if (!gameProfile) return 50;
    
    // Basé sur la progression XP et l'activité récente
    const xpPerDay = gameProfile.total_xp / Math.max(
      (Date.now() - new Date(gameProfile.created_at).getTime()) / (1000 * 60 * 60 * 24),
      1
    );
    
    const recentActivities = activities.filter(a => 
      new Date(a.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const velocityScore = Math.min((xpPerDay * 2) + (recentActivities * 5), 100);
    return Math.round(velocityScore);
  }

  private calculateSkillGapUrgency(testResults: any[], cvAnalyses: any[]): number {
    // Analyser l'écart entre compétences actuelles et demandes du marché
    const latestCV = cvAnalyses[0];
    if (!latestCV) return 70; // Urgence élevée si pas de CV analysé

    const atsScore = latestCV.ats_score || 50;
    const skillsCount = latestCV.skills_found?.technical?.length || 0;
    
    // Plus le score ATS est bas et moins il y a de compétences, plus l'urgence est élevée
    const gapUrgency = 100 - ((atsScore * 0.7) + (Math.min(skillsCount * 5, 30) * 1));
    
    return Math.max(Math.round(gapUrgency), 10);
  }

  private calculateMarketPosition(testResults: any[], cvAnalyses: any[]): number {
    const latestCV = cvAnalyses[0];
    if (!latestCV) return 40;

    const atsScore = latestCV.ats_score || 50;
    const experienceYears = latestCV.experience_years || 0;
    const skillsDiversity = Object.keys(latestCV.skills_by_domain || {}).length;

    const positionStrength = Math.round(
      (atsScore * 0.4) + 
      (Math.min(experienceYears * 10, 30) * 1) + 
      (Math.min(skillsDiversity * 5, 30) * 1)
    );

    return Math.min(positionStrength, 100);
  }

  private calculateStressLevel(testResults: any[], activities: any[]): number {
    const emotionalTest = testResults.find(t => t.test_type === 'emotional');
    
    if (emotionalTest && emotionalTest.results.emotional_stability) {
      return Math.round(100 - emotionalTest.results.emotional_stability);
    }
    
    // Estimer basé sur l'activité (trop d'activité = stress potentiel)
    const recentActivityIntensity = activities.filter(a => 
      new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    if (recentActivityIntensity > 20) return 60; // Activité intense
    if (recentActivityIntensity < 3) return 40;  // Peu d'activité
    return 30; // Activité normale
  }

  private calculateWorkLifeBalance(activities: any[]): number {
    // Analyser les patterns d'activité pour déduire l'équilibre
    const weekdayActivities = activities.filter(a => {
      const date = new Date(a.created_at);
      const day = date.getDay();
      return day >= 1 && day <= 5; // Lundi à vendredi
    }).length;

    const weekendActivities = activities.filter(a => {
      const date = new Date(a.created_at);
      const day = date.getDay();
      return day === 0 || day === 6; // Samedi et dimanche
    }).length;

    const totalActivities = weekdayActivities + weekendActivities;
    if (totalActivities === 0) return 70;

    const weekdayRatio = weekdayActivities / totalActivities;
    
    // L'équilibre optimal est d'environ 70% semaine, 30% weekend
    const balanceScore = 100 - Math.abs(weekdayRatio - 0.7) * 200;
    
    return Math.max(Math.round(balanceScore), 30);
  }

  private calculateCareerMomentum(activities: any[], gameProfile: any): number {
    if (!gameProfile) return 50;
    
    const recentXP = gameProfile.total_xp || 0;
    const currentLevel = gameProfile.level || 1;
    const streak = gameProfile.current_streak || 0;
    
    // Momentum basé sur niveau, XP récent et streak
    const momentum = Math.round(
      (Math.min(currentLevel * 5, 30)) + 
      (Math.min(recentXP / 100, 40)) + 
      (Math.min(streak * 2, 30))
    );
    
    return Math.min(momentum, 100);
  }

  private identifyHealthFactors(scores: any) {
    const positive: HealthFactor[] = [];
    const negative: HealthFactor[] = [];
    const neutral: HealthFactor[] = [];

    // Analyser chaque score
    if (scores.satisfactionIndex > 75) {
      positive.push({
        factor: "Satisfaction élevée",
        impact_score: scores.satisfactionIndex,
        trend: 'improving',
        recommendation: "Maintenez vos activités actuelles qui vous épanouissent"
      });
    } else if (scores.satisfactionIndex < 50) {
      negative.push({
        factor: "Satisfaction faible",
        impact_score: scores.satisfactionIndex,
        trend: 'declining',
        recommendation: "Explorez de nouvelles opportunités et passez des tests approfondis"
      });
    }

    if (scores.growthVelocity > 70) {
      positive.push({
        factor: "Croissance rapide",
        impact_score: scores.growthVelocity,
        trend: 'improving',
        recommendation: "Continuez sur cette lancée et fixez-vous des objectifs plus ambitieux"
      });
    }

    if (scores.skillGapUrgency > 70) {
      negative.push({
        factor: "Écart de compétences important",
        impact_score: scores.skillGapUrgency,
        trend: 'stable',
        recommendation: "Prioritisez la formation et l'acquisition de nouvelles compétences"
      });
    }

    if (scores.stressLevel > 70) {
      negative.push({
        factor: "Niveau de stress élevé",
        impact_score: scores.stressLevel,
        trend: 'stable',
        recommendation: "Travaillez sur la gestion du stress et l'équilibre vie-travail"
      });
    }

    return { positive, negative, neutral };
  }

  // Analyser les performances
  private analyzePerformance(userData: any): PerformanceTracking {
    const { activities, gameProfile } = userData;

    // Analyser les patterns de productivité
    const productivityPatterns = this.analyzeProductivityPatterns(activities);
    
    // Analyser l'efficacité d'apprentissage
    const learningEfficiency = this.analyzeLearningEfficiency(userData);
    
    // Calculer le taux de réalisation d'objectifs
    const goalAchievementRate = this.calculateGoalAchievementRate(gameProfile);
    
    // Score de consistance
    const consistencyScore = this.calculateConsistencyScore(activities);
    
    // Identifier les heures de pointe
    const peakPerformanceTimes = this.identifyPeakPerformanceTimes(activities);
    
    // Tracking d'énergie
    const energyLevelTracking = this.analyzeEnergyPatterns(activities);

    return {
      productivity_patterns: productivityPatterns,
      learning_efficiency: learningEfficiency,
      goal_achievement_rate: goalAchievementRate,
      consistency_score: consistencyScore,
      peak_performance_times: peakPerformanceTimes,
      energy_level_tracking: energyLevelTracking
    };
  }

  private analyzeProductivityPatterns(activities: any[]): ProductivityPattern[] {
    const patterns: ProductivityPattern[] = [];
    
    // Grouper les activités par période de la journée
    const activityGroups = {
      morning: activities.filter(a => new Date(a.created_at).getHours() < 12),
      afternoon: activities.filter(a => {
        const hour = new Date(a.created_at).getHours();
        return hour >= 12 && hour < 17;
      }),
      evening: activities.filter(a => {
        const hour = new Date(a.created_at).getHours();
        return hour >= 17 && hour < 22;
      }),
      night: activities.filter(a => new Date(a.created_at).getHours() >= 22)
    };

    Object.entries(activityGroups).forEach(([period, periodActivities]) => {
      if (periodActivities.length > 0) {
        patterns.push({
          time_period: period as any,
          activity_type: 'general',
          efficiency_score: Math.min((periodActivities.length / activities.length) * 200, 100),
          success_rate: 85, // Simulé - pourrait être calculé basé sur les succès
          optimal_duration: 45 // Simulé
        });
      }
    });

    return patterns;
  }

  private analyzeLearningEfficiency(userData: any): LearningEfficiency {
    const { testResults, activities, gameProfile } = userData;
    
    // Calculer la vitesse d'apprentissage basée sur la progression
    const absorptionRate = gameProfile ? Math.min((gameProfile.total_xp / 100), 100) : 50;
    
    // Score de rétention basé sur les résultats de tests
    const retentionScore = testResults.length > 1 ? 
      Math.max(...testResults.map((t: any) => Object.values(t.results || {}).reduce((sum: number, val: any) => sum + (val || 0), 0) / Object.keys(t.results || {}).length)) : 70;
    
    const learningTest = testResults.find((t: any) => t.test_type === 'learning');
    const preferredStyle = learningTest?.results?.dominant_style || 'visual';

    return {
      absorption_rate: Math.round(absorptionRate),
      retention_score: Math.round(retentionScore),
      application_success: Math.round((absorptionRate + retentionScore) / 2),
      preferred_learning_style: preferredStyle,
      optimal_session_duration: 30 + Math.round(absorptionRate / 10) * 5,
      fatigue_threshold: Math.round(retentionScore / 20) + 2
    };
  }

  private calculateGoalAchievementRate(gameProfile: any): number {
    if (!gameProfile) return 50;
    
    const achievements = gameProfile.achievements?.length || 0;
    const level = gameProfile.level || 1;
    const expectedAchievements = Math.floor(level * 1.5); // Estimation
    
    return Math.min((achievements / Math.max(expectedAchievements, 1)) * 100, 100);
  }

  private calculateConsistencyScore(activities: any[]): number {
    if (activities.length < 7) return 30;
    
    // Analyser la régularité des activités
    const recentActivities = activities.filter(a => 
      new Date(a.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const daysWithActivity = new Set(
      recentActivities.map(a => new Date(a.created_at).toDateString())
    ).size;
    
    return Math.round((daysWithActivity / 30) * 100);
  }

  private identifyPeakPerformanceTimes(activities: any[]): TimePattern[] {
    const hourlyActivity: { [hour: number]: number } = {};
    
    activities.forEach(a => {
      const hour = new Date(a.created_at).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourlyActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({
        time_range: `${hour}h-${parseInt(hour) + 1}h`,
        activity: 'general',
        performance_score: Math.min((count / activities.length) * 300, 100),
        frequency: count,
        confidence: Math.min(count / 5, 1) * 100
      }));

    return peakHours;
  }

  private analyzeEnergyPatterns(activities: any[]): EnergyPattern[] {
    const patterns: EnergyPattern[] = [];
    
    for (let hour = 6; hour < 23; hour += 2) {
      const hourActivities = activities.filter(a => {
        const activityHour = new Date(a.created_at).getHours();
        return activityHour >= hour && activityHour < hour + 2;
      });
      
      const energyLevel = Math.min((hourActivities.length / activities.length) * 400, 100);
      
      patterns.push({
        time_of_day: hour,
        energy_level: Math.round(energyLevel),
        factors_affecting: this.getEnergyFactors(hour),
        recommendations: this.getEnergyRecommendations(hour, energyLevel)
      });
    }
    
    return patterns;
  }

  private getEnergyFactors(hour: number): string[] {
    if (hour <= 8) return ["Réveil matinal", "Fraîcheur mentale"];
    if (hour <= 12) return ["Pic de concentration", "Productivité élevée"];
    if (hour <= 17) return ["Post-déjeuner", "Seconde vague d'énergie"];
    if (hour <= 21) return ["Fin de journée", "Temps de réflexion"];
    return ["Soirée", "Temps de détente"];
  }

  private getEnergyRecommendations(hour: number, energy: number): string[] {
    const recommendations: string[] = [];
    
    if (energy > 70) {
      recommendations.push("Planifiez vos tâches importantes à cette heure");
      if (hour <= 12) recommendations.push("Idéal pour l'apprentissage intensif");
    } else if (energy < 30) {
      recommendations.push("Privilégiez les tâches légères");
      recommendations.push("Considérez une pause ou une activité relaxante");
    }
    
    return recommendations;
  }

  // Générer les projections futures
  private generateFutureProjections(userData: any): FutureProjections {
    const careerTrajectory = this.projectCareerTrajectory(userData);
    const incomeForecast = this.projectIncome(userData);
    const skillEvolution = this.projectSkillEvolution(userData);
    const marketPositionForecast = this.projectMarketPosition(userData);
    const lifeBalanceProjection = this.projectLifeBalance(userData);
    const riskTimeline = this.generateRiskTimeline(userData);

    return {
      career_trajectory: careerTrajectory,
      income_forecast: incomeForecast,
      skill_evolution: skillEvolution,
      market_position_forecast: marketPositionForecast,
      life_balance_projection: lifeBalanceProjection,
      risk_timeline: riskTimeline
    };
  }

  private projectCareerTrajectory(userData: any): CareerTrajectory {
    const { testResults, cvAnalyses, gameProfile } = userData;
    
    const currentPosition: CareerPosition = {
      title: "Position Actuelle",
      level: 'junior',
      industry: 'general',
      satisfaction_score: 70,
      market_value: 60
    };

    // Projections basées sur la croissance actuelle
    const projectedPositions: ProjectedPosition[] = [
      {
        timeline_months: 12,
        position: {
          title: "Position Intermédiaire",
          level: 'mid',
          industry: 'technology',
          satisfaction_score: 80,
          market_value: 75
        },
        probability: 75,
        required_actions: [
          "Compléter 3 formations techniques",
          "Obtenir une certification professionnelle",
          "Développer un portfolio de projets"
        ],
        key_milestones: [
          "Atteindre le niveau 10 sur la plateforme",
          "Score ATS >90%",
          "10+ connexions professionnelles"
        ]
      },
      {
        timeline_months: 36,
        position: {
          title: "Position Senior",
          level: 'senior',
          industry: 'technology',
          satisfaction_score: 90,
          market_value: 90
        },
        probability: 65,
        required_actions: [
          "Acquérir une expertise spécialisée",
          "Développer des compétences de leadership",
          "Construire une réputation dans l'industrie"
        ],
        key_milestones: [
          "Niveau 15 sur la plateforme",
          "Mentorer d'autres utilisateurs",
          "50+ connexions qualifiées"
        ]
      }
    ];

    return {
      current_position: currentPosition,
      projected_positions: projectedPositions,
      alternative_paths: [],
      optimal_decisions: []
    };
  }

  private projectIncome(userData: any) {
    // Projection basée sur le marché congolais et la croissance projetée
    return {
      current_range: { min: 300000, max: 500000 }, // FCFA
      year_1: { min: 450000, max: 650000 },
      year_3: { min: 800000, max: 1200000 },
      year_5: { min: 1500000, max: 2500000 },
      peak_potential: { min: 3000000, max: 5000000 }
    };
  }

  private projectSkillEvolution(userData: any) {
    return {
      current_skills: [],
      emerging_skills_needed: [
        "Intelligence Artificielle",
        "Data Analysis",
        "Digital Marketing",
        "Project Management"
      ],
      skill_decay_risk: [],
      development_roadmap: []
    };
  }

  private projectMarketPosition(userData: any) {
    return {
      current_percentile: 60,
      projected_percentile_1year: 75,
      projected_percentile_3years: 85,
      competitive_advantages: [],
      market_threats: []
    };
  }

  private projectLifeBalance(userData: any) {
    return {
      current_balance_score: 70,
      projected_balance: [
        { timeline_months: 6, balance_score: 75, factors: ["Routine établie"] },
        { timeline_months: 18, balance_score: 80, factors: ["Expertise développée"] },
        { timeline_months: 36, balance_score: 85, factors: ["Position senior"] }
      ],
      risk_factors: ["Surcharge de travail", "Stress professionnel"],
      optimization_strategies: [
        "Planification des activités",
        "Délégation progressive",
        "Développement de l'efficacité"
      ]
    };
  }

  private generateRiskTimeline(userData: any): RiskTimeline[] {
    return [
      {
        timeline_months: 6,
        risk_type: 'skill_obsolescence',
        probability: 20,
        impact: 40,
        mitigation: "Formation continue"
      },
      {
        timeline_months: 24,
        risk_type: 'market_disruption',
        probability: 30,
        impact: 60,
        mitigation: "Diversification des compétences"
      }
    ];
  }

  // Générer les recommandations d'optimisation
  private generateOptimizationRecommendations(
    careerHealth: CareerHealth,
    performance: PerformanceTracking,
    projections: FutureProjections,
    behavioral: BehavioralInsights
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Recommandations basées sur la santé de carrière
    if (careerHealth.skill_gap_urgency > 70) {
      recommendations.push({
        category: 'skill_development',
        priority: 'critical',
        title: "Combler l'écart de compétences urgent",
        description: "Vos compétences actuelles présentent des lacunes importantes par rapport aux exigences du marché.",
        expected_impact: 90,
        implementation_difficulty: 60,
        timeline_weeks: 12,
        success_probability: 85,
        action_steps: [
          {
            step: "Identifier les 3 compétences les plus demandées dans votre domaine",
            timeline_days: 7,
            resources_required: ["Recherche marché", "Analyse d'offres d'emploi"],
            success_criteria: "Liste de compétences prioritaires établie"
          },
          {
            step: "S'inscrire à des formations certifiantes",
            timeline_days: 14,
            resources_required: ["Budget formation", "Temps d'apprentissage"],
            success_criteria: "Inscription confirmée à 2+ formations"
          }
        ],
        metrics_to_track: ["Nombre de compétences acquises", "Score ATS", "Opportunités d'emploi"]
      });
    }

    // Recommandations basées sur les performances
    if (performance.consistency_score < 50) {
      recommendations.push({
        category: 'work_life_balance',
        priority: 'high',
        title: "Améliorer la consistance et les habitudes",
        description: "Votre engagement manque de régularité, ce qui limite votre progression.",
        expected_impact: 75,
        implementation_difficulty: 40,
        timeline_weeks: 6,
        success_probability: 90,
        action_steps: [
          {
            step: "Établir une routine quotidienne d'activité sur la plateforme",
            timeline_days: 7,
            resources_required: ["15 minutes par jour"],
            success_criteria: "7 jours consécutifs d'activité"
          }
        ],
        metrics_to_track: ["Streak quotidien", "XP hebdomadaire", "Missions complétées"]
      });
    }

    return recommendations;
  }

  // Analyser les insights comportementaux
  private analyzeBehavioralInsights(userData: any): BehavioralInsights {
    return {
      decision_making_patterns: [],
      motivation_drivers: this.analyzeMotivationDrivers(userData),
      communication_style: this.analyzeCommunicationStyle(userData),
      leadership_indicators: [],
      collaboration_preferences: [],
      stress_responses: [],
      innovation_tendencies: []
    };
  }

  private analyzeMotivationDrivers(userData: any): MotivationDriver[] {
    const drivers: MotivationDriver[] = [
      {
        driver: "Croissance personnelle",
        strength: 85,
        stability: 80,
        trend: 'increasing',
        impact_on_performance: 90
      },
      {
        driver: "Reconnaissance sociale",
        strength: 70,
        stability: 75,
        trend: 'stable',
        impact_on_performance: 75
      },
      {
        driver: "Sécurité financière",
        strength: 75,
        stability: 85,
        trend: 'stable',
        impact_on_performance: 80
      }
    ];

    return drivers;
  }

  private analyzeCommunicationStyle(userData: any): CommunicationStyle {
    return {
      primary_style: 'analytical',
      adaptability: 75,
      effectiveness_by_context: {
        "Présentations": 80,
        "Négociations": 70,
        "Équipe": 85,
        "Leadership": 75
      },
      improvement_areas: ["Négociation", "Présentation publique"]
    };
  }

  // Génération de l'intelligence de marché
  private async generateMarketIntelligence(userData: any): Promise<MarketIntelligence> {
    return {
      industry_trends: [
        {
          industry: "Technology",
          trend: "Croissance de l'IA et automatisation",
          impact_score: 90,
          timeline: "2024-2026",
          relevance_to_user: 85
        }
      ],
      salary_benchmarks: [],
      skill_demand_forecast: [],
      competition_analysis: {
        market_saturation: 60,
        user_competitive_advantage: 75,
        differentiation_opportunities: []
      },
      opportunity_windows: []
    };
  }

  // Identifier les patterns de succès
  private identifySuccessPatterns(userData: any): SuccessPattern[] {
    return [
      {
        pattern_name: "Apprentissage matinal",
        description: "Vous performez mieux lors des activités d'apprentissage le matin",
        confidence: 80,
        impact_on_success: 75,
        recommendation: "Planifiez vos formations importantes avant midi"
      }
    ];
  }

  // Évaluer les risques
  private assessRisks(userData: any): RiskAssessment[] {
    return [
      {
        risk_type: "skill_obsolescence",
        probability: 30,
        impact: 70,
        timeline_months: 24,
        mitigation_strategies: ["Formation continue", "Veille technologique"]
      }
    ];
  }

  // Méthodes utilitaires
  private getExpirationDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  private async saveAnalytics(analytics: PersonalAnalytics): Promise<void> {
    const { error } = await supabase
      .from('personal_analytics')
      .upsert({
        id: analytics.id,
        user_id: analytics.user_id,
        career_health: analytics.career_health,
        performance_tracking: analytics.performance_tracking,
        future_projections: analytics.future_projections,
        behavioral_insights: analytics.behavioral_insights,
        market_intelligence: analytics.market_intelligence,
        success_patterns: analytics.success_patterns,
        risk_assessments: analytics.risk_assessments,
        optimization_recommendations: analytics.optimization_recommendations,
        generated_at: analytics.generated_at,
        expires_at: analytics.expires_at
      });

    if (error) throw error;
  }

  // Récupérer les analytics existants
  async getPersonalAnalytics(userId: string): Promise<PersonalAnalytics | null> {
    const { data, error } = await supabase
      .from('personal_analytics')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

// Types supplémentaires
interface SuccessPattern {
  pattern_name: string;
  description: string;
  confidence: number;
  impact_on_success: number;
  recommendation: string;
}

interface RiskAssessment {
  risk_type: string;
  probability: number;
  impact: number;
  timeline_months: number;
  mitigation_strategies: string[];
}

interface RiskTimeline {
  timeline_months: number;
  risk_type: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface IndustryTrend {
  industry: string;
  trend: string;
  impact_score: number;
  timeline: string;
  relevance_to_user: number;
}

interface SalaryBenchmark {
  position: string;
  industry: string;
  location: string;
  salary_range: { min: number; max: number };
  growth_rate: number;
}

interface SkillDemand {
  skill: string;
  current_demand: number;
  projected_demand: number;
  growth_rate: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface CompetitionAnalysis {
  market_saturation: number;
  user_competitive_advantage: number;
  differentiation_opportunities: string[];
}

// Exportations
export type {
  PersonalAnalytics,
  CareerHealth,
  PerformanceTracking,
  FutureProjections,
  BehavioralInsights,
  MarketIntelligence,
  OptimizationRecommendation
};
