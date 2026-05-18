const db = require('../config/db');

// ── Get Settings ──────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      // Create default settings
      await db.query('INSERT INTO user_settings (user_id) VALUES (?)', [req.user.id]);
      const [newRows] = await db.query('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
      return res.json({ success: true, settings: newRows[0] });
    }
    res.json({ success: true, settings: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── Update Settings ───────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const { theme, currency, language, notifications_email, notifications_push, sidebar_collapsed } = req.body;
    await db.query(
      `UPDATE user_settings SET
         theme = COALESCE(?, theme),
         currency = COALESCE(?, currency),
         language = COALESCE(?, language),
         notifications_email = COALESCE(?, notifications_email),
         notifications_push  = COALESCE(?, notifications_push),
         sidebar_collapsed   = COALESCE(?, sidebar_collapsed)
       WHERE user_id = ?`,
      [theme, currency, language, notifications_email, notifications_push, sidebar_collapsed, req.user.id]
    );
    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getSettings, updateSettings };
