import { supabase } from '@/lib/supabaseClient';

// Types pour l'ADN Carrière
export interface CareerDNA {
  id: string;
  user_id: string;
  personality_genome: PersonalityGenome;
  compatibility_matrix: CompatibilityMatrix;
  evolution_tracking: EvolutionTracking;
  predictive_insights: PredictiveInsights;
  generated_at: string;
  confidence_score: number;
}

export interface PersonalityGenome {
  riasec_profile: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  emotional_intelligence: {
    self_awareness: number;
    self_regulation: number;
    motivation: number;
    empathy: number;
    social_skills: number;
  };
  cognitive_style: {
    analytical_thinking: number;
    creative_problem_solving: number;
    attention_to_detail: number;
    big_picture_vision: number;
    logical_reasoning: number;
  };
  work_preferences: {
    autonomy_preference: number;
    collaboration_preference: number;
    structure_preference: number;
    innovation_preference: number;
    stability_preference: number;
  };
  stress_resilience: {
    pressure_tolerance: number;
    adaptability: number;
    emotional_stability: number;
    recovery_speed: number;
  };
}

export interface CompatibilityMatrix {
  [career_field: string]: CareerCompatibility;
}

export interface CareerCompatibility {
  natural_fit_score: number; // 0-100
  growth_potential: number; // 0-100
  satisfaction_prediction: number; // 0-100
  success_probability: number; // 0-100
  stress_level_prediction: number; // 0-100
  skill_requirements_match: number; // 0-100
  personality_alignment: number; // 0-100
  long_term_sustainability: number; // 0-100
  recommended_preparation: string[];
  potential_challenges: string[];
  success_timeline: {
    short_term: string; // 1-2 ans
    medium_term: string; // 3-5 ans
    long_term: string; // 5+ ans
  };
}

export interface EvolutionTracking {
  personality_stability_index: number;
  growth_trajectory: GrowthTrajectory[];
  adaptation_capacity: number;
  learning_velocity: number;
  career_readiness_score: number;
}

export interface GrowthTrajectory {
  trait: string;
  current_level: number;
  projected_level: number;
  development_timeline: number; // mois
  recommended_actions: string[];
}

export interface PredictiveInsights {
  career_transitions: {
    optimal_timing: number; // années
    transition_difficulty: number;
    preparation_requirements: string[];
  };
  salary_predictions: {
    entry_level: number;
    mid_career: number;
    senior_level: number;
    peak_earning: number;
  };
  job_market_positioning: {
    current_competitiveness: number;
    projected_demand: number;
    differentiation_factors: string[];
  };
  risk_factors: {
    automation_risk: number;
    market_volatility: number;
    skill_obsolescence: number;
    mitigation_strategies: string[];
  };
}

export class CareerDNAService {
  private readonly CAREER_FIELDS = [
    'technology', 'healthcare', 'education', 'finance', 'engineering',
    'arts_creative', 'business_management', 'science_research', 'legal',
    'social_services', 'marketing_communications', 'agriculture',
    'construction', 'transportation', 'hospitality', 'government',
    'non_profit', 'entrepreneurship', 'consulting', 'media_journalism'
  ];

