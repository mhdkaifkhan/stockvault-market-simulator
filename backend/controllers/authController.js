const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// ── Register ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, wallet_balance) VALUES (?, ?, ?, ?)',
      [fullName, email, hashed, 100000.00]
    );
    await db.query('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

    const token = jwt.sign({ id: result.insertId, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to StockVault.',
      token,
      user: { id: result.insertId, fullName, email, walletBalance: 100000.00, role: 'user' },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── Login ─────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const u = rows[0];
    const token = jwt.sign({ id: u.id, email: u.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: u.id, fullName: u.full_name, email: u.email, walletBalance: parseFloat(u.wallet_balance), role: 'user' },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── Admin Login ───────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });

    const a = rows[0];
    const token = jwt.sign({ id: a.id, email: a.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({
      success: true,
      message: 'Admin login successful!',
      token,
      user: { id: a.id, fullName: a.full_name, email: a.email, role: 'admin' },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get Profile ───────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, wallet_balance, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update Profile ────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName) return res.status(400).json({ success: false, message: 'Full name is required.' });
    await db.query('UPDATE users SET full_name = ? WHERE id = ?', [fullName, req.user.id]);
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Change Password ───────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!(await bcrypt.compare(currentPassword, rows[0].password)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, adminLogin, getProfile, updateProfile, changePassword };
