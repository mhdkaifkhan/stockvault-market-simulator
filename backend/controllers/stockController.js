const db = require('../config/db');

// ── Random Price Fluctuation ─────────────────────────────
const fluctuatePrice = (price) => {
  const changePercent = (Math.random() * 4 - 2) / 100
  return +(price * (1 + changePercent)).toFixed(2)
}

// ── Get All Stocks ────────────────────────────────────────
const getAllStocks = async (req, res) => {
  try {
    const [stocks] = await db.query(
      'SELECT * FROM stocks ORDER BY company_name ASC'
    )

    // Dynamic stock price fluctuation
    for (const stock of stocks) {
      const newPrice = fluctuatePrice(parseFloat(stock.current_price))

      await db.query(
        'UPDATE stocks SET current_price = ? WHERE id = ?',
        [newPrice, stock.id]
      )

      stock.current_price = newPrice
    }

    res.json({ success: true, stocks })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Server error.',
    })
  }
}

// ── Get Single Stock ──────────────────────────────────────
const getStockById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM stocks WHERE id = ?',
      [req.params.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found.',
      })
    }

    res.json({
      success: true,
      stock: rows[0],
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error.',
    })
  }
}

// ── Buy Stock ─────────────────────────────────────────────
const buyStock = async (req, res) => {
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const { stockId, quantity } = req.body
    const userId = req.user.id
    const qty = parseInt(quantity)

    if (!stockId || !qty || qty <= 0) {
      await conn.rollback()
      conn.release()

      return res.status(400).json({
        success: false,
        message: 'Valid stock ID and quantity are required.',
      })
    }

    const [stocks] = await conn.query(
      'SELECT * FROM stocks WHERE id = ? FOR UPDATE',
      [stockId]
    )

    if (stocks.length === 0) {
      await conn.rollback()
      conn.release()

      return res.status(404).json({
        success: false,
        message: 'Stock not found.',
      })
    }

    const stock = stocks[0]

    if (stock.available_quantity < qty) {
      await conn.rollback()
      conn.release()

      return res.status(400).json({
        success: false,
        message: `Only ${stock.available_quantity} shares available.`,
      })
    }

    const totalCost = parseFloat(stock.current_price) * qty

    const [users] = await conn.query(
      'SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE',
      [userId]
    )

    const wallet = parseFloat(users[0].wallet_balance)

    if (wallet < totalCost) {
      await conn.rollback()
      conn.release()

      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Need $${totalCost.toFixed(
          2
        )}, available $${wallet.toFixed(2)}.`,
      })
    }

    await conn.query(
      'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
      [totalCost, userId]
    )

    await conn.query(
      'UPDATE stocks SET available_quantity = available_quantity - ? WHERE id = ?',
      [qty, stockId]
    )

    const [existing] = await conn.query(
      'SELECT * FROM portfolios WHERE user_id = ? AND stock_id = ?',
      [userId, stockId]
    )

    if (existing.length > 0) {
      const newQty = existing[0].quantity + qty

      const newAvg =
        (
          parseFloat(existing[0].avg_buy_price) *
            existing[0].quantity +
          parseFloat(stock.current_price) * qty
        ) / newQty

      await conn.query(
        'UPDATE portfolios SET quantity = ?, avg_buy_price = ? WHERE user_id = ? AND stock_id = ?',
        [newQty, newAvg, userId, stockId]
      )
    } else {
      await conn.query(
        'INSERT INTO portfolios (user_id, stock_id, quantity, avg_buy_price) VALUES (?, ?, ?, ?)',
        [userId, stockId, qty, stock.current_price]
      )
    }

    await conn.query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, stockId, 'BUY', qty, stock.current_price, totalCost]
    )

    await conn.commit()
    conn.release()

    const [updated] = await db.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [userId]
    )

    res.json({
      success: true,
      message: `Bought ${qty} share(s) of ${stock.symbol} successfully!`,
      newWalletBalance: parseFloat(updated[0].wallet_balance),
    })
  } catch (err) {
    await conn.rollback()
    conn.release()

    console.error('Buy error:', err)

    res.status(500).json({
      success: false,
      message: 'Transaction failed. Please try again.',
    })
  }
}

// ── Sell Stock ────────────────────────────────────────────
const sellStock = async (req, res) => {
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const { stockId, quantity } = req.body
    const userId = req.user.id
    const qty = parseInt(quantity)

    if (!stockId || !qty || qty <= 0) {
      await conn.rollback()
      conn.release()

      return res.status(400).json({
        success: false,
        message: 'Valid stock ID and quantity are required.',
      })
    }

    const [portfolio] = await conn.query(
      'SELECT * FROM portfolios WHERE user_id = ? AND stock_id = ? FOR UPDATE',
      [userId, stockId]
    )

    if (
      portfolio.length === 0 ||
      portfolio[0].quantity < qty
    ) {
      await conn.rollback()
      conn.release()

      return res.status(400).json({
        success: false,
        message: `Insufficient shares. You own ${
          portfolio.length > 0 ? portfolio[0].quantity : 0
        } shares.`,
      })
    }

    const [stocks] = await conn.query(
      'SELECT * FROM stocks WHERE id = ?',
      [stockId]
    )

    const stock = stocks[0]

    const totalRevenue =
      parseFloat(stock.current_price) * qty

    await conn.query(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [totalRevenue, userId]
    )

    await conn.query(
      'UPDATE stocks SET available_quantity = available_quantity + ? WHERE id = ?',
      [qty, stockId]
    )

    const newQty = portfolio[0].quantity - qty

    if (newQty === 0) {
      await conn.query(
        'DELETE FROM portfolios WHERE user_id = ? AND stock_id = ?',
        [userId, stockId]
      )
    } else {
      await conn.query(
        'UPDATE portfolios SET quantity = ? WHERE user_id = ? AND stock_id = ?',
        [newQty, userId, stockId]
      )
    }

    await conn.query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, stockId, 'SELL', qty, stock.current_price, totalRevenue]
    )

    await conn.commit()
    conn.release()

    const [updated] = await db.query(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [userId]
    )

    res.json({
      success: true,
      message: `Sold ${qty} share(s) of ${stock.symbol} successfully!`,
      newWalletBalance: parseFloat(updated[0].wallet_balance),
    })
  } catch (err) {
    await conn.rollback()
    conn.release()

    console.error('Sell error:', err)

    res.status(500).json({
      success: false,
      message: 'Transaction failed. Please try again.',
    })
  }
}

module.exports = {
  getAllStocks,
  getStockById,
  buyStock,
  sellStock,
}