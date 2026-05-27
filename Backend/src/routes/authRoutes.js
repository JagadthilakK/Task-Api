const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password/:token', authRateLimiter, resetPassword);

module.exports = router;
