
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
    const { email, password } = req.body;
    
    // Get user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid login credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid login credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
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
      { userId: result.insertId, email, role: 'superadmin' },
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
        role: 'superadmin'
      }
    });
  } catch (error) {
    console.error('Create Super Admin error:', error.message);
    res.status(500).json({ message: 'Server error during Super Admin creation' });
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  updatePassword,
  createSuperAdmin
};
