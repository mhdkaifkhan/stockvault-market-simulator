const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ─────────────────────────────────────────────
// LIVE MARKET SIMULATION
// ─────────────────────────────────────────────
async function updateMarketPrices() {

  try {

    const [stocks] = await db.query(`
      SELECT id, current_price
      FROM stocks
    `);

    for (const stock of stocks) {

      const currentPrice = parseFloat(stock.current_price);

      // random movement between -3% to +3%
      const randomPercent = (Math.random() * 6 - 3) / 100;

      const newPrice = currentPrice + (currentPrice * randomPercent);

      await db.query(`
        UPDATE stocks
        SET
          previous_price = current_price,
          current_price = ?
        WHERE id = ?
      `, [
        newPrice.toFixed(2),
        stock.id
      ]);

    }

    console.log('Market prices updated');

  }
  catch (err) {

    console.error('Market update failed:', err);

  }

}

// Update every 5 sec
setInterval(updateMarketPrices, 5000);

// Run immediately once
updateMarketPrices();

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
});

// ─────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {

  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });

});

// ─────────────────────────────────────────────
// Server Start
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`StockVault API running on http://localhost:${PORT}`);
});