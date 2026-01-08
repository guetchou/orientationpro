import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Download,
  Share,
  FilterList,
  Refresh,
  Visibility,
  VisibilityOff,
  ExpandMore,
  Assessment,
  Analytics,
  Timeline,
  Compare,
  Insights,
  Warning,
  CheckCircle,
  Info,
  Error,
  LocalOffer,
  People,
  Work,
  School,
  LocationOn,
  Language,
  AccessTime,
  AttachMoney,
  Speed,
  Psychology,
  EmojiEvents,
  Star,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Compare as CompareIcon,
  Insights as InsightsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  LocalOffer as LocalOfferIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface ReportMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ReactNode;
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'hiring' | 'retention' | 'performance' | 'market';
  recommendations: string[];
  timeframe: string;
}

interface MarketTrend {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

const AdvancedReporting: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Métriques principales adaptées au contexte congolais
  const keyMetrics: ReportMetric[] = [
    {
      id: '1',
      name: 'Taux de Recrutement',
      value: 78.5,
      previousValue: 72.3,
      change: 6.2,
      changeType: 'increase',
      unit: '%',
      trend: 'up',
      color: '#10B981',
      icon: <PeopleIcon />
    },
    {
      id: '2',
      name: 'Temps de Recrutement Moyen',
      value: 23.4,
      previousValue: 28.7,
      change: -5.3,
      changeType: 'decrease',
      unit: 'jours',
      trend: 'down',
      color: '#3B82F6',
      icon: <AccessTimeIcon />
    },
    {
      id: '3',
      name: 'Coût par Recrutement',
      value: 450000,
      previousValue: 520000,
      change: -13.5,
      changeType: 'decrease',
      unit: 'XAF',
      trend: 'down',
      color: '#F59E0B',
      icon: <AttachMoneyIcon />
    },
    {
      id: '4',
      name: 'Satisfaction Candidats',
      value: 4.6,
      previousValue: 4.2,
      change: 9.5,
      changeType: 'increase',
      unit: '/5',
      trend: 'up',
      color: '#8B5CF6',
      icon: <StarIcon />
    },
    {
      id: '5',
      name: 'Diversité Géographique',
      value: 85.2,
      previousValue: 78.9,
      change: 8.0,
      changeType: 'increase',
      unit: '%',
      trend: 'up',
      color: '#EC4899',
      icon: <LocationOnIcon />
    },
    {
      id: '6',
      name: 'Taux de Rétention',
      value: 92.1,
      previousValue: 89.4,
      change: 3.0,
      changeType: 'increase',
      unit: '%',
      trend: 'up',
      color: '#059669',
      icon: <PsychologyIcon />
    }
  ];

  // Insights prédictifs
  const predictiveInsights: PredictiveInsight[] = [
    {
      id: '1',
      title: 'Pénurie de Développeurs Full-Stack',
      description: 'Prévision d\'une pénurie de 25% de développeurs full-stack dans les 6 prochains mois',
      confidence: 87,
      impact: 'high',
      category: 'hiring',
      recommendations: [
        'Lancer une campagne de recrutement proactive',
        'Partnership avec les écoles de formation',
        'Programme de formation interne'
      ],
      timeframe: '6 mois'
    },
    {
      id: '2',
      title: 'Augmentation des Salaires IT',
      description: 'Hausse prévue de 15% des salaires dans le secteur IT',
      confidence: 92,
      impact: 'high',
      category: 'market',
      recommendations: [
        'Révision des grilles salariales',
        'Optimisation du budget recrutement',
        'Négociation avec les candidats'
      ],
      timeframe: '3 mois'
    },
    {
      id: '3',
      title: 'Tendance Positive RH',
      description: 'Amélioration de 20% du taux de conversion des candidatures',
      confidence: 78,
      impact: 'medium',
      category: 'performance',
      recommendations: [
        'Optimisation du processus de sélection',
        'Formation des recruteurs',
        'Amélioration de l\'expérience candidat'
      ],
      timeframe: '4 mois'
    },
    {
      id: '4',
      title: 'Diversité Régionale',
      description: 'Opportunité d\'expansion dans les provinces du Nord',
      confidence: 85,
      impact: 'medium',
      category: 'hiring',
      recommendations: [
        'Campagne ciblée dans les provinces du Nord',
        'Partenariats locaux',
        'Formation des équipes locales'
      ],
      timeframe: '8 mois'
    }
  ];

