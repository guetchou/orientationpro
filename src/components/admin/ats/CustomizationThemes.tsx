import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Alert
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Brush as BrushIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  CheckCircle,
  Cancel,
  Warning,
  Info
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  isActive: boolean;
  isCustom: boolean;
}

interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  sidebarWidth: number;
  headerHeight: number;
  cardSpacing: number;
  borderRadius: number;
  isActive: boolean;
}

interface FontConfig {
  id: string;
  name: string;
  family: string;
  size: number;
  weight: string;
  isActive: boolean;
}

interface CustomizationSettings {
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  notifications: boolean;
  animations: boolean;
  compactMode: boolean;
  highContrast: boolean;
}

const CustomizationThemes: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#1976d2');
  const [previewMode, setPreviewMode] = useState(false);

  // Thèmes prédéfinis adaptés au contexte congolais
  const themes: ThemeConfig[] = [
    {
      id: '1',
      name: 'Congo Vert',
      description: 'Thème officiel aux couleurs du drapeau congolais',
      primaryColor: '#009E60',
      secondaryColor: '#FFD700',
      backgroundColor: '#F8F9FA',
      textColor: '#2C3E50',
      accentColor: '#E74C3C',
      isActive: true,
      isCustom: false
    },
    {
      id: '2',
      name: 'Brazzaville Moderne',
      description: 'Design moderne inspiré de la capitale',
      primaryColor: '#3498DB',
      secondaryColor: '#2ECC71',
      backgroundColor: '#FFFFFF',
      textColor: '#34495E',
      accentColor: '#E67E22',
      isActive: false,
      isCustom: false
    },
    {
      id: '3',
      name: 'Kinshasa Élégant',
      description: 'Style élégant avec des tons chauds',
      primaryColor: '#8B4513',
      secondaryColor: '#DAA520',
      backgroundColor: '#FDF5E6',
      textColor: '#2F4F4F',
      accentColor: '#CD853F',
      isActive: false,
      isCustom: false
    },
    {
      id: '4',
      name: 'Afrique Digitale',
      description: 'Thème tech avec des couleurs africaines',
      primaryColor: '#FF6B35',
      secondaryColor: '#004E89',
      backgroundColor: '#F0F8FF',
      textColor: '#1A1A1A',
      accentColor: '#00A896',
      isActive: false,
      isCustom: false
    },
    {
      id: '5',
      name: 'Mon Thème',
      description: 'Personnalisation personnalisée',
      primaryColor: '#9C27B0',
      secondaryColor: '#FF9800',
      backgroundColor: '#FAFAFA',
      textColor: '#212121',
      accentColor: '#4CAF50',
      isActive: false,
      isCustom: true
    }
  ];

  // Configurations de mise en page
  const layouts: LayoutConfig[] = [
    {
      id: '1',
      name: 'Standard',
      description: 'Mise en page classique avec sidebar fixe',
      sidebarWidth: 280,
      headerHeight: 64,
      cardSpacing: 24,
      borderRadius: 8,
      isActive: true
    },
    {
      id: '2',
      name: 'Compact',
      description: 'Interface optimisée pour l\'efficacité',
      sidebarWidth: 240,
      headerHeight: 56,
      cardSpacing: 16,
      borderRadius: 4,
      isActive: false
    },
    {
      id: '3',
      name: 'Large',
      description: 'Espace généreux pour une meilleure lisibilité',
      sidebarWidth: 320,
      headerHeight: 72,
      cardSpacing: 32,
      borderRadius: 12,
      isActive: false
    }
  ];

  // Configurations de police
  const fonts: FontConfig[] = [
    {
      id: '1',
      name: 'Inter (Recommandé)',
      family: 'Inter, sans-serif',
      size: 14,
      weight: '400',
      isActive: true
    },
    {
      id: '2',
      name: 'Roboto',
      family: 'Roboto, sans-serif',
      size: 14,
      weight: '400',
      isActive: false
    },
    {
      id: '3',
      name: 'Open Sans',
      family: 'Open Sans, sans-serif',
      size: 14,
      weight: '400',
      isActive: false
    },
    {
      id: '4',
      name: 'Poppins',
      family: 'Poppins, sans-serif',
      size: 14,
      weight: '400',
      isActive: false
    }
  ];

  // Paramètres de personnalisation
  const [customizationSettings, setCustomizationSettings] = useState<CustomizationSettings>({
    language: 'fr',
    currency: 'XAF',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notifications: true,
    animations: true,
    compactMode: false,
    highContrast: false
  });

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    // Appliquer le thème
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
      document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
      document.documentElement.style.setProperty('--text-color', theme.textColor);
      document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    }
  };

  const handleColorChange = (color: any) => {
    setCurrentColor(color.hex);
  };

  const handleSaveTheme = () => {
    console.log('Sauvegarde du thème personnalisé');
    setShowColorPicker(false);
  };

  const handleExportTheme = () => {
    console.log('Export du thème actuel');
  };

  const handleImportTheme = () => {
    console.log('Import d\'un thème');
  };

  const getActiveTheme = () => {
    return themes.find(theme => theme.isActive);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
        🎨 Personnalisation & Thèmes Avancés
      </Typography>

      {/* Mode aperçu */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Aperçu en Temps Réel</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={previewMode}
                  onChange={(e) => setPreviewMode(e.target.checked)}
                />
              }
              label="Mode aperçu"
            />
          </Box>
          
          {previewMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Les modifications sont appliquées en temps réel. Utilisez le mode aperçu pour tester vos changements.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="🎨 Thèmes" />
          <Tab label="📐 Mise en Page" />
          <Tab label="🔤 Polices" />
          <Tab label="⚙️ Paramètres" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Thèmes et Couleurs</Typography>
          
          {/* Thème actuel */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Thème Actuel"
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportTheme}
                    size="small"
                  >
                    Exporter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={handleImportTheme}
                    size="small"
                  >
                    Importer
                  </Button>
                </Box>
              }
            />
            <CardContent>
              {getActiveTheme() && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {getActiveTheme()?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getActiveTheme()?.description}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        Couleurs du thème:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: getActiveTheme()?.primaryColor,
                            borderRadius: 1,
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: getActiveTheme()?.secondaryColor,
                            borderRadius: 1,
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: getActiveTheme()?.accentColor,
                            borderRadius: 1,
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>
                        Aperçu:
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: getActiveTheme()?.backgroundColor,
                          color: getActiveTheme()?.textColor,
                          borderRadius: 2,
                          border: `2px solid ${getActiveTheme()?.primaryColor}`
                        }}
                      >
                        <Typography variant="body2">
                          Exemple de contenu avec le thème actuel
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Sélection de thèmes */}
          <Typography variant="h6" gutterBottom>Choisir un Thème</Typography>
          <Grid container spacing={3}>
            {themes.map((theme) => (
              <Grid item xs={12} sm={6} md={4} key={theme.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: theme.isActive ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 40, 
                        borderRadius: 1,
                        background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                        mr: 2
                      }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {theme.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {theme.description}
                        </Typography>
                      </Box>
                      {theme.isActive && (
                        <CheckCircle color="success" />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: theme.primaryColor,
                          borderRadius: '50%'
                        }}
                      />
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: theme.secondaryColor,
                          borderRadius: '50%'
                        }}
                      />
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: theme.accentColor,
                          borderRadius: '50%'
                        }}
                      />
                    </Box>
                    
                    {theme.isCustom && (
                      <Chip label="Personnalisé" size="small" color="primary" />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Personnalisation de couleurs */}
          <Card sx={{ mt: 3 }}>
            <CardHeader
              title="Personnaliser les Couleurs"
              action={
                <Button
                  variant="contained"
                  startIcon={<PaletteIcon />}
                  onClick={() => setShowColorPicker(true)}
                >
                  Sélecteur de Couleurs
                </Button>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Créez votre propre palette de couleurs pour personnaliser l\'apparence du système.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Mise en Page et Layout</Typography>
          <Grid container spacing={3}>
            {layouts.map((layout) => (
              <Grid item xs={12} md={4} key={layout.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: layout.isActive ? '2px solid #1976d2' : '2px solid transparent'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {layout.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {layout.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Largeur sidebar: {layout.sidebarWidth}px
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Hauteur header: {layout.headerHeight}px
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Espacement cartes: {layout.cardSpacing}px
                      </Typography>
                      <Typography variant="body2">
                        Rayon bordures: {layout.borderRadius}px
                      </Typography>
                    </Box>
                    
                    {layout.isActive && (
                      <Chip label="Actif" color="success" size="small" />
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
          <Typography variant="h6" gutterBottom>Polices et Typographie</Typography>
          <Grid container spacing={3}>
            {fonts.map((font) => (
              <Grid item xs={12} md={6} key={font.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: font.isActive ? '2px solid #1976d2' : '2px solid transparent'
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontFamily: font.family, mb: 2 }}
                    >
                      Exemple de texte avec cette police. The quick brown fox jumps over the lazy dog.
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Famille: {font.family}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Taille: {font.size}px
                      </Typography>
                      <Typography variant="body2">
                        Poids: {font.weight}
                      </Typography>
                    </Box>
                    
                    {font.isActive && (
                      <Chip label="Actif" color="success" size="small" />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Paramètres de Personnalisation</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Préférences Régionales" />
                <CardContent>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Langue</InputLabel>
                    <Select
                      value={customizationSettings.language}
                      onChange={(e) => setCustomizationSettings({
                        ...customizationSettings,
                        language: e.target.value
                      })}
                      label="Langue"
                    >
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ln">Lingala</MenuItem>
                      <MenuItem value="kg">Kikongo</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Devise</InputLabel>
                    <Select
                      value={customizationSettings.currency}
                      onChange={(e) => setCustomizationSettings({
                        ...customizationSettings,
                        currency: e.target.value
                      })}
                      label="Devise"
                    >
                      <MenuItem value="XAF">Franc CFA (XAF)</MenuItem>
                      <MenuItem value="USD">Dollar US (USD)</MenuItem>
                      <MenuItem value="EUR">Euro (EUR)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Format de Date</InputLabel>
                    <Select
                      value={customizationSettings.dateFormat}
                      onChange={(e) => setCustomizationSettings({
                        ...customizationSettings,
                        dateFormat: e.target.value
                      })}
                      label="Format de Date"
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Format d'Heure</InputLabel>
                    <Select
                      value={customizationSettings.timeFormat}
                      onChange={(e) => setCustomizationSettings({
                        ...customizationSettings,
                        timeFormat: e.target.value
                      })}
                      label="Format d'Heure"
                    >
                      <MenuItem value="24h">24 heures</MenuItem>
                      <MenuItem value="12h">12 heures</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Préférences d'Interface" />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customizationSettings.notifications}
                        onChange={(e) => setCustomizationSettings({
                          ...customizationSettings,
                          notifications: e.target.checked
                        })}
                      />
                    }
                    label="Notifications"
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customizationSettings.animations}
                        onChange={(e) => setCustomizationSettings({
                          ...customizationSettings,
                          animations: e.target.checked
                        })}
                      />
                    }
                    label="Animations"
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customizationSettings.compactMode}
                        onChange={(e) => setCustomizationSettings({
                          ...customizationSettings,
                          compactMode: e.target.checked
                        })}
                      />
                    }
                    label="Mode compact"
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={customizationSettings.highContrast}
                        onChange={(e) => setCustomizationSettings({
                          ...customizationSettings,
                          highContrast: e.target.checked
                        })}
                      />
                    }
                    label="Contraste élevé"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog sélecteur de couleurs */}
      <Dialog 
        open={showColorPicker} 
        onClose={() => setShowColorPicker(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sélecteur de Couleurs</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <SketchPicker
              color={currentColor}
              onChange={handleColorChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowColorPicker(false)}>
            Annuler
          </Button>
          <Button onClick={handleSaveTheme} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomizationThemes; 