  // Générer l'ADN Carrière complet
  async generateCareerDNA(userId: string): Promise<CareerDNA> {
    try {
      // 1. Récupérer tous les résultats de tests de l'utilisateur
      const testResults = await this.getAllUserTestResults(userId);
      
      if (testResults.length === 0) {
        throw new Error('Aucun test complété. Veuillez passer au moins un test d\'orientation.');
      }

      // 2. Analyser le génome de personnalité
      const personalityGenome = this.analyzePersonalityGenome(testResults);

      // 3. Calculer la matrice de compatibilité
      const compatibilityMatrix = this.calculateCareerCompatibility(personalityGenome);

      // 4. Générer le suivi d'évolution
      const evolutionTracking = this.generateEvolutionTracking(personalityGenome);

      // 5. Créer les insights prédictifs
      const predictiveInsights = this.generatePredictiveInsights(personalityGenome, compatibilityMatrix);

      // 6. Calculer le score de confiance
      const confidenceScore = this.calculateConfidenceScore(testResults, personalityGenome);

      const careerDNA: CareerDNA = {
        id: crypto.randomUUID(),
        user_id: userId,
        personality_genome: personalityGenome,
        compatibility_matrix: compatibilityMatrix,
        evolution_tracking: evolutionTracking,
        predictive_insights: predictiveInsights,
        generated_at: new Date().toISOString(),
        confidence_score: confidenceScore
      };

      // 7. Sauvegarder en base
      await this.saveCareerDNA(careerDNA);

      return careerDNA;

    } catch (error) {
      console.error('Erreur génération CareerDNA:', error);
      throw error;
    }
  }

