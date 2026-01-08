import { supabase } from '@/lib/supabaseClient';

// Types pour la gamification
export interface UserGameProfile {
  id: string;
  user_id: string;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity: string;
  achievements: Achievement[];
  progress_metrics: ProgressMetrics;
  rewards_earned: RewardsEarned;
  daily_missions: DailyMission[];
  weekly_challenges: WeeklyChallenge[];
  leaderboard_rank: number;
  badges: Badge[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'expertise' | 'social' | 'learning' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  xp_reward: number;
  unlock_condition: UnlockCondition;
  unlocked_at?: string;
  progress?: number;
  max_progress?: number;
}

export interface UnlockCondition {
  type: 'test_completion' | 'cv_score' | 'appointments' | 'connections' | 'streak' | 'level' | 'special';
  target: number;
  additional_conditions?: Record<string, any>;
}

export interface ProgressMetrics {
  tests_completed: number;
  cv_optimizations: number;
  appointments_booked: number;
  skills_developed: number;
  network_connections: number;
  forum_posts: number;
  articles_read: number;
  courses_completed: number;
  mentorship_sessions: number;
  career_goals_achieved: number;
}

export interface RewardsEarned {
  badges: Badge[];
  certificates: Certificate[];
  unlocked_features: UnlockedFeature[];
  bonus_content: BonusContent[];
  premium_days: number;
  coins_earned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  issued_by: string;
  issued_at: string;
  verification_code: string;
}

export interface UnlockedFeature {
  feature_id: string;
  feature_name: string;
  unlocked_at: string;
  expires_at?: string;
}

export interface BonusContent {
  content_id: string;
  content_type: 'article' | 'video' | 'course' | 'template' | 'guide';
  title: string;
  unlocked_at: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'skill' | 'social' | 'learning' | 'action' | 'exploration';
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  completion_criteria: CompletionCriteria;
  progress: number;
  max_progress: number;
  completed: boolean;
  expires_at: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  theme: 'career_development' | 'skill_building' | 'networking' | 'leadership' | 'innovation';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xp_reward: number;
  bonus_rewards: string[];
  participants: number;
  completion_criteria: CompletionCriteria;
  progress: number;
  max_progress: number;
  completed: boolean;
  starts_at: string;
  ends_at: string;
}

export interface CompletionCriteria {
  action: string;
  target: number;
  timeframe?: string;
  additional_params?: Record<string, any>;
}

export interface LevelInfo {
  level: number;
  title: string;
  min_xp: number;
  max_xp: number;
  perks: string[];
  unlock_features: string[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  total_xp: number;
  achievements_count: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export class GamificationService {
  
  // Système de niveaux
  private readonly LEVEL_SYSTEM: LevelInfo[] = [
    {
      level: 1,
      title: "Explorateur",
      min_xp: 0,
      max_xp: 100,
      perks: ["Accès aux tests de base"],
      unlock_features: ["basic_tests"]
    },
    {
      level: 2,
      title: "Apprenti",
      min_xp: 100,
      max_xp: 300,
      perks: ["Optimisation CV basique", "1 consultation gratuite"],
      unlock_features: ["cv_basic", "consultation_1"]
    },
    {
      level: 3,
      title: "Découvreur",
      min_xp: 300,
      max_xp: 600,
      perks: ["Tests avancés", "Rapport détaillé"],
      unlock_features: ["advanced_tests", "detailed_reports"]
    },
    {
      level: 5,
      title: "Navigateur",
      min_xp: 1000,
      max_xp: 1800,
      perks: ["ADN Carrière", "Mentorship IA"],
      unlock_features: ["career_dna", "ai_mentorship"]
    },
    {
      level: 10,
      title: "Expert",
      min_xp: 5000,
      max_xp: 8000,
      perks: ["Accès premium complet", "Certification professionnelle"],
      unlock_features: ["premium_full", "certification"]
    },
    {
      level: 15,
      title: "Maître",
      min_xp: 12000,
      max_xp: 18000,
      perks: ["Statut de mentor", "Revenus de parrainage"],
      unlock_features: ["mentor_status", "referral_earnings"]
    },
    {
      level: 20,
      title: "Légende",
      min_xp: 25000,
      max_xp: 40000,
      perks: ["Accès exclusif", "Consultation avec fondateurs"],
      unlock_features: ["exclusive_access", "founder_consultation"]
    }
  ];

  // Système d'achievements
  private readonly ACHIEVEMENTS_SYSTEM: Achievement[] = [
    // Onboarding
    {
      id: 'first_steps',
      title: 'Premiers Pas',
      description: 'Complétez votre profil utilisateur',
      icon: '👋',
      category: 'onboarding',
      rarity: 'common',
      xp_reward: 50,
      unlock_condition: { type: 'special', target: 1 }
    },
    {
      id: 'test_taker',
      title: 'Explorateur de Talents',
      description: 'Complétez votre premier test d\'orientation',
      icon: '🧠',
      category: 'onboarding',
      rarity: 'common',
      xp_reward: 100,
      unlock_condition: { type: 'test_completion', target: 1 }
    },
    {
      id: 'test_master',
      title: 'Maître des Tests',
      description: 'Complétez tous les types de tests disponibles',
      icon: '🎯',
      category: 'expertise',
      rarity: 'epic',
      xp_reward: 1000,
      unlock_condition: { type: 'test_completion', target: 8 }
    },

    // Expertise CV
    {
      id: 'cv_optimizer',
      title: 'Optimiseur de CV',
      description: 'Optimisez votre premier CV',
      icon: '📄',
      category: 'expertise',
      rarity: 'common',
      xp_reward: 150,
      unlock_condition: { type: 'special', target: 1 }
    },
    {
      id: 'cv_perfectionist',
      title: 'Perfectionniste du CV',
      description: 'Atteignez un score ATS de 95%+',
      icon: '💎',
      category: 'expertise',
      rarity: 'legendary',
      xp_reward: 2000,
      unlock_condition: { type: 'cv_score', target: 95 }
    },
    {
      id: 'cv_guru',
      title: 'Guru du CV',
      description: 'Maintenez un score ATS >90% pendant 30 jours',
      icon: '🏆',
      category: 'expertise',
      rarity: 'mythic',
      xp_reward: 5000,
      unlock_condition: { type: 'special', target: 1 }
    },

    // Social
    {
      id: 'networker',
      title: 'Networker Débutant',
      description: 'Connectez-vous avec 10 professionnels',
      icon: '🤝',
      category: 'social',
      rarity: 'common',
      xp_reward: 200,
      unlock_condition: { type: 'connections', target: 10 }
    },
    {
      id: 'super_networker',
      title: 'Super Networker',
      description: 'Construisez un réseau de 50+ connexions',
      icon: '🌟',
      category: 'social',
      rarity: 'rare',
      xp_reward: 500,
      unlock_condition: { type: 'connections', target: 50 }
    },
    {
      id: 'influence_master',
      title: 'Maître d\'Influence',
      description: 'Atteignez 100+ connexions qualifiées',
      icon: '👑',
      category: 'social',
      rarity: 'epic',
      xp_reward: 1500,
      unlock_condition: { type: 'connections', target: 100 }
    },

    // Apprentissage
    {
      id: 'knowledge_seeker',
      title: 'Chercheur de Connaissances',
      description: 'Lisez 25 articles de carrière',
      icon: '📚',
      category: 'learning',
      rarity: 'common',
      xp_reward: 300,
      unlock_condition: { type: 'special', target: 25 }
    },
    {
      id: 'skill_builder',
      title: 'Bâtisseur de Compétences',
      description: 'Complétez 5 formations en ligne',
      icon: '🏗️',
      category: 'learning',
      rarity: 'rare',
      xp_reward: 750,
      unlock_condition: { type: 'special', target: 5 }
    },

    // Streaks
    {
      id: 'consistent_learner',
      title: 'Apprenant Consistant',
      description: 'Maintenez une série de 7 jours d\'activité',
      icon: '🔥',
      category: 'milestone',
      rarity: 'rare',
      xp_reward: 400,
      unlock_condition: { type: 'streak', target: 7 }
    },
    {
      id: 'dedication_master',
      title: 'Maître de la Dévotion',
      description: 'Série de 30 jours consécutifs',
      icon: '⚡',
      category: 'milestone',
      rarity: 'legendary',
      xp_reward: 3000,
      unlock_condition: { type: 'streak', target: 30 }
    },

    // Spéciaux
    {
      id: 'early_adopter',
      title: 'Adopteur Précoce',
      description: 'Parmi les 100 premiers utilisateurs de l\'ADN Carrière',
      icon: '🚀',
      category: 'special',
      rarity: 'mythic',
      xp_reward: 10000,
      unlock_condition: { type: 'special', target: 1 }
    }
  ];

  // Créer ou récupérer le profil de jeu
  async getGameProfile(userId: string): Promise<UserGameProfile> {
    const { data, error } = await supabase
      .from('user_game_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Créer un nouveau profil
      return await this.createGameProfile(userId);
    }

    if (error) throw error;
    return data;
  }

  // Créer un nouveau profil de jeu
  private async createGameProfile(userId: string): Promise<UserGameProfile> {
    const newProfile: Omit<UserGameProfile, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      level: 1,
      total_xp: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity: new Date().toISOString(),
      achievements: [],
      progress_metrics: {
        tests_completed: 0,
        cv_optimizations: 0,
        appointments_booked: 0,
        skills_developed: 0,
        network_connections: 0,
        forum_posts: 0,
        articles_read: 0,
        courses_completed: 0,
        mentorship_sessions: 0,
        career_goals_achieved: 0
      },
      rewards_earned: {
        badges: [],
        certificates: [],
        unlocked_features: [],
        bonus_content: [],
        premium_days: 0,
        coins_earned: 0
      },
      daily_missions: [],
      weekly_challenges: [],
      leaderboard_rank: 0,
      badges: []
    };

    const { data, error } = await supabase
      .from('user_game_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) throw error;

    // Générer les missions quotidiennes initiales
    await this.generateDailyMissions(data.id);
    
    return data;
  }

  // Ajouter de l'XP et gérer les level ups
  async addXP(userId: string, xpAmount: number, source: string = 'general'): Promise<{
    newLevel: number;
    levelUp: boolean;
    unlockedFeatures: string[];
    newAchievements: Achievement[];
  }> {
    const profile = await this.getGameProfile(userId);
    const oldLevel = profile.level;
    const newTotalXP = profile.total_xp + xpAmount;
    
    // Calculer le nouveau niveau
    const newLevel = this.calculateLevel(newTotalXP);
    const levelUp = newLevel > oldLevel;
    
    // Déterminer les nouvelles fonctionnalités débloquées
    const unlockedFeatures: string[] = [];
    if (levelUp) {
      for (let level = oldLevel + 1; level <= newLevel; level++) {
        const levelInfo = this.LEVEL_SYSTEM.find(l => l.level === level);
        if (levelInfo) {
          unlockedFeatures.push(...levelInfo.unlock_features);
        }
      }
    }

    // Vérifier les nouveaux achievements
    const newAchievements = await this.checkAchievements(userId, profile);

    // Mettre à jour le profil
    const { error } = await supabase
      .from('user_game_profiles')
      .update({
        total_xp: newTotalXP,
        level: newLevel,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Enregistrer l'activité XP
    await this.logXPActivity(userId, xpAmount, source);

    return {
      newLevel,
      levelUp,
      unlockedFeatures,
      newAchievements
    };
  }

  // Calculer le niveau basé sur l'XP total
  private calculateLevel(totalXP: number): number {
    for (let i = this.LEVEL_SYSTEM.length - 1; i >= 0; i--) {
      const levelInfo = this.LEVEL_SYSTEM[i];
      if (totalXP >= levelInfo.min_xp) {
        return levelInfo.level;
      }
    }
    return 1;
  }

  // Vérifier et débloquer les achievements
  private async checkAchievements(userId: string, profile: UserGameProfile): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const currentAchievementIds = profile.achievements.map(a => a.id);

    for (const achievement of this.ACHIEVEMENTS_SYSTEM) {
      if (currentAchievementIds.includes(achievement.id)) continue;

      const unlocked = await this.checkAchievementCondition(userId, achievement, profile);
      
      if (unlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlocked_at: new Date().toISOString(),
          progress: achievement.unlock_condition.target,
          max_progress: achievement.unlock_condition.target
        };

        newAchievements.push(unlockedAchievement);

        // Sauvegarder l'achievement
        await this.unlockAchievement(userId, unlockedAchievement);
      }
    }

    return newAchievements;
  }

  // Vérifier une condition d'achievement
  private async checkAchievementCondition(
    userId: string, 
    achievement: Achievement, 
    profile: UserGameProfile
  ): Promise<boolean> {
    const condition = achievement.unlock_condition;

    switch (condition.type) {
      case 'test_completion':
        return profile.progress_metrics.tests_completed >= condition.target;
      
      case 'cv_score':
        // Vérifier le score CV le plus récent
        const { data: cvData } = await supabase
          .from('cv_analyses')
          .select('ats_score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        return cvData?.[0]?.ats_score >= condition.target;
      
      case 'appointments':
        return profile.progress_metrics.appointments_booked >= condition.target;
      
      case 'connections':
        return profile.progress_metrics.network_connections >= condition.target;
      
      case 'streak':
        return profile.current_streak >= condition.target;
      
      case 'level':
        return profile.level >= condition.target;
      
      case 'special':
        // Ces achievements nécessitent une logique spéciale
        return await this.checkSpecialCondition(userId, achievement.id, condition);
      
      default:
        return false;
    }
  }

  // Vérifier les conditions spéciales
  private async checkSpecialCondition(userId: string, achievementId: string, condition: UnlockCondition): Promise<boolean> {
    switch (achievementId) {
      case 'first_steps':
        // Vérifier si le profil utilisateur est complété
        const { data: userData } = await supabase
          .from('profiles')
          .select('first_name, last_name, bio')
          .eq('id', userId)
          .single();
        
        return !!(userData?.first_name && userData?.last_name && userData?.bio);
      
      case 'early_adopter':
        // Vérifier si parmi les 100 premiers à utiliser l'ADN Carrière
        const { count } = await supabase
          .from('career_dna')
          .select('*', { count: 'exact', head: true });
        
        return (count || 0) <= 100;
      
      default:
        return false;
    }
  }

  // Débloquer un achievement
  private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
        unlocked_at: achievement.unlocked_at,
        xp_earned: achievement.xp_reward
      });

    if (error) throw error;

    // Ajouter l'XP de l'achievement
    await this.addXP(userId, achievement.xp_reward, `achievement_${achievement.id}`);
  }

