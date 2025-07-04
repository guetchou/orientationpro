
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, 'user']
    );
    
    // Create profile for user
    await pool.query(
      'INSERT INTO profiles (user_id, email, first_name, last_name) VALUES (?, ?, ?, ?)',
      [result.insertId, email, firstName, lastName]
    );
    
    // Generate token
    const token = jwt.sign(
      { userId: result.insertId, email, role: 'user' },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log('Login attempt:', { email, requestedRole: role });
    
    // Get user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const user = users[0];
    
    // Check if admin access is requested but user is not admin/superadmin
    if (role === 'admin' && !['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Accès administrateur requis' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Generate token with appropriate role
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        isAdmin: ['admin', 'superadmin'].includes(user.role),
        isSuperAdmin: user.role === 'superadmin'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for:', { email, role: user.role });
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isAdmin: ['admin', 'superadmin'].includes(user.role),
        isSuperAdmin: user.role === 'superadmin'
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // For security reasons, still return success even if email doesn't exist
      return res.status(200).json({ message: 'Password reset link sent if email exists' });
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );
    
    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, user.id]
    );
    
    // In a real app, send email with reset link
    // For this example, we'll just return the token
    res.status(200).json({
      message: 'Password reset link sent if email exists',
      resetToken // In production, this would be sent via email
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    // Verify token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Check if token exists and is not expired
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [decoded.userId, resetToken]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, decoded.userId]
    );
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error.message);
    res.status(500).json({ message: 'Server error during password update' });
  }
};

const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if superadmin already exists
    const [existingSuperAdmins] = await pool.query('SELECT * FROM users WHERE role = ?', ['superadmin']);
    
    if (existingSuperAdmins.length > 0) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create super admin
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, 'superadmin']
    );
    
    // Create profile for super admin
    await pool.query(
      'INSERT INTO profiles (user_id, email, first_name, last_name, is_super_admin) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, email, firstName, lastName, true]
    );
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email, 
        role: 'superadmin',
        isAdmin: true,
        isSuperAdmin: true
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Super Admin created successfully',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        role: 'superadmin',
        isAdmin: true,
        isSuperAdmin: true
      }
    });
  } catch (error) {
    console.error('Create Super Admin error:', error.message);
    res.status(500).json({ message: 'Server error during Super Admin creation' });
  }
};

// New method to verify admin token
const verifyAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    const user = users[0];
    
    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ message: 'Accès administrateur requis' });
    }
    
    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isAdmin: true,
        isSuperAdmin: user.role === 'superadmin'
      }
    });
  } catch (error) {
    console.error('Admin verification error:', error.message);
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Get profile with proper ID handling
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Allow users to get their own profile or admins to get any profile
    if (id !== userId.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const [profiles] = await pool.query(
      'SELECT p.*, u.role FROM profiles p LEFT JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
      [id]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    
    res.status(200).json(profiles[0]);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
};

// Update profile with proper ID handling
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    
    // Allow users to update their own profile or admins to update any profile
    if (id !== userId.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.user_id;
    delete updateData.is_super_admin;
    delete updateData.role;
    
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    
    await pool.query(
      `UPDATE profiles SET ${updateFields} WHERE user_id = ?`,
      [...updateValues, id]
    );
    
    // Get updated profile
    const [profiles] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [id]);
    
    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      profile: profiles[0]
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  updatePassword,
  createSuperAdmin,
  verifyAdmin,
  getProfile,
  updateProfile
};