  // Récupérer tous les résultats de tests
  private async getAllUserTestResults(userId: string): Promise<any[]> {
    const { data: testResults, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return testResults || [];
  }

  // Analyser le génome de personnalité
  private analyzePersonalityGenome(testResults: any[]): PersonalityGenome {
    // Extraction des scores RIASEC
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    const riasecProfile = riasecData?.results || {
      realistic: 50, investigative: 50, artistic: 50,
      social: 50, enterprising: 50, conventional: 50
    };

    // Extraction intelligence émotionnelle
    const emotionalData = testResults.find(t => t.test_type === 'emotional');
    const emotionalIntelligence = this.extractEmotionalIntelligence(emotionalData);

    // Analyse du style cognitif
    const cognitiveStyle = this.analyzeCognitiveStyle(testResults);

    // Préférences de travail
    const workPreferences = this.analyzeWorkPreferences(testResults);

    // Résilience au stress
    const stressResilience = this.analyzeStressResilience(testResults);

    return {
      riasec_profile: riasecProfile,
      emotional_intelligence: emotionalIntelligence,
      cognitive_style: cognitiveStyle,
      work_preferences: workPreferences,
      stress_resilience: stressResilience
    };
  }

  private extractEmotionalIntelligence(emotionalData: any) {
    if (!emotionalData?.results) {
      return {
        self_awareness: 70,
        self_regulation: 70,
        motivation: 70,
        empathy: 70,
        social_skills: 70
      };
    }

    const results = emotionalData.results;
    return {
      self_awareness: results.self_awareness || 70,
      self_regulation: results.self_regulation || 70,
      motivation: results.motivation || 70,
      empathy: results.empathy || 70,
      social_skills: results.social_skills || 70
    };
  }

  private analyzeCognitiveStyle(testResults: any[]) {
    const learningData = testResults.find(t => t.test_type === 'learning');
    const multipleData = testResults.find(t => t.test_type === 'multiple_intelligence');

    // Analyse basée sur les résultats de tests existants
    return {
      analytical_thinking: this.calculateAnalyticalThinking(testResults),
      creative_problem_solving: this.calculateCreativeProblemSolving(testResults),
      attention_to_detail: this.calculateAttentionToDetail(testResults),
      big_picture_vision: this.calculateBigPictureVision(testResults),
      logical_reasoning: this.calculateLogicalReasoning(testResults)
    };
  }

  private analyzeWorkPreferences(testResults: any[]) {
    // Analyse basée sur les réponses aux tests
    return {
      autonomy_preference: this.calculateAutonomyPreference(testResults),
      collaboration_preference: this.calculateCollaborationPreference(testResults),
      structure_preference: this.calculateStructurePreference(testResults),
      innovation_preference: this.calculateInnovationPreference(testResults),
      stability_preference: this.calculateStabilityPreference(testResults)
    };
  }

  private analyzeStressResilience(testResults: any[]) {
    const emotionalData = testResults.find(t => t.test_type === 'emotional');
    
    return {
      pressure_tolerance: this.calculatePressureTolerance(testResults),
      adaptability: this.calculateAdaptability(testResults),
      emotional_stability: emotionalData?.results?.emotional_stability || 70,
      recovery_speed: this.calculateRecoverySpeed(testResults)
    };
  }

  // Calculateurs de traits cognitifs
  private calculateAnalyticalThinking(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const investigative = riasecData.results?.investigative || 50;
    const conventional = riasecData.results?.conventional || 50;
    return Math.round((investigative * 0.7 + conventional * 0.3));
  }

  private calculateCreativeProblemSolving(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const artistic = riasecData.results?.artistic || 50;
    const enterprising = riasecData.results?.enterprising || 50;
    return Math.round((artistic * 0.6 + enterprising * 0.4));
  }

  private calculateAttentionToDetail(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const conventional = riasecData.results?.conventional || 50;
    const investigative = riasecData.results?.investigative || 50;
    return Math.round((conventional * 0.6 + investigative * 0.4));
  }

  private calculateBigPictureVision(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const enterprising = riasecData.results?.enterprising || 50;
    const artistic = riasecData.results?.artistic || 50;
    return Math.round((enterprising * 0.7 + artistic * 0.3));
  }

  private calculateLogicalReasoning(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const investigative = riasecData.results?.investigative || 50;
    return Math.round(investigative * 0.9 + 10);
  }

  // Calculateurs de préférences de travail
  private calculateAutonomyPreference(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const artistic = riasecData.results?.artistic || 50;
    const investigative = riasecData.results?.investigative || 50;
    const social = riasecData.results?.social || 50;
    return Math.round((artistic * 0.4 + investigative * 0.4 + (100 - social) * 0.2));
  }

  private calculateCollaborationPreference(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const social = riasecData.results?.social || 50;
    const enterprising = riasecData.results?.enterprising || 50;
    return Math.round((social * 0.7 + enterprising * 0.3));
  }

  private calculateStructurePreference(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const conventional = riasecData.results?.conventional || 50;
    const realistic = riasecData.results?.realistic || 50;
    return Math.round((conventional * 0.8 + realistic * 0.2));
  }

  private calculateInnovationPreference(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const artistic = riasecData.results?.artistic || 50;
    const enterprising = riasecData.results?.enterprising || 50;
    const investigative = riasecData.results?.investigative || 50;
    return Math.round((artistic * 0.4 + enterprising * 0.3 + investigative * 0.3));
  }

  private calculateStabilityPreference(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const conventional = riasecData.results?.conventional || 50;
    const social = riasecData.results?.social || 50;
    return Math.round((conventional * 0.6 + social * 0.4));
  }

  // Calculateurs de résilience
  private calculatePressureTolerance(testResults: any[]): number {
    const emotionalData = testResults.find(t => t.test_type === 'emotional');
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    
    let tolerance = 70;
    
    if (emotionalData?.results?.self_regulation) {
      tolerance = emotionalData.results.self_regulation;
    }
    
    if (riasecData?.results?.enterprising) {
      tolerance = Math.round((tolerance + riasecData.results.enterprising) / 2);
    }
    
    return tolerance;
  }

  private calculateAdaptability(testResults: any[]): number {
    const riasecData = testResults.find(t => t.test_type === 'riasec');
    if (!riasecData) return 70;
    
    const artistic = riasecData.results?.artistic || 50;
    const enterprising = riasecData.results?.enterprising || 50;
    const social = riasecData.results?.social || 50;
    return Math.round((artistic * 0.3 + enterprising * 0.4 + social * 0.3));
  }

  private calculateRecoverySpeed(testResults: any[]): number {
    const emotionalData = testResults.find(t => t.test_type === 'emotional');
    if (!emotionalData) return 70;
    
    const resilience = emotionalData.results?.emotional_stability || 70;
    const motivation = emotionalData.results?.motivation || 70;
    return Math.round((resilience * 0.6 + motivation * 0.4));
  }

  // Calculer la compatibilité avec les carrières
  private calculateCareerCompatibility(genome: PersonalityGenome): CompatibilityMatrix {
    const matrix: CompatibilityMatrix = {};

    for (const career of this.CAREER_FIELDS) {
      matrix[career] = this.analyzeCareerFit(career, genome);
    }

    return matrix;
  }

  private analyzeCareerFit(career: string, genome: PersonalityGenome): CareerCompatibility {
    const careerProfiles = this.getCareerProfiles();
    const profile = careerProfiles[career];

    if (!profile) {
      return this.getDefaultCompatibility();
    }

    // Calcul de compatibilité basé sur les profils RIASEC
    const riasecMatch = this.calculateRIASECMatch(genome.riasec_profile, profile.riasec_requirements);
    
    // Calcul basé sur les compétences cognitives
    const cognitiveMatch = this.calculateCognitiveMatch(genome.cognitive_style, profile.cognitive_requirements);
    
    // Calcul basé sur les préférences de travail
    const workMatch = this.calculateWorkMatch(genome.work_preferences, profile.work_environment);

    // Score global
    const naturalFitScore = Math.round((riasecMatch * 0.5 + cognitiveMatch * 0.3 + workMatch * 0.2));

    return {
      natural_fit_score: naturalFitScore,
      growth_potential: this.calculateGrowthPotential(genome, profile),
      satisfaction_prediction: this.predictSatisfaction(naturalFitScore, genome),
      success_probability: this.predictSuccess(naturalFitScore, genome),
      stress_level_prediction: this.predictStressLevel(genome, profile),
      skill_requirements_match: cognitiveMatch,
      personality_alignment: riasecMatch,
      long_term_sustainability: this.predictLongTermSustainability(genome, profile),
      recommended_preparation: this.generatePreparationRecommendations(career, genome),
      potential_challenges: this.identifyPotentialChallenges(career, genome),
      success_timeline: this.generateSuccessTimeline(career, naturalFitScore)
    };
  }

  private calculateRIASECMatch(userProfile: any, requirements: any): number {
    if (!requirements) return 75;

    let totalScore = 0;
    let count = 0;

    for (const [trait, userScore] of Object.entries(userProfile)) {
      if (requirements[trait]) {
        const requirement = requirements[trait] as number;
        const match = 100 - Math.abs(userScore as number - requirement);
        totalScore += Math.max(match, 0);
        count++;
      }
    }

    return count > 0 ? Math.round(totalScore / count) : 75;
  }

  private calculateCognitiveMatch(userCognitive: any, requirements: any): number {
    if (!requirements) return 75;

    let totalScore = 0;
    let count = 0;

    for (const [trait, userScore] of Object.entries(userCognitive)) {
      if (requirements[trait]) {
        const requirement = requirements[trait] as number;
        const match = 100 - Math.abs(userScore as number - requirement);
        totalScore += Math.max(match, 0);
        count++;
      }
    }

    return count > 0 ? Math.round(totalScore / count) : 75;
  }

  private calculateWorkMatch(userPrefs: any, environment: any): number {
    if (!environment) return 75;

    let totalScore = 0;
    let count = 0;

    for (const [trait, userScore] of Object.entries(userPrefs)) {
      if (environment[trait]) {
        const envRequirement = environment[trait] as number;
        const match = 100 - Math.abs(userScore as number - envRequirement);
        totalScore += Math.max(match, 0);
        count++;
      }
    }

    return count > 0 ? Math.round(totalScore / count) : 75;
  }

  private calculateGrowthPotential(genome: PersonalityGenome, profile: any): number {
    const adaptability = genome.stress_resilience.adaptability;
    const motivation = genome.emotional_intelligence.motivation;
    const innovation = genome.work_preferences.innovation_preference;
    
    return Math.round((adaptability * 0.4 + motivation * 0.4 + innovation * 0.2));
  }

  private predictSatisfaction(naturalFit: number, genome: PersonalityGenome): number {
    const workAlignment = naturalFit;
    const emotionalStability = genome.stress_resilience.emotional_stability;
    const autonomy = genome.work_preferences.autonomy_preference;
    
    return Math.round((workAlignment * 0.5 + emotionalStability * 0.3 + autonomy * 0.2));
  }

  private predictSuccess(naturalFit: number, genome: PersonalityGenome): number {
    const fit = naturalFit;
    const motivation = genome.emotional_intelligence.motivation;
    const resilience = genome.stress_resilience.pressure_tolerance;
    
    return Math.round((fit * 0.4 + motivation * 0.4 + resilience * 0.2));
  }

  private predictStressLevel(genome: PersonalityGenome, profile: any): number {
    const tolerance = genome.stress_resilience.pressure_tolerance;
    const stability = genome.stress_resilience.emotional_stability;
    const workStructure = genome.work_preferences.structure_preference;
    
    // Plus le score est bas, moins il y a de stress
    const baseStress = 100 - Math.round((tolerance * 0.4 + stability * 0.4 + workStructure * 0.2));
    
    return Math.max(baseStress, 10); // Minimum 10% de stress
  }

  private predictLongTermSustainability(genome: PersonalityGenome, profile: any): number {
    const satisfaction = this.predictSatisfaction(75, genome);
    const adaptability = genome.stress_resilience.adaptability;
    const growth = genome.emotional_intelligence.motivation;
    
    return Math.round((satisfaction * 0.4 + adaptability * 0.3 + growth * 0.3));
  }

  private generatePreparationRecommendations(career: string, genome: PersonalityGenome): string[] {
    const recommendations: string[] = [];
    
    // Recommandations basées sur les lacunes identifiées
    if (genome.cognitive_style.analytical_thinking < 70) {
      recommendations.push("Développer vos compétences analytiques par des exercices de logique");
    }
    
    if (genome.emotional_intelligence.social_skills < 70) {
      recommendations.push("Améliorer vos compétences interpersonnelles par la pratique");
    }
    
    if (genome.work_preferences.innovation_preference > 80 && career.includes('conventional')) {
      recommendations.push("Chercher des moyens d'innover dans un cadre structuré");
    }
    
    // Recommandations spécifiques par carrière
    const careerRecommendations = this.getCareerSpecificRecommendations(career);
    recommendations.push(...careerRecommendations);
    
    return recommendations.slice(0, 5); // Limiter à 5 recommandations
  }

  private identifyPotentialChallenges(career: string, genome: PersonalityGenome): string[] {
    const challenges: string[] = [];
    
    // Défis basés sur les traits de personnalité
    if (genome.stress_resilience.pressure_tolerance < 60) {
      challenges.push("Gestion du stress dans un environnement exigeant");
    }
    
    if (genome.work_preferences.autonomy_preference > 80 && career.includes('social')) {
      challenges.push("Adaptation au travail en équipe constant");
    }
    
    if (genome.cognitive_style.attention_to_detail < 60 && career.includes('finance')) {
      challenges.push("Maintien de la précision dans les tâches détaillées");
    }
    
    return challenges.slice(0, 4); // Limiter à 4 défis
  }

  private generateSuccessTimeline(career: string, naturalFitScore: number) {
    const baseTimeline = {
      short_term: "Acquisition des compétences de base",
      medium_term: "Développement de l'expertise",
      long_term: "Maîtrise et leadership"
    };

    // Ajuster selon le score de compatibilité
    if (naturalFitScore > 85) {
      return {
        short_term: "Excellence rapide dans les tâches de base (6-12 mois)",
        medium_term: "Leadership émergent et expertise reconnue (2-3 ans)",
        long_term: "Position de mentor et innovation dans le domaine (4-6 ans)"
      };
    } else if (naturalFitScore > 70) {
      return {
        short_term: "Apprentissage solide et adaptation (12-18 mois)",
        medium_term: "Compétence confirmée et responsabilités étendues (3-4 ans)",
        long_term: "Expertise établie et contribution significative (5-8 ans)"
      };
    } else {
      return {
        short_term: "Formation intensive et accompagnement (18-24 mois)",
        medium_term: "Consolidation des acquis et spécialisation (4-5 ans)",
        long_term: "Maîtrise progressive et développement continu (7-10 ans)"
      };
    }
  }

  // Générer le suivi d'évolution
  private generateEvolutionTracking(genome: PersonalityGenome): EvolutionTracking {
    return {
      personality_stability_index: this.calculatePersonalityStability(genome),
      growth_trajectory: this.generateGrowthTrajectory(genome),
      adaptation_capacity: genome.stress_resilience.adaptability,
      learning_velocity: this.calculateLearningVelocity(genome),
      career_readiness_score: this.calculateCareerReadiness(genome)
    };
  }

  private calculatePersonalityStability(genome: PersonalityGenome): number {
    // Basé sur la cohérence des traits
    const traits = [
      genome.emotional_intelligence.self_awareness,
      genome.emotional_intelligence.emotional_stability || genome.stress_resilience.emotional_stability,
      genome.work_preferences.stability_preference
    ];
    
    return Math.round(traits.reduce((sum, trait) => sum + trait, 0) / traits.length);
  }

  private generateGrowthTrajectory(genome: PersonalityGenome): GrowthTrajectory[] {
    const trajectories: GrowthTrajectory[] = [];
    
    // Analyser chaque trait pour le potentiel de croissance
    const traits = [
      { name: 'Leadership', current: genome.emotional_intelligence.social_skills, potential: 85 },
      { name: 'Innovation', current: genome.work_preferences.innovation_preference, potential: 90 },
      { name: 'Analytical Thinking', current: genome.cognitive_style.analytical_thinking, potential: 88 },
      { name: 'Emotional Intelligence', current: genome.emotional_intelligence.self_awareness, potential: 92 }
    ];
    
    for (const trait of traits) {
      if (trait.potential > trait.current) {
        trajectories.push({
          trait: trait.name,
          current_level: trait.current,
          projected_level: trait.potential,
          development_timeline: Math.round((trait.potential - trait.current) * 0.5), // mois
          recommended_actions: this.getTraitDevelopmentActions(trait.name)
        });
      }
    }
    
    return trajectories;
  }

  private calculateLearningVelocity(genome: PersonalityGenome): number {
    const curiosity = genome.riasec_profile.investigative;
    const adaptability = genome.stress_resilience.adaptability;
    const motivation = genome.emotional_intelligence.motivation;
    
    return Math.round((curiosity * 0.4 + adaptability * 0.3 + motivation * 0.3));
  }

  private calculateCareerReadiness(genome: PersonalityGenome): number {
    const selfAwareness = genome.emotional_intelligence.self_awareness;
    const socialSkills = genome.emotional_intelligence.social_skills;
    const resilience = genome.stress_resilience.pressure_tolerance;
    const motivation = genome.emotional_intelligence.motivation;
    
    return Math.round((selfAwareness * 0.3 + socialSkills * 0.25 + resilience * 0.25 + motivation * 0.2));
  }

  // Générer les insights prédictifs
  private generatePredictiveInsights(genome: PersonalityGenome, compatibility: CompatibilityMatrix): PredictiveInsights {
    return {
      career_transitions: this.predictCareerTransitions(genome, compatibility),
      salary_predictions: this.predictSalaryEvolution(genome, compatibility),
      job_market_positioning: this.analyzeJobMarketPosition(genome),
      risk_factors: this.identifyRiskFactors(genome, compatibility)
    };
  }

  private predictCareerTransitions(genome: PersonalityGenome, compatibility: CompatibilityMatrix) {
    const adaptability = genome.stress_resilience.adaptability;
    const stability = genome.work_preferences.stability_preference;
    
    const optimalTiming = stability > 70 ? 8 : (adaptability > 75 ? 3 : 5); // années
    const difficulty = 100 - adaptability;
    
    return {
      optimal_timing: optimalTiming,
      transition_difficulty: difficulty,
      preparation_requirements: [
        "Développement de nouvelles compétences",
        "Construction d'un réseau professionnel",
        "Expérience dans le domaine cible",
        "Mise à jour du CV et du profil professionnel"
      ]
    };
  }

  private predictSalaryEvolution(genome: PersonalityGenome, compatibility: CompatibilityMatrix) {
    // Trouvez la meilleure compatibilité
    const bestCareer = Object.entries(compatibility)
      .sort((a, b) => b[1].natural_fit_score - a[1].natural_fit_score)[0];
    
    const baseMultiplier = bestCareer ? bestCareer[1].natural_fit_score / 100 : 0.75;
    
    // Salaires basés sur le marché congolais (en FCFA)
    return {
      entry_level: Math.round(300000 * baseMultiplier), // ~300k FCFA
      mid_career: Math.round(800000 * baseMultiplier),  // ~800k FCFA
      senior_level: Math.round(1500000 * baseMultiplier), // ~1.5M FCFA
      peak_earning: Math.round(3000000 * baseMultiplier)  // ~3M FCFA
    };
  }

  private analyzeJobMarketPosition(genome: PersonalityGenome) {
    const innovation = genome.work_preferences.innovation_preference;
    const social = genome.emotional_intelligence.social_skills;
    const analytical = genome.cognitive_style.analytical_thinking;
    
    const competitiveness = Math.round((innovation * 0.4 + social * 0.3 + analytical * 0.3));
    
    return {
      current_competitiveness: competitiveness,
      projected_demand: Math.min(competitiveness + 15, 100), // Croissance prévue
      differentiation_factors: this.identifyDifferentiationFactors(genome)
    };
  }

  private identifyDifferentiationFactors(genome: PersonalityGenome): string[] {
    const factors: string[] = [];
    
    if (genome.cognitive_style.creative_problem_solving > 80) {
      factors.push("Capacité d'innovation exceptionnelle");
    }
    
    if (genome.emotional_intelligence.empathy > 85) {
      factors.push("Intelligence émotionnelle élevée");
    }
    
    if (genome.stress_resilience.adaptability > 85) {
      factors.push("Excellente adaptabilité au changement");
    }
    
    if (genome.work_preferences.autonomy_preference > 80) {
      factors.push("Leadership naturel et autonomie");
    }
    
    return factors;
  }

  private identifyRiskFactors(genome: PersonalityGenome, compatibility: CompatibilityMatrix) {
    const innovation = genome.work_preferences.innovation_preference;
    const adaptability = genome.stress_resilience.adaptability;
    
    return {
      automation_risk: innovation < 60 ? 70 : 30, // Faible innovation = plus de risque
      market_volatility: 100 - genome.work_preferences.stability_preference,
      skill_obsolescence: 100 - genome.emotional_intelligence.motivation,
      mitigation_strategies: [
        "Formation continue et apprentissage",
        "Développement de compétences transversales",
        "Construction d'un réseau professionnel solide",
        "Diversification des compétences"
      ]
    };
  }

  private calculateConfidenceScore(testResults: any[], genome: PersonalityGenome): number {
    let score = 50; // Base
    
    // Plus de tests = plus de confiance
    score += Math.min(testResults.length * 10, 30);
    
    // Cohérence des résultats
    const coherence = this.calculateResultCoherence(testResults);
    score += coherence * 0.2;
    
    return Math.min(Math.round(score), 100);
  }

  private calculateResultCoherence(testResults: any[]): number {
    // Analyser la cohérence entre les différents tests
    // Plus les résultats sont cohérents, plus le score est élevé
    return 75; // Implémentation simplifiée
  }

  // Sauvegarder l'ADN Carrière
  private async saveCareerDNA(careerDNA: CareerDNA): Promise<void> {
    const { error } = await supabase
      .from('career_dna')
      .upsert({
        id: careerDNA.id,
        user_id: careerDNA.user_id,
        personality_genome: careerDNA.personality_genome,
        compatibility_matrix: careerDNA.compatibility_matrix,
        evolution_tracking: careerDNA.evolution_tracking,
        predictive_insights: careerDNA.predictive_insights,
        generated_at: careerDNA.generated_at,
        confidence_score: careerDNA.confidence_score
      });

    if (error) throw error;
  }

  // Récupérer l'ADN Carrière existant
  async getCareerDNA(userId: string): Promise<CareerDNA | null> {
    const { data, error } = await supabase
      .from('career_dna')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Méthodes utilitaires
  private getDefaultCompatibility(): CareerCompatibility {
    return {
      natural_fit_score: 70,
      growth_potential: 75,
      satisfaction_prediction: 70,
      success_probability: 65,
      stress_level_prediction: 50,
      skill_requirements_match: 70,
      personality_alignment: 70,
      long_term_sustainability: 70,
      recommended_preparation: ["Formation générale", "Développement personnel"],
      potential_challenges: ["Adaptation au domaine"],
      success_timeline: {
        short_term: "Apprentissage initial (12-18 mois)",
        medium_term: "Développement de compétences (3-5 ans)",
        long_term: "Expertise et leadership (5-10 ans)"
      }
    };
  }

  private getCareerProfiles() {
    // Profils simplifiés des carrières avec leurs exigences
    return {
      technology: {
        riasec_requirements: { investigative: 80, realistic: 70, conventional: 60 },
        cognitive_requirements: { analytical_thinking: 85, logical_reasoning: 90 },
        work_environment: { autonomy_preference: 75, innovation_preference: 85 }
      },
      healthcare: {
        riasec_requirements: { social: 85, investigative: 75, realistic: 65 },
        cognitive_requirements: { attention_to_detail: 90, analytical_thinking: 80 },
        work_environment: { collaboration_preference: 80, structure_preference: 75 }
      },
      education: {
        riasec_requirements: { social: 90, artistic: 70, enterprising: 60 },
        cognitive_requirements: { big_picture_vision: 75, creative_problem_solving: 70 },
        work_environment: { collaboration_preference: 85, stability_preference: 70 }
      }
      // Ajouter d'autres profils...
    };
  }

  private getCareerSpecificRecommendations(career: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      technology: [
        "Apprendre un langage de programmation populaire",
        "Créer un portfolio de projets personnels",
        "Obtenir des certifications techniques"
      ],
      healthcare: [
        "Développer l'empathie et les compétences interpersonnelles",
        "Se familiariser avec les protocoles médicaux",
        "Pratiquer la gestion du stress"
      ],
      education: [
        "Développer des compétences pédagogiques",
        "Apprendre les méthodes d'enseignement modernes",
        "Pratiquer la communication publique"
      ]
    };

    return recommendations[career] || ["Formation spécialisée dans le domaine"];
  }

  private getTraitDevelopmentActions(trait: string): string[] {
    const actions: { [key: string]: string[] } = {
      'Leadership': [
        "Participer à des projets d'équipe",
        "Suivre une formation en management",
        "Chercher des opportunités de mentorat"
      ],
      'Innovation': [
        "Pratiquer le brainstorming créatif",
        "Explorer de nouvelles technologies",
        "Participer à des hackathons"
      ],
      'Analytical Thinking': [
        "Résoudre des problèmes logiques quotidiennement",
        "Étudier les méthodes d'analyse de données",
        "Pratiquer la décomposition de problèmes complexes"
      ]
    };

    return actions[trait] || ["Développement personnel continu"];
  }
}
