const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getAllTransactions, createStock, updateStock, deleteStock } = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/dashboard',      authenticateAdmin, getDashboardStats);
router.get('/users',          authenticateAdmin, getAllUsers);
router.get('/transactions',   authenticateAdmin, getAllTransactions);
router.post('/stocks',        authenticateAdmin, createStock);
router.put('/stocks/:id',     authenticateAdmin, updateStock);
router.delete('/stocks/:id',  authenticateAdmin, deleteStock);

module.exports = router;
