const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ── Admin Dashboard Stats ─────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]]   = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStocks }]]  = await db.query('SELECT COUNT(*) AS totalStocks FROM stocks');
    const [[{ totalTxns }]]    = await db.query('SELECT COUNT(*) AS totalTxns FROM transactions');
    const [[{ totalVolume }]]  = await db.query('SELECT COALESCE(SUM(total_amount), 0) AS totalVolume FROM transactions');
    const [[{ buyVolume }]]    = await db.query("SELECT COALESCE(SUM(total_amount),0) AS buyVolume  FROM transactions WHERE type='BUY'");
    const [[{ sellVolume }]]   = await db.query("SELECT COALESCE(SUM(total_amount),0) AS sellVolume FROM transactions WHERE type='SELL'");

    const [recentUsers] = await db.query('SELECT id, full_name, email, wallet_balance, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    const [recentTxns]  = await db.query(
      `SELECT t.*, s.symbol, s.company_name, u.full_name AS user_name
       FROM transactions t
       JOIN stocks s ON s.id = t.stock_id
       JOIN users  u ON u.id = t.user_id
       ORDER BY t.created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      stats: { totalUsers, totalStocks, totalTxns, totalVolume: parseFloat(totalVolume), buyVolume: parseFloat(buyVolume), sellVolume: parseFloat(sellVolume) },
      recentUsers,
      recentTransactions: recentTxns,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get All Users ─────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email, wallet_balance, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Get All Transactions ──────────────────────────────────
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM transactions');
    const [rows] = await db.query(
      `SELECT t.*, s.symbol, s.company_name, u.full_name AS user_name, u.email AS user_email
       FROM transactions t
       JOIN stocks s ON s.id = t.stock_id
       JOIN users  u ON u.id = t.user_id
       ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    res.json({ success: true, transactions: rows, pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Create Stock ──────────────────────────────────────────
const createStock = async (req, res) => {
  try {
    const { companyName, symbol, currentPrice, availableQuantity, sector, description } = req.body;
    if (!companyName || !symbol || !currentPrice || !availableQuantity)
      return res.status(400).json({ success: false, message: 'Company name, symbol, price and quantity are required.' });

    const [dup] = await db.query('SELECT id FROM stocks WHERE symbol = ?', [symbol.toUpperCase()]);
    if (dup.length > 0) return res.status(409).json({ success: false, message: 'Stock symbol already exists.' });

    const [result] = await db.query(
      'INSERT INTO stocks (company_name, symbol, current_price, previous_price, available_quantity, sector, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [companyName, symbol.toUpperCase(), currentPrice, currentPrice, availableQuantity, sector || null, description || null]
    );
    res.status(201).json({ success: true, message: 'Stock created successfully.', stockId: result.insertId });
  } catch (err) {
    console.error('Create stock error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update Stock ──────────────────────────────────────────
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, symbol, currentPrice, availableQuantity, sector, description } = req.body;

    const [existing] = await db.query('SELECT * FROM stocks WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Stock not found.' });

    // Store old price as previous_price
    const prevPrice = existing[0].current_price;

    await db.query(
      `UPDATE stocks SET
         company_name       = COALESCE(?, company_name),
         symbol             = COALESCE(?, symbol),
         current_price      = COALESCE(?, current_price),
         previous_price     = ?,
         available_quantity = COALESCE(?, available_quantity),
         sector             = COALESCE(?, sector),
         description        = COALESCE(?, description)
       WHERE id = ?`,
      [companyName, symbol ? symbol.toUpperCase() : null, currentPrice, prevPrice, availableQuantity, sector, description, id]
    );
    res.json({ success: true, message: 'Stock updated successfully.' });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Delete Stock ──────────────────────────────────────────
const deleteStock = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM stocks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Stock not found.' });
    await db.query('DELETE FROM stocks WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Stock deleted successfully.' });
  } catch (err) {
    console.error('Delete stock error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, getAllTransactions, createStock, updateStock, deleteStock };
