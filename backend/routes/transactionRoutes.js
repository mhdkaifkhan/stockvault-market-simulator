const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getTransactions);

module.exports = router;
