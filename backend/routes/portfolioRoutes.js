const express = require('express');
const router = express.Router();
const { getPortfolio, getDashboardStats } = require('../controllers/portfolioController');
const { authenticateToken } = require('../middleware/auth');

router.get('/',          authenticateToken, getPortfolio);
router.get('/dashboard', authenticateToken, getDashboardStats);

module.exports = router;
