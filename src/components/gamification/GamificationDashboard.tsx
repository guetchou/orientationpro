import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  GamificationService, 
  UserGameProfile, 
  DailyMission, 
  Achievement,
  LeaderboardEntry 
} from '@/services/gamification/GamificationService';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Users,
  Award,
  Calendar,
  TrendingUp,
  Crown,
  Flame,
  Gift,
  CheckCircle,
  Lock,
  Sparkles,
  BarChart3,
  Clock,
  Medal,
  Loader2
} from 'lucide-react';

interface GamificationDashboardProps {
  userId: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userId }) => {
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const gamificationService = new GamificationService();

  useEffect(() => {
    loadGameData();
  }, [userId]);

  const loadGameData = async () => {
    try {
      setIsLoading(true);
      const [profile, leaderboardData, statsData] = await Promise.all([
        gamificationService.getGameProfile(userId),
        gamificationService.getLeaderboard(10),
        gamificationService.getGamificationStats(userId)
      ]);
      
      setGameProfile(profile);
      setLeaderboard(leaderboardData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement données gamification:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos données de progression.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeMission = async (missionId: string, action: string) => {
    try {
      const result = await gamificationService.updateMissionProgress(userId, action, 1);
      
      if (result.completedMissions.length > 0) {
        toast({
          title: "Mission complétée ! 🎉",
          description: `Vous avez gagné ${result.xpEarned} XP !`,
          duration: 3000,
        });
        
        // Recharger les données
        await loadGameData();
      }
    } catch (error) {
      console.error('Erreur completion mission:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gameProfile) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Erreur de Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impossible de charger votre profil de jeu.</p>
        </CardContent>
      </Card>
    );
  }

  const currentLevelInfo = gamificationService.getLevelInfo(gameProfile.level);
  const nextLevelInfo = gamificationService.getNextLevelInfo(gameProfile.level);
  const xpToNextLevel = nextLevelInfo ? nextLevelInfo.min_xp - gameProfile.total_xp : 0;
  const progressToNextLevel = nextLevelInfo 
    ? ((gameProfile.total_xp - (currentLevelInfo?.min_xp || 0)) / (nextLevelInfo.min_xp - (currentLevelInfo?.min_xp || 0))) * 100
    : 100;

  // Filtrer les missions actives
  const activeMissions = gameProfile.daily_missions.filter(m => 
    new Date(m.expires_at) > new Date() && !m.completed
  );

  return (
    <div className="space-y-6">
      {/* En-tête de profil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-primary/10 to-blue/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-blue flex items-center justify-center text-white text-2xl font-bold">
                  {gameProfile.level}
                </div>
                {gameProfile.current_streak > 0 && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    <Flame className="h-3 w-3" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold">Niveau {gameProfile.level}</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {currentLevelInfo?.title || 'Explorateur'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {gameProfile.total_xp.toLocaleString()} XP
                    </div>
                    <div className="flex items-center">
                      <Flame className="h-4 w-4 mr-1 text-orange-500" />
                      {gameProfile.current_streak} jours de suite
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                      #{stats?.userRank || '?'}
                    </div>
                  </div>
                  
                  {nextLevelInfo && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression vers {nextLevelInfo.title}</span>
                        <span>{xpToNextLevel} XP restants</span>
                      </div>
                      <Progress value={progressToNextLevel} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Rang Global</div>
                <div className="text-3xl font-bold text-primary">#{stats?.userRank || '?'}</div>
                <div className="text-xs text-gray-500">sur {stats?.totalUsers || '?'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Onglets principaux */}
      <Tabs defaultValue="missions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="achievements">Succès</TabsTrigger>
          <TabsTrigger value="leaderboard">Classement</TabsTrigger>
          <TabsTrigger value="rewards">Récompenses</TabsTrigger>
        </TabsList>

        {/* Onglet Missions Quotidiennes */}
        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Missions Quotidiennes
                <Badge variant="outline" className="ml-2">
                  {activeMissions.filter(m => m.completed).length}/{activeMissions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeMissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nouvelles missions générées à minuit</p>
                </div>
              ) : (
                activeMissions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={(action) => completeMission(mission.id, action)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Statistiques des missions */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={Target}
              label="Tests Complétés"
              value={gameProfile.progress_metrics.tests_completed}
              color="text-blue-600"
            />
            <StatCard
              icon={Award}
              label="CV Optimisés"
              value={gameProfile.progress_metrics.cv_optimizations}
              color="text-green-600"
            />
            <StatCard
              icon={Users}
              label="Connexions"
              value={gameProfile.progress_metrics.network_connections}
              color="text-purple-600"
            />
            <StatCard
              icon={Calendar}
              label="RDV Pris"
              value={gameProfile.progress_metrics.appointments_booked}
              color="text-orange-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Compétences"
              value={gameProfile.progress_metrics.skills_developed}
              color="text-red-600"
            />
          </div>
        </TabsContent>

        {/* Onglet Achievements */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {gamificationService.getAvailableAchievements().map(achievement => {
              const isUnlocked = gameProfile.achievements.some(a => a.id === achievement.id);
              const userAchievement = gameProfile.achievements.find(a => a.id === achievement.id);
              
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={isUnlocked}
                  unlockedAt={userAchievement?.unlocked_at}
                  progress={userAchievement?.progress}
                />
              );
            })}
          </div>
        </TabsContent>

        {/* Onglet Classement */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                Top 10 Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <LeaderboardCard
                    key={entry.user_id}
                    entry={entry}
                    isCurrentUser={entry.user_id === userId}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vos Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">#{stats?.userRank}</div>
                  <div className="text-sm text-gray-600">Votre rang</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.averageLevel}</div>
                  <div className="text-sm text-gray-600">Niveau moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Récompenses */}
        <TabsContent value="rewards" className="space-y-4">
          <RewardsSection rewards={gameProfile.rewards_earned} level={gameProfile.level} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Composants auxiliaires
const MissionCard: React.FC<{
  mission: DailyMission;
  onComplete: (action: string) => void;
}> = ({ mission, onComplete }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learning': return <Target className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      case 'skill': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const progressPercentage = (mission.progress / mission.max_progress) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`border-l-4 ${mission.completed ? 'border-green-500 bg-green-50' : 'border-primary'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-primary">{getTypeIcon(mission.type)}</div>
                <h3 className="font-semibold">{mission.title}</h3>
                <Badge className={getDifficultyColor(mission.difficulty)}>
                  {mission.difficulty}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{mission.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{mission.progress}/{mission.max_progress}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
            
            <div className="text-right ml-4">
              <div className="text-sm text-gray-600">Récompense</div>
              <div className="text-lg font-bold text-primary flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {mission.xp_reward}
              </div>
              
              {mission.completed ? (
                <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complétée
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => onComplete(mission.completion_criteria.action)}
                  disabled={mission.progress >= mission.max_progress}
                >
                  Faire
                </Button>
              )}
            </div>
          </div>
          
          {mission.completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2"
            >
              <CheckCircle className="h-6 w-6 text-green-500" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AchievementCard: React.FC<{
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}> = ({ achievement, isUnlocked, unlockedAt, progress }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      case 'mythic': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-yellow-500 text-black';
      case 'mythic': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isUnlocked ? 1.05 : 1.02 }}
      className={`relative ${isUnlocked ? '' : 'opacity-60'}`}
    >
      <Card className={`${getRarityColor(achievement.rarity)} ${isUnlocked ? 'border-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
              {achievement.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{achievement.title}</h3>
                <div className="flex items-center space-x-2">
                  <Badge className={getRarityBadgeColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                  {isUnlocked ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-primary">
                  <Star className="h-3 w-3 mr-1" />
                  {achievement.xp_reward} XP
                </div>
                
                {isUnlocked && unlockedAt && (
                  <div className="text-xs text-gray-500">
                    Débloqué le {new Date(unlockedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              
              {!isUnlocked && progress !== undefined && achievement.max_progress && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progression</span>
                    <span>{progress}/{achievement.max_progress}</span>
                  </div>
                  <Progress value={(progress / achievement.max_progress) * 100} className="h-1" />
                </div>
              )}
            </div>
          </div>
          
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              className="absolute top-1 right-1"
            >
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LeaderboardCard: React.FC<{
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}> = ({ entry, isCurrentUser }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.05 }}
      className={`${isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''}`}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRankIcon(entry.rank)}
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatar_url} />
                <AvatarFallback>
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{entry.username}</h3>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">Vous</Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Niveau {entry.level} • {entry.total_xp.toLocaleString()} XP
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">#{entry.rank}</div>
              {entry.trend === 'up' && (
                <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatCard: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <Card>
    <CardContent className="p-4 text-center">
      <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </CardContent>
  </Card>
);

const RewardsSection: React.FC<{
  rewards: any;
  level: number;
}> = ({ rewards, level }) => {
  return (
    <div className="space-y-4">
      {/* Badges gagnés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Badges Collectés ({rewards.badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rewards.badges.map((badge: any, index: number) => (
              <div key={index} className="text-center p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-blue/5">
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </div>
            ))}
            
            {rewards.badges.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun badge encore. Complétez des missions pour en gagner !</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fonctionnalités débloquées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Fonctionnalités Débloquées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewards.unlocked_features.map((feature: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-semibold">{feature.feature_name}</div>
                  <div className="text-sm text-gray-600">
                    Débloqué le {new Date(feature.unlocked_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des récompenses */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{rewards.premium_days}</div>
            <div className="text-sm text-gray-600">Jours Premium</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{rewards.coins_earned}</div>
            <div className="text-sm text-gray-600">Pièces Gagnées</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{rewards.certificates.length}</div>
            <div className="text-sm text-gray-600">Certificats</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamificationDashboard;
