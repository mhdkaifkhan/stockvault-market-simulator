const db = require('../config/db');

// ── Get User Portfolio ────────────────────────────────────
const getPortfolio = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.quantity, p.avg_buy_price,
              s.id AS stock_id, s.company_name, s.symbol,
              s.current_price, s.previous_price, s.sector
       FROM portfolios p
       JOIN stocks s ON s.id = p.stock_id
       WHERE p.user_id = ?
       ORDER BY s.company_name ASC`,
      [req.user.id]
    );

    // Calculate P&L for each holding
    const holdings = rows.map(r => {
      const currentValue = parseFloat(r.current_price) * r.quantity;
      const investedValue = parseFloat(r.avg_buy_price) * r.quantity;
      const profitLoss = currentValue - investedValue;
      const returnPct = investedValue > 0
        ? ((profitLoss / investedValue) * 100)
        : 0;

      return {
        id: r.id,
        stockId: r.stock_id,
        companyName: r.company_name,
        symbol: r.symbol,
        sector: r.sector,
        quantity: r.quantity,
        avgBuyPrice: parseFloat(r.avg_buy_price),
        currentPrice: parseFloat(r.current_price),
        previousPrice: parseFloat(r.previous_price),
        currentValue: parseFloat(currentValue.toFixed(2)),
        investedValue: parseFloat(investedValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        returnPct: parseFloat(returnPct.toFixed(2)),
      };
    });

    const totalCurrentValue = holdings.reduce(
      (s, h) => s + h.currentValue,
      0
    );

    const totalInvested = holdings.reduce(
      (s, h) => s + h.investedValue,
      0
    );

    const totalPL = totalCurrentValue - totalInvested;

    const totalReturnPct = totalInvested > 0
      ? ((totalPL / totalInvested) * 100)
      : 0;

    res.json({
      success: true,
      holdings,
      summary: {
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalProfitLoss: parseFloat(totalPL.toFixed(2)),
        totalReturnPct: parseFloat(totalReturnPct.toFixed(2)),
        stockCount: holdings.length,
      },
    });

  } catch (err) {
    console.error('Portfolio error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

// ── Dashboard Stats ───────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Wallet balance
    const [userRows] = await db.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [userId]
    );

    const walletBalance = parseFloat(
      userRows[0]?.wallet_balance || 0
    );

    // Portfolio value
    const [portRows] = await db.query(
      `SELECT 
          SUM(p.quantity * s.current_price) AS current_value,
          SUM(p.quantity * p.avg_buy_price) AS invested_value,
          COUNT(*) AS stock_count
       FROM portfolios p
       JOIN stocks s ON s.id = p.stock_id
       WHERE p.user_id = ?`,
      [userId]
    );

    const currentValue = parseFloat(
      portRows[0]?.current_value || 0
    );

    const investedValue = parseFloat(
      portRows[0]?.invested_value || 0
    );

    const stockCount = parseInt(
      portRows[0]?.stock_count || 0
    );

    const profitLoss = currentValue - investedValue;

    const returnPct = investedValue > 0
      ? ((profitLoss / investedValue) * 100)
      : 0;

    // Recent transactions
    const [recentTxns] = await db.query(
      `SELECT t.*, s.company_name, s.symbol
       FROM transactions t
       JOIN stocks s ON s.id = t.stock_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Monthly activity
    const [monthlyCounts] = await db.query(
      `SELECT 
          DATE_FORMAT(created_at, '%b %Y') AS month,
          SUM(CASE WHEN type='BUY' THEN total_amount ELSE 0 END) AS bought,
          SUM(CASE WHEN type='SELL' THEN total_amount ELSE 0 END) AS sold
       FROM transactions
       WHERE user_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%b %Y')
       ORDER BY MIN(created_at) ASC`,
      [userId]
    );

    // Top holdings
    const [topHoldings] = await db.query(
      `SELECT 
          s.symbol,
          s.company_name,
          (p.quantity * s.current_price) AS value
       FROM portfolios p
       JOIN stocks s ON s.id = p.stock_id
       WHERE p.user_id = ?
       ORDER BY value DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,

      stats: {
        walletBalance,
        portfolioValue: parseFloat(currentValue.toFixed(2)),
        investedAmount: parseFloat(investedValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        returnPct: parseFloat(returnPct.toFixed(2)),
        stockCount,
      },

      recentTransactions: recentTxns,
      monthlyActivity: monthlyCounts,
      topHoldings,
    });

  } catch (err) {
    console.error('Dashboard error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

module.exports = {
  getPortfolio,
  getDashboardStats
};