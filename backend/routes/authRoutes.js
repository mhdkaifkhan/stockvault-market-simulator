const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register',        register);
router.post('/login',           login);
router.post('/admin/login',     adminLogin);
router.get('/profile',          authenticateToken, getProfile);
router.put('/profile',          authenticateToken, updateProfile);
router.put('/change-password',  authenticateToken, changePassword);

module.exports = router;