  // Générer les missions quotidiennes
  async generateDailyMissions(userId: string): Promise<DailyMission[]> {
    const profile = await this.getGameProfile(userId);
    const missions: DailyMission[] = [];

    // Missions basées sur le niveau de l'utilisateur
    const missionPool = this.getDailyMissionPool(profile.level);
    
    // Sélectionner 3 missions aléatoires
    const selectedMissions = this.selectRandomMissions(missionPool, 3);
    
    for (const missionTemplate of selectedMissions) {
      const mission: DailyMission = {
        ...missionTemplate,
        id: crypto.randomUUID(),
        progress: 0,
        completed: false,
        expires_at: this.getTomorrowMidnight()
      };
      
      missions.push(mission);
    }

    // Sauvegarder les missions
    const { error } = await supabase
      .from('daily_missions')
      .insert(
        missions.map(mission => ({
          ...mission,
          user_id: userId
        }))
      );

    if (error) throw error;

    return missions;
  }

  // Pool de missions quotidiennes
  private getDailyMissionPool(userLevel: number): Partial<DailyMission>[] {
    const baseMissions = [
      {
        title: "Explorateur du Jour",
        description: "Complétez un test d'orientation",
        type: 'learning' as const,
        difficulty: 'easy' as const,
        xp_reward: 100,
        completion_criteria: { action: 'complete_test', target: 1 },
        max_progress: 1
      },
      {
        title: "Optimiseur Actif",
        description: "Analysez votre CV avec l'ATS",
        type: 'action' as const,
        difficulty: 'easy' as const,
        xp_reward: 75,
        completion_criteria: { action: 'optimize_cv', target: 1 },
        max_progress: 1
      },
      {
        title: "Connecteur Social",
        description: "Ajoutez 2 nouvelles connexions professionnelles",
        type: 'social' as const,
        difficulty: 'medium' as const,
        xp_reward: 150,
        completion_criteria: { action: 'add_connections', target: 2 },
        max_progress: 2
      },
      {
        title: "Lecteur Assidu",
        description: "Lisez 3 articles de carrière",
        type: 'learning' as const,
        difficulty: 'easy' as const,
        xp_reward: 50,
        completion_criteria: { action: 'read_articles', target: 3 },
        max_progress: 3
      }
    ];

    // Missions avancées pour les niveaux élevés
    if (userLevel >= 5) {
      baseMissions.push({
        title: "Mentor en Herbe",
        description: "Aidez un autre utilisateur dans les forums",
        type: 'social' as const,
        difficulty: 'hard' as const,
        xp_reward: 300,
        completion_criteria: { action: 'help_user', target: 1 },
        max_progress: 1
      });
    }

    if (userLevel >= 10) {
      baseMissions.push({
        title: "Leader Inspirant",
        description: "Créez du contenu utile pour la communauté",
        type: 'action' as const,
        difficulty: 'hard' as const,
        xp_reward: 500,
        completion_criteria: { action: 'create_content', target: 1 },
        max_progress: 1
      });
    }

    return baseMissions;
  }

