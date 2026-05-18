const express = require('express');
const router = express.Router();
const { getAllStocks, getStockById, buyStock, sellStock } = require('../controllers/stockController');
const { authenticateToken } = require('../middleware/auth');

router.get('/',        authenticateToken, getAllStocks);
router.get('/:id',     authenticateToken, getStockById);
router.post('/buy',    authenticateToken, buyStock);
router.post('/sell',   authenticateToken, sellStock);

module.exports = router;
