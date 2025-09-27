const express = require('express');
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/available-slots', getAvailableSlots);

// Protected routes
router.use(protect); // All routes below this middleware are protected
router.post('/', validateAppointment, createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
