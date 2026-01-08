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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  LinearProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Security,
  Shield,
  Lock,
  Key,
  UserCheck,
  Warning,
  CheckCircle,
  Info,
  Download,
  Upload,
  Refresh,
  Settings,
  History,
  Delete,
  Edit,
  Add,
  Visibility,
  VisibilityOff,
  Key as KeyIcon,
  UserCheck as UserCheckIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Lock as LockIcon
} from '@mui/icons-material';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  event: string;
  user: string;
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'resolved' | 'pending' | 'investigating';
  description: string;
}

interface ComplianceCheck {
  id: string;
  name: string;
  category: 'gdpr' | 'local' | 'security' | 'privacy';
  status: 'compliant' | 'non-compliant' | 'pending';
  lastCheck: Date;
  nextCheck: Date;
  description: string;
  requirements: string[];
}

interface UserPermission {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  lastAccess: Date;
  status: 'active' | 'inactive' | 'suspended';
  department: string;
}

interface DataEncryption {
  id: string;
  type: 'personal' | 'sensitive' | 'financial';
  encryptionLevel: 'basic' | 'standard' | 'high';
  lastEncrypted: Date;
  status: 'encrypted' | 'pending' | 'failed';
  description: string;
}

const SecurityCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [securityEnabled, setSecurityEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [auditLogEnabled, setAuditLogEnabled] = useState(true);

  // Événements de sécurité
  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      event: 'Connexion suspecte détectée',
      user: 'marie.nzola@entreprise.cg',
      ip: '192.168.1.45',
      severity: 'high',
      status: 'investigating',
      description: 'Tentative de connexion depuis une IP non autorisée'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      event: 'Accès aux données personnelles',
      user: 'jean.makaya@entreprise.cg',
      ip: '192.168.1.23',
      severity: 'medium',
      status: 'resolved',
      description: 'Consultation des CV candidats - autorisé'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      event: 'Export de données',
      user: 'sophie.lemba@entreprise.cg',
      ip: '192.168.1.67',
      severity: 'low',
      status: 'resolved',
      description: 'Export rapport candidatures - conforme'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      event: 'Tentative d\'accès non autorisé',
      user: 'unknown@external.com',
      ip: '203.45.67.89',
      severity: 'critical',
      status: 'pending',
      description: 'Tentative d\'accès depuis IP externe bloquée'
    }
  ];

  // Vérifications de conformité
  const complianceChecks: ComplianceCheck[] = [
    {
      id: '1',
      name: 'Consentement RGPD',
      category: 'gdpr',
      status: 'compliant',
      lastCheck: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: 'Vérification du consentement explicite des candidats',
      requirements: [
        'Formulaire de consentement présent',
        'Option de retrait disponible',
        'Durée de conservation définie'
      ]
    },
    {
      id: '2',
      name: 'Chiffrement des Données',
      category: 'security',
      status: 'compliant',
      lastCheck: new Date(Date.now() - 12 * 60 * 60 * 1000),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: 'Chiffrement AES-256 des données sensibles',
      requirements: [
        'Chiffrement en transit (TLS 1.3)',
        'Chiffrement au repos (AES-256)',
        'Gestion sécurisée des clés'
      ]
    },
    {
      id: '3',
      name: 'Conformité Locale Congo',
      category: 'local',
      status: 'compliant',
      lastCheck: new Date(Date.now() - 48 * 60 * 60 * 1000),
      nextCheck: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description: 'Respect des lois congolaises sur la protection des données',
      requirements: [
        'Stockage local des données',
        'Autorisation CNIL Congo',
        'Respect des droits des candidats'
      ]
    },
    {
      id: '4',
      name: 'Audit Trail',
      category: 'security',
      status: 'compliant',
      lastCheck: new Date(Date.now() - 6 * 60 * 60 * 1000),
      nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: 'Traçabilité complète des actions utilisateurs',
      requirements: [
        'Logs d\'accès détaillés',
        'Horodatage précis',
        'Conservation 2 ans minimum'
      ]
    },
    {
      id: '5',
      name: 'Suppression des Données',
      category: 'privacy',
      status: 'pending',
      lastCheck: new Date(Date.now() - 72 * 60 * 60 * 1000),
      nextCheck: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      description: 'Processus de suppression automatique des données expirées',
      requirements: [
        'Suppression automatique après 2 ans',
        'Confirmation de suppression',
        'Rapport de suppression'
      ]
    }
  ];

  // Permissions utilisateurs
  const userPermissions: UserPermission[] = [
    {
      id: '1',
      name: 'Marie Nzola',
      role: 'Administrateur RH',
      permissions: ['lecture', 'écriture', 'suppression', 'export', 'administration'],
      lastAccess: new Date(Date.now() - 30 * 60 * 1000),
      status: 'active',
      department: 'Ressources Humaines'
    },
    {
      id: '2',
      name: 'Jean-Pierre Makaya',
      role: 'Recruteur Senior',
      permissions: ['lecture', 'écriture', 'export'],
      lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active',
      department: 'Ressources Humaines'
    },
    {
      id: '3',
      name: 'Sophie Lemba',
      role: 'Analyste RH',
      permissions: ['lecture', 'export'],
      lastAccess: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'active',
      department: 'Ressources Humaines'
    },
    {
      id: '4',
      name: 'David Mwamba',
      role: 'Recruteur',
      permissions: ['lecture'],
      lastAccess: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'suspended',
      department: 'Ressources Humaines'
    }
  ];

  // Chiffrement des données
  const dataEncryption: DataEncryption[] = [
    {
      id: '1',
      type: 'personal',
      encryptionLevel: 'high',
      lastEncrypted: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'encrypted',
      description: 'Données personnelles des candidats (CV, coordonnées)'
    },
    {
      id: '2',
      type: 'sensitive',
      encryptionLevel: 'high',
      lastEncrypted: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'encrypted',
      description: 'Évaluations et notes confidentielles'
    },
    {
      id: '3',
      type: 'financial',
      encryptionLevel: 'standard',
      lastEncrypted: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'encrypted',
      description: 'Informations salariales et budgétaires'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#10B981';
      case 'non-compliant': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPermissionColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'suspended': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEncryptionColor = (status: string) => {
    switch (status) {
      case 'encrypted': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
        🔒 Sécurité & Conformité Avancée
      </Typography>

      {/* Configuration de sécurité */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Configuration de Sécurité</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={securityEnabled}
                    onChange={(e) => setSecurityEnabled(e.target.checked)}
                  />
                }
                label="Sécurité avancée"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                }
                label="Authentification 2FA"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={auditLogEnabled}
                    onChange={(e) => setAuditLogEnabled(e.target.checked)}
                  />
                }
                label="Audit trail"
              />
            </Box>
          </Box>
          
          {securityEnabled && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <SecurityIcon sx={{ fontSize: 40, color: '#10B981', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Sécurisé</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Système protégé
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <ShieldIcon sx={{ fontSize: 40, color: '#3B82F6', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Conforme</Typography>
                  <Typography variant="body2" color="text.secondary">
                    RGPD + Local
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <LockIcon sx={{ fontSize: 40, color: '#8B5CF6', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">Chiffré</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AES-256
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Visibility />
                  <Typography variant="h6" fontWeight="bold">Audité</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Traçabilité complète
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="🚨 Événements Sécurité" />
          <Tab label="✅ Conformité" />
          <Tab label="👥 Permissions" />
          <Tab label="🔐 Chiffrement" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Événements de Sécurité</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date/Heure</TableCell>
                  <TableCell>Événement</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Sévérité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {securityEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {event.timestamp.toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {event.event}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell>{event.ip}</TableCell>
                    <TableCell>
                      <Chip
                        label={event.severity}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(event.severity),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        size="small"
                        color={event.status === 'resolved' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Vérifications de Conformité</Typography>
          <Grid container spacing={3}>
            {complianceChecks.map((check) => (
              <Grid item xs={12} md={6} key={check.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: getStatusColor(check.status) + '20',
                        color: getStatusColor(check.status),
                        mr: 2
                      }}>
                        {check.status === 'compliant' ? <CheckCircleIcon /> : 
                         check.status === 'non-compliant' ? <WarningIcon /> : <InfoIcon />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {check.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {check.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={check.category.toUpperCase()}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Dernière vérification: {check.lastCheck.toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Prochaine vérification: {check.nextCheck.toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Exigences:
                    </Typography>
                    <List dense>
                      {check.requirements.map((req, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={req}
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
          <Typography variant="h6" gutterBottom>Gestion des Permissions</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Dernier Accès</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userPermissions.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Box>
                        {user.permissions.map((perm, index) => (
                          <Chip
                            key={index}
                            label={perm}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.lastAccess.toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        sx={{
                          bgcolor: getPermissionColor(user.status),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
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
          <Typography variant="h6" gutterBottom>Chiffrement des Données</Typography>
          <Grid container spacing={3}>
            {dataEncryption.map((encryption) => (
              <Grid item xs={12} md={6} key={encryption.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: getEncryptionColor(encryption.status) + '20',
                        color: getEncryptionColor(encryption.status),
                        mr: 2
                      }}>
                        <LockIcon />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {encryption.type.charAt(0).toUpperCase() + encryption.type.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {encryption.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Niveau ${encryption.encryptionLevel}`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Dernier chiffrement: {encryption.lastEncrypted.toLocaleString('fr-FR')}
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={encryption.status === 'encrypted' ? 100 : 
                             encryption.status === 'pending' ? 50 : 0}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Statut: {encryption.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default SecurityCompliance; 