  // Sélectionner des missions aléatoires
  private selectRandomMissions(pool: Partial<DailyMission>[], count: number): Partial<DailyMission>[] {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Obtenir minuit de demain
  private getTomorrowMidnight(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  // Mettre à jour le progrès d'une mission
  async updateMissionProgress(
    userId: string, 
    action: string, 
    amount: number = 1
  ): Promise<{ completedMissions: DailyMission[], xpEarned: number }> {
    const { data: missions, error } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;

    const completedMissions: DailyMission[] = [];
    let totalXpEarned = 0;

    for (const mission of missions || []) {
      if (mission.completion_criteria.action === action) {
        const newProgress = Math.min(mission.progress + amount, mission.max_progress);
        const isCompleted = newProgress >= mission.max_progress;

        await supabase
          .from('daily_missions')
          .update({
            progress: newProgress,
            completed: isCompleted,
            updated_at: new Date().toISOString()
          })
          .eq('id', mission.id);

        if (isCompleted && !mission.completed) {
          completedMissions.push({ ...mission, progress: newProgress, completed: true });
          totalXpEarned += mission.xp_reward;
        }
      }
    }

    // Ajouter l'XP des missions complétées
    if (totalXpEarned > 0) {
      await this.addXP(userId, totalXpEarned, 'daily_missions');
    }

    return { completedMissions, xpEarned: totalXpEarned };
  }

  // Mettre à jour les métriques de progression
  async updateProgressMetric(
    userId: string, 
    metric: keyof ProgressMetrics, 
    increment: number = 1
  ): Promise<void> {
    const { error } = await supabase.rpc('increment_progress_metric', {
      p_user_id: userId,
      p_metric: metric,
      p_increment: increment
    });

    if (error) throw error;
  }

  // Obtenir le classement
  async getLeaderboard(limit: number = 50, timeframe: 'all_time' | 'monthly' | 'weekly' = 'all_time'): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('user_game_profiles')
      .select(`
        user_id,
        level,
        total_xp,
        profiles!inner(username, avatar_url)
      `)
      .order('total_xp', { ascending: false })
      .limit(limit);

    // Ajouter des filtres temporels si nécessaire
    if (timeframe === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('updated_at', monthAgo.toISOString());
    } else if (timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('updated_at', weekAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((entry, index) => ({
      user_id: entry.user_id,
      username: entry.profiles.username || 'Utilisateur',
      avatar_url: entry.profiles.avatar_url,
      level: entry.level,
      total_xp: entry.total_xp,
      achievements_count: 0, // À calculer séparément si nécessaire
      rank: index + 1,
      trend: 'same' as const // À calculer basé sur l'historique
    }));
  }

  // Enregistrer l'activité XP
  private async logXPActivity(userId: string, xpAmount: number, source: string): Promise<void> {
    const { error } = await supabase
      .from('xp_activities')
      .insert({
        user_id: userId,
        xp_amount: xpAmount,
        source,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // Obtenir l'historique XP
  async getXPHistory(userId: string, limit: number = 30): Promise<any[]> {
    const { data, error } = await supabase
      .from('xp_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Obtenir les statistiques de gamification
  async getGamificationStats(userId: string): Promise<{
    totalUsers: number;
    userRank: number;
    averageLevel: number;
    topAchievers: LeaderboardEntry[];
  }> {
    const [totalUsersResult, userProfileResult, leaderboardResult] = await Promise.all([
      supabase.from('user_game_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_game_profiles').select('level, total_xp').eq('user_id', userId).single(),
      this.getLeaderboard(10)
    ]);

    const totalUsers = totalUsersResult.count || 0;
    const userProfile = userProfileResult.data;
    
    // Calculer le rang de l'utilisateur
    const { data: higherRankedUsers } = await supabase
      .from('user_game_profiles')
      .select('user_id', { count: 'exact', head: true })
      .gt('total_xp', userProfile?.total_xp || 0);

    const userRank = (higherRankedUsers || []).length + 1;

    // Calculer le niveau moyen
    const { data: allProfiles } = await supabase
      .from('user_game_profiles')
      .select('level');

    const averageLevel = allProfiles?.length 
      ? allProfiles.reduce((sum, p) => sum + p.level, 0) / allProfiles.length 
      : 1;

    return {
      totalUsers,
      userRank,
      averageLevel: Math.round(averageLevel * 10) / 10,
      topAchievers: leaderboardResult
    };
  }

  // Obtenir les informations de niveau
  getLevelInfo(level: number): LevelInfo | null {
    return this.LEVEL_SYSTEM.find(l => l.level === level) || null;
  }

  // Obtenir le prochain niveau
  getNextLevelInfo(currentLevel: number): LevelInfo | null {
    return this.LEVEL_SYSTEM.find(l => l.level === currentLevel + 1) || null;
  }

  // Obtenir les achievements disponibles
  getAvailableAchievements(): Achievement[] {
    return this.ACHIEVEMENTS_SYSTEM;
  }

  // Obtenir les achievements par catégorie
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.ACHIEVEMENTS_SYSTEM.filter(a => a.category === category);
  }
}