  // Tendances du marché
  const marketTrends: MarketTrend[] = [
    {
      id: '1',
      metric: 'Demande Développeurs Mobile',
      currentValue: 45,
      predictedValue: 68,
      confidence: 89,
      timeframe: '6 mois',
      factors: ['Croissance des startups', 'Digitalisation des entreprises', 'Formation insuffisante']
    },
    {
      id: '2',
      metric: 'Salaires Moyens IT',
      currentValue: 850000,
      predictedValue: 980000,
      confidence: 94,
      timeframe: '12 mois',
      factors: ['Inflation', 'Concurrence internationale', 'Spécialisation']
    },
    {
      id: '3',
      metric: 'Taux de Chômage Tech',
      currentValue: 12.5,
      predictedValue: 8.2,
      confidence: 76,
      timeframe: '9 mois',
      factors: ['Croissance du secteur', 'Formation continue', 'Diversification']
    },
    {
      id: '4',
      metric: 'Demande Data Scientists',
      currentValue: 23,
      predictedValue: 42,
      confidence: 91,
      timeframe: '12 mois',
      factors: ['Big Data', 'IA/ML', 'Transformation digitale']
    }
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return '#10B981';
      case 'decrease': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hiring': return <PeopleIcon />;
      case 'retention': return <PsychologyIcon />;
      case 'performance': return <TrendingUpIcon />;
      case 'market': return <BarChartIcon />;
      default: return <InfoIcon />;
    }
  };

  const handleExportReport = () => {
    console.log(`Exporting report in ${exportFormat} format`);
    setShowExportDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
                      Rapports Avancés & Analyse Prédictive
      </Typography>

      {/* Configuration des rapports */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Configuration des Rapports</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Actualisation automatique"
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setShowExportDialog(true)}
              >
                Exporter
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Période</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Période"
                >
                  <MenuItem value="7d">7 derniers jours</MenuItem>
                  <MenuItem value="30d">30 derniers jours</MenuItem>
                  <MenuItem value="90d">90 derniers jours</MenuItem>
                  <MenuItem value="1y">1 an</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type de Rapport</InputLabel>
                <Select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  label="Type de Rapport"
                >
                  <MenuItem value="comprehensive">Rapport Complet</MenuItem>
                  <MenuItem value="hiring">Recrutement</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="predictive">Analyse Prédictive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                fullWidth
              >
                Actualiser les Données
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                          <Tab label="Métriques Clés" />
          <Tab label="Insights Prédictifs" />
                          <Tab label="Tendances Marché" />
                          <Tab label="Rapports Détaillés" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Métriques Clés de Performance</Typography>
          <Grid container spacing={3}>
            {keyMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: metric.color + '20',
                        color: metric.color,
                        mr: 2
                      }}>
                        {metric.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {metric.name}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={metric.color}>
                          {metric.value.toLocaleString()}{metric.unit}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        vs période précédente
                      </Typography>
                      <Chip
                        label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                        color={metric.changeType === 'increase' ? 'success' : 'error'}
                        size="small"
                        icon={metric.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Insights Prédictifs</Typography>
          <Grid container spacing={3}>
            {predictiveInsights.map((insight) => (
              <Grid item xs={12} md={6} key={insight.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: getImpactColor(insight.impact) + '20',
                        color: getImpactColor(insight.impact),
                        mr: 2
                      }}>
                        {getCategoryIcon(insight.category)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {insight.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {insight.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${insight.confidence}% confiance`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Impact: {insight.impact.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Horizon: {insight.timeframe}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Recommandations:
                    </Typography>
                    <List dense>
                      {insight.recommendations.map((rec, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={rec}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Tendances du Marché</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Métrique</TableCell>
                  <TableCell>Valeur Actuelle</TableCell>
                  <TableCell>Prédiction</TableCell>
                  <TableCell>Confiance</TableCell>
                  <TableCell>Horizon</TableCell>
                  <TableCell>Facteurs Clés</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marketTrends.map((trend) => (
                  <TableRow key={trend.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {trend.metric}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {trend.currentValue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {trend.predictedValue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${trend.confidence}%`}
                        color={trend.confidence > 80 ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{trend.timeframe}</TableCell>
                    <TableCell>
                      <Box>
                        {trend.factors.map((factor, index) => (
                          <Chip
                            key={index}
                            label={factor}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Rapports Détaillés</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Rapport de Recrutement"
                  action={
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Analyse complète des performances de recrutement
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      • Taux de conversion: 78.5%
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Temps moyen: 23.4 jours
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Coût moyen: 450,000 XAF
                    </Typography>
                    <Typography variant="body2">
                      • Satisfaction: 4.6/5
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Analyse de Diversité"
                  action={
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Répartition géographique et démographique
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      • Diversité géographique: 85.2%
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Parité hommes/femmes: 52/48
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      • Âge moyen: 28.5 ans
                    </Typography>
                    <Typography variant="body2">
                      • Niveau d'éducation: 78% Bac+5
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Prévisions et Recommandations"
                  action={
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Analyse prédictive et recommandations stratégiques
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Prévision:</strong> Pénurie de développeurs full-stack dans les 6 prochains mois
                      </Typography>
                    </Alert>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Recommandation:</strong> Lancer une campagne de recrutement proactive
                      </Typography>
                    </Alert>
                    <Alert severity="success">
                      <Typography variant="body2">
                        <strong>Opportunité:</strong> Expansion dans les provinces du Nord
                      </Typography>
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog d'export */}
      <Dialog 
        open={showExportDialog} 
        onClose={() => setShowExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Exporter le Rapport</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Format d'export</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Format d'export"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="powerpoint">PowerPoint</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Annuler
          </Button>
          <Button onClick={handleExportReport} variant="contained">
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedReporting; 