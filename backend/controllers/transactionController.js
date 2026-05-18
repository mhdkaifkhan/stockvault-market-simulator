const db = require('../config/db');

// ── Get User Transactions ─────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE t.user_id = ?';
    const params = [req.user.id];

    if (type && (type === 'BUY' || type === 'SELL')) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }
    if (search) {
      whereClause += ' AND (s.company_name LIKE ? OR s.symbol LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countParams = [...params];
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM transactions t JOIN stocks s ON s.id = t.stock_id ${whereClause}`,
      countParams
    );
    const total = countRows[0].total;

    params.push(parseInt(limit), offset);
    const [rows] = await db.query(
      `SELECT t.id, t.type, t.quantity, t.price, t.total_amount, t.created_at,
              s.company_name, s.symbol
       FROM transactions t JOIN stocks s ON s.id = t.stock_id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      params
    );

    res.json({
      success: true,
      transactions: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getTransactions };
