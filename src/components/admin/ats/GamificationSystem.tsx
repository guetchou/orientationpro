import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Rating,
  Stack
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  Psychology,
  School,
  Work,
  Group,
  Leaderboard,
  Gift,
  Celebration,
  LocalFireDepartment,
  PsychologyAlt,
  SchoolOutlined,
  WorkOutline,
  GroupOutlined,
  LeaderboardOutlined,
  GiftOutlined,
  CelebrationOutlined,
  LocalFireDepartmentOutlined,
  PsychologyAltOutlined,
  SchoolOutlined as SchoolIcon,
  WorkOutline as WorkIcon,
  GroupOutlined as GroupIcon,
  LeaderboardOutlined as LeaderboardIcon,
  GiftOutlined as GiftIcon,
  CelebrationOutlined as CelebrationIcon,
  LocalFireDepartmentOutlined as FireIcon,
  PsychologyAltOutlined as PsychologyIcon,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'recruitment' | 'management' | 'performance' | 'social' | 'special';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  points: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  deadline?: Date;
  rewards: string[];
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  role: string;
  points: number;
  level: number;
  badges: number;
  rank: number;
  department: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'badge' | 'points' | 'title' | 'feature' | 'recognition';
  value: number;
  unlocked: boolean;
  requirements: string[];
}

const GamificationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  const [userPoints, setUserPoints] = useState(2847);
  const [userLevel, setUserLevel] = useState(15);
  const [userBadges, setUserBadges] = useState(23);

  // Données de gamification adaptées au contexte congolais
  const badges: Badge[] = [
    {
      id: '1',
      name: 'Recruteur Expert',
      description: 'A recruté 50+ candidats qualifiés',
      icon: 'target',
      category: 'recruitment',
      points: 500,
      rarity: 'epic',
      unlocked: true,
      progress: 50,
      maxProgress: 50
    },
    {
      id: '2',
      name: 'Gestionnaire de Talents',
      description: 'Géré 100+ candidatures avec succès',
      icon: '👥',
      category: 'management',
      points: 300,
      rarity: 'rare',
      unlocked: true,
      progress: 100,
      maxProgress: 100
    },
    {
      id: '3',
      name: 'Analyste de Données',
      description: 'Généré 25+ rapports d\'analyse',
      icon: 'chart',
      category: 'performance',
      points: 400,
      rarity: 'rare',
      unlocked: false,
      progress: 18,
      maxProgress: 25
    },
    {
      id: '4',
      name: 'Mentor Congolais',
      description: 'A formé 10+ nouveaux recruteurs',
      icon: '🎓',
      category: 'social',
      points: 600,
      rarity: 'legendary',
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: '5',
      name: 'Innovateur RH',
      description: 'Implémenté 5+ nouvelles fonctionnalités',
      icon: 'lightbulb',
      category: 'special',
      points: 800,
      rarity: 'legendary',
      unlocked: false,
      progress: 3,
      maxProgress: 5
    },
    {
      id: '6',
      name: 'Spécialiste Local',
      description: 'Recruté dans 5+ provinces du Congo',
      icon: '🇨🇬',
      category: 'recruitment',
      points: 350,
      rarity: 'epic',
      unlocked: true,
      progress: 5,
      maxProgress: 5
    },
    {
      id: '7',
      name: 'Communicateur Bilingue',
      description: 'Géré des recrutements en français et lingala',
      icon: 'speech',
      category: 'social',
      points: 250,
      rarity: 'rare',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '8',
      name: 'Expert Digital',
      description: 'Utilisé toutes les fonctionnalités digitales',
      icon: '💻',
      category: 'performance',
      points: 450,
      rarity: 'epic',
      unlocked: false,
      progress: 8,
      maxProgress: 12
    }
  ];

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'Recrutement Express',
      description: 'Recruter 10 candidats en 7 jours',
      category: 'weekly',
      points: 200,
      progress: 7,
      maxProgress: 10,
      completed: false,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      rewards: ['Badge "Recruteur Express"', '500 points bonus']
    },
    {
      id: '2',
      title: 'Diversité Locale',
      description: 'Recruter des candidats de 3 provinces différentes',
      category: 'monthly',
      points: 300,
      progress: 2,
      maxProgress: 3,
      completed: false,
      rewards: ['Badge "Spécialiste Local"', '750 points bonus']
    },
    {
      id: '3',
      title: 'Formation Continue',
      description: 'Compléter 5 modules de formation',
      category: 'weekly',
      points: 150,
      progress: 3,
      maxProgress: 5,
      completed: false,
      rewards: ['Badge "Apprenant"', '300 points bonus']
    },
    {
      id: '4',
      title: 'Collaboration Équipe',
      description: 'Partager 10 candidats avec l\'équipe',
      category: 'daily',
      points: 100,
      progress: 6,
      maxProgress: 10,
      completed: false,
      rewards: ['Badge "Team Player"', '200 points bonus']
    },
    {
      id: '5',
      title: 'Innovation RH',
      description: 'Proposer 3 nouvelles idées d\'amélioration',
      category: 'monthly',
      points: 400,
      progress: 1,
      maxProgress: 3,
      completed: false,
      rewards: ['Badge "Innovateur"', '1000 points bonus']
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Marie Nzola',
      avatar: 'user-female',
      role: 'Responsable RH',
      points: 3847,
      level: 18,
      badges: 25,
      rank: 1,
      department: 'Ressources Humaines'
    },
    {
      id: '2',
      name: 'Jean-Pierre Makaya',
      avatar: 'user-male',
      role: 'Recruteur Senior',
      points: 3241,
      level: 16,
      badges: 22,
      rank: 2,
      department: 'Ressources Humaines'
    },
    {
      id: '3',
      name: 'Sophie Lemba',
      avatar: 'user-female',
      role: 'Analyste RH',
      points: 2987,
      level: 14,
      badges: 19,
      rank: 3,
      department: 'Ressources Humaines'
    },
    {
      id: '4',
      name: 'David Mwamba',
      avatar: 'user-male',
      role: 'Recruteur',
      points: 2654,
      level: 12,
      badges: 16,
      rank: 4,
      department: 'Ressources Humaines'
    },
    {
      id: '5',
      name: 'Grace Tshibanda',
      avatar: 'user-female',
      role: 'Coordinatrice RH',
      points: 2432,
      level: 11,
      badges: 14,
      rank: 5,
      department: 'Ressources Humaines'
    }
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Expert RH Congolais',
      description: 'Titre exclusif pour les meilleurs recruteurs',
      type: 'title',
      value: 1000,
      unlocked: false,
      requirements: ['Niveau 20', '50+ recrutements', '10+ badges']
    },
    {
      id: '2',
      name: 'Accès Premium',
      description: 'Fonctionnalités avancées du système',
      type: 'feature',
      value: 2000,
      unlocked: false,
      requirements: ['Niveau 15', '1000+ points', '5+ badges rares']
    },
    {
      id: '3',
      name: 'Formation Gratuite',
      description: 'Formation certifiante en RH',
      type: 'recognition',
      value: 1500,
      unlocked: false,
      requirements: ['Niveau 12', '25+ recrutements', '3+ badges épiques']
    },
    {
      id: '4',
      name: 'Mentor Officiel',
      description: 'Devenir mentor des nouveaux recruteurs',
      type: 'title',
      value: 3000,
      unlocked: false,
      requirements: ['Niveau 25', '100+ recrutements', '15+ badges']
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recruitment': return '●';
      case 'management': return '👥';
      case 'performance': return '■';
      case 'social': return '🤝';
      case 'special': return '◆';
      default: return '▲';
    }
  };

  const getChallengeIcon = (category: string) => {
    switch (category) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '📅';
      case 'special': return '⭐';
      default: return '🎯';
    }
  };

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeDialog(true);
  };

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowChallengeDialog(true);
  };

  const getProgressPercentage = (progress: number, maxProgress: number) => {
    return Math.min((progress / maxProgress) * 100, 100);
  };

  const getLevelProgress = () => {
    const pointsForNextLevel = userLevel * 200;
    const currentLevelPoints = (userLevel - 1) * 200;
    const progress = userPoints - currentLevelPoints;
    const maxProgress = pointsForNextLevel - currentLevelPoints;
    return (progress / maxProgress) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
        🎮 Système de Gamification
      </Typography>

      {/* Configuration générale */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Configuration Générale</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={gamificationEnabled}
                  onChange={(e) => setGamificationEnabled(e.target.checked)}
                />
              }
              label="Activer la gamification"
            />
          </Box>
          
          {gamificationEnabled && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h4" color="primary">🎯</Typography>
                  <Typography variant="h5" fontWeight="bold">{userPoints}</Typography>
                  <Typography variant="body2" color="text.secondary">Points Totaux</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h4" color="primary">⭐</Typography>
                  <Typography variant="h5" fontWeight="bold">Niveau {userLevel}</Typography>
                  <Typography variant="body2" color="text.secondary">Niveau Actuel</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getLevelProgress()} 
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h4" color="primary">🏆</Typography>
                  <Typography variant="h5" fontWeight="bold">{userBadges}</Typography>
                  <Typography variant="body2" color="text.secondary">Badges Débloqués</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="🏆 Badges" />
          <Tab label="🎯 Défis" />
          <Tab label="📊 Classement" />
          <Tab label="🎁 Récompenses" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Badges et Accomplissements</Typography>
          <Grid container spacing={3}>
            {badges.map((badge) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                    border: badge.unlocked ? `2px solid ${getRarityColor(badge.rarity)}` : '2px solid #e0e0e0'
                  }}
                  onClick={() => handleBadgeClick(badge)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>
                      {badge.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {badge.description}
                    </Typography>
                    
                    {badge.unlocked ? (
                      <Chip 
                        label={`+${badge.points} points`}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getProgressPercentage(badge.progress || 0, badge.maxProgress || 1)}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {badge.progress}/{badge.maxProgress}
                        </Typography>
                      </Box>
                    )}
                    
                    <Chip 
                      label={badge.rarity}
                      size="small"
                      sx={{ 
                        mt: 1,
                        bgcolor: getRarityColor(badge.rarity),
                        color: 'white'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Défis et Missions</Typography>
          <Grid container spacing={3}>
            {challenges.map((challenge) => (
              <Grid item xs={12} md={6} key={challenge.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => handleChallengeClick(challenge)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>
                        {getChallengeIcon(challenge.category)}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {challenge.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {challenge.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`+${challenge.points} points`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressPercentage(challenge.progress, challenge.maxProgress)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Progression: {challenge.progress}/{challenge.maxProgress}
                    </Typography>
                    
                    {challenge.deadline && (
                      <Typography variant="caption" display="block" color="warning.main" sx={{ mt: 1 }}>
                        ⏰ Échéance: {challenge.deadline.toLocaleDateString('fr-FR')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Classement des Meilleurs</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rang</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Badges</TableCell>
                  <TableCell>Département</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.id} sx={{ 
                    bgcolor: entry.rank <= 3 ? '#fff3e0' : 'inherit'
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {entry.rank === 1 && <EmojiEvents sx={{ color: '#ffd700', mr: 1 }} />}
                        {entry.rank === 2 && <Star sx={{ color: '#c0c0c0', mr: 1 }} />}
                        {entry.rank === 3 && <TrendingUp sx={{ color: '#cd7f32', mr: 1 }} />}
                        <Typography variant="h6">{entry.rank}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{entry.avatar}</Avatar>
                        <Typography variant="body1">{entry.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{entry.role}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {entry.points}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`Niveau ${entry.level}`} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{entry.badges} badges</Typography>
                    </TableCell>
                    <TableCell>{entry.department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Récompenses et Titres</Typography>
          <Grid container spacing={3}>
            {rewards.map((reward) => (
              <Grid item xs={12} md={6} key={reward.id}>
                <Card sx={{ 
                  border: reward.unlocked ? '2px solid #4caf50' : '2px solid #e0e0e0'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h3" sx={{ mr: 2 }}>
                        {reward.type === 'title' ? '👑' : 
                         reward.type === 'feature' ? '🔓' : 
                         reward.type === 'recognition' ? '🏆' : '🎁'}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {reward.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reward.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${reward.value} points`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Exigences:</strong>
                    </Typography>
                    <List dense>
                      {reward.requirements.map((req, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={req}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Chip 
                      label={reward.unlocked ? 'Débloqué' : 'Verrouillé'}
                      color={reward.unlocked ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Dialog pour les détails des badges */}
      <Dialog 
        open={showBadgeDialog} 
        onClose={() => setShowBadgeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedBadge && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ mr: 2 }}>
                  {selectedBadge.icon}
                </Typography>
                <Box>
                  <Typography variant="h6">{selectedBadge.name}</Typography>
                  <Chip 
                    label={selectedBadge.rarity}
                    size="small"
                    sx={{ 
                      bgcolor: getRarityColor(selectedBadge.rarity),
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedBadge.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Points: {selectedBadge.points}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Catégorie: {selectedBadge.category}
                </Typography>
              </Box>
              
              {selectedBadge.unlocked ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Badge débloqué avec succès!
                </Alert>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Progression pour débloquer:
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getProgressPercentage(selectedBadge.progress || 0, selectedBadge.maxProgress || 1)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedBadge.progress}/{selectedBadge.maxProgress}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowBadgeDialog(false)}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog pour les détails des défis */}
      <Dialog 
        open={showChallengeDialog} 
        onClose={() => setShowChallengeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedChallenge && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ mr: 2 }}>
                  {getChallengeIcon(selectedChallenge.category)}
                </Typography>
                <Box>
                  <Typography variant="h6">{selectedChallenge.title}</Typography>
                  <Chip 
                    label={selectedChallenge.category}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedChallenge.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Points à gagner: {selectedChallenge.points}
                </Typography>
                {selectedChallenge.deadline && (
                  <Typography variant="body2" color="text.secondary">
                    Échéance: {selectedChallenge.deadline.toLocaleDateString('fr-FR')}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Progression:
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage(selectedChallenge.progress, selectedChallenge.maxProgress)}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                {selectedChallenge.progress}/{selectedChallenge.maxProgress}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Récompenses:
              </Typography>
              <List dense>
                {selectedChallenge.rewards.map((reward, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText 
                      primary={reward}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowChallengeDialog(false)}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GamificationSystem; 