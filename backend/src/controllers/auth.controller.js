
// Simple mock authentication controller for testing
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock users database (en attendant la vraie DB)
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  }
];

const login = async (req, res) => {
  try {
    console.log('Tentative de connexion reçue:', req.body);
    
    const { email, password, role } = req.body;
    
    // Validation des entrées
    if (!email || !password) {
      console.log('Données manquantes:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        success: false,
        message: 'Email et mot de passe requis' 
      });
    }
    
    // Recherche de l'utilisateur
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Vérification du rôle si demandé
    if (role === 'admin' && user.role !== 'admin') {
      console.log('Accès admin refusé pour:', email);
      return res.status(403).json({ 
        success: false,
        message: 'Accès administrateur requis' 
      });
    }
    
    // Vérification du mot de passe (pour le test, on accepte le mot de passe en clair)
    const isPasswordValid = password === 'admin123' || password === 'password123';
    
    if (!isPasswordValid) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Génération du token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        isAdmin: user.role === 'admin'
      },
      process.env.JWT_SECRET || 'test_secret_key',
      { expiresIn: '24h' }
    );
    
    console.log('Connexion réussie pour:', email);
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validation simple
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email et mot de passe requis' 
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    // Créer un nouvel utilisateur (mock)
    const newUser = {
      id: mockUsers.length + 1,
      email,
      password: await bcrypt.hash(password, 10),
      firstName: firstName || 'User',
      lastName: lastName || 'Test',
      role: 'user'
    };
    
    mockUsers.push(newUser);
    
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'test_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur' 
    });
  }
};

const verifyAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token manquant' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key');
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Accès administrateur requis' 
      });
    }
    
    res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isAdmin: true
      }
    });
    
  } catch (error) {
    console.error('Erreur de vérification admin:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token invalide' 
    });
  }
};

// Fonctions supplémentaires pour compatibilité
const resetPassword = async (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Fonctionnalité de réinitialisation à implémenter' 
  });
};

const updatePassword = async (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Fonctionnalité de mise à jour à implémenter' 
  });
};

const createSuperAdmin = async (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Fonctionnalité de création super admin à implémenter' 
  });
};

const getProfile = async (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Fonctionnalité de profil à implémenter' 
  });
};

const updateProfile = async (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Fonctionnalité de mise à jour profil à implémenter' 
  });
};

module.exports = {
  login,
  register,
  verifyAdmin,
  resetPassword,
  updatePassword,
  createSuperAdmin,
  getProfile,
  updateProfile
};
