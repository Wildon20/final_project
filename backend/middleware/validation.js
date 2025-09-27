const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Patient registration validation
const validatePatientRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer-not'])
    .withMessage('Please select a valid gender'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Patient login validation
const validatePatientLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Appointment validation
const validateAppointment = [
  body('service')
    .isIn([
      'consultation', 'cleaning', 'whitening', 'emergency',
      'orthodontics', 'implants', 'crowns', 'fillings',
      'extraction', 'root-canal', 'veneers', 'invisalign'
    ])
    .withMessage('Please select a valid service'),
  
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid appointment time'),
  
  body('urgency')
    .isIn(['routine', 'soon', 'urgent', 'emergency'])
    .withMessage('Please select a valid urgency level'),
  
  body('paymentMethod')
    .isIn(['insurance', 'selfPay', 'paymentPlan', 'careCredit'])
    .withMessage('Please select a valid payment method'),
  
  handleValidationErrors
];

// Contact form validation
const validateContactForm = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validatePatientRegistration,
  validatePatientLogin,
  validateAppointment,
  validateContactForm
};
