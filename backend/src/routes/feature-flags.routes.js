const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');

// Get all feature flags (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM feature_flags');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching feature flags:', error.message);
    res.status(500).json({ message: 'Server error fetching feature flags' });
  }
});

// Update feature flag (admin only)
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    const { id } = req.params;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Enabled status must be a boolean' });
    }
    
    await pool.query('UPDATE feature_flags SET enabled = ? WHERE id = ?', [enabled, id]);
    res.json({ message: 'Feature flag updated successfully' });
  } catch (error) {
    console.error('Error updating feature flag:', error.message);
    res.status(500).json({ message: 'Server error updating feature flag' });
  }
});

module.exports = router;
