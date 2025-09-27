const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get patient from token
      req.patient = await Patient.findById(decoded.id).select('-password');
      
      if (!req.patient) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but patient not found.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Grant access to specific roles (for future admin functionality)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.patient) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    if (!roles.includes(req.patient.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role ${req.patient.role} is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = {
  protect,
  authorize,
  generateToken
};
