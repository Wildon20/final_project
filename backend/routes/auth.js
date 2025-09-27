const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validatePatientRegistration,
  validatePatientLogin
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validatePatientRegistration, register);
router.post('/login', validatePatientLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect); // All routes below this middleware are protected
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
