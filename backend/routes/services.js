const express = require('express');
const {
  getServices,
  getService,
  getServiceByCode,
  getServiceCategories,
  searchServices,
  getFeaturedServices,
  getPopularServices,
  getServicePricing
} = require('../controllers/serviceController');

const router = express.Router();

// All routes are public
router.get('/', getServices);
router.get('/featured', getFeaturedServices);
router.get('/popular', getPopularServices);
router.get('/categories', getServiceCategories);
router.get('/search', searchServices);
router.get('/code/:code', getServiceByCode);
router.get('/:id', getService);
router.get('/:id/pricing', getServicePricing);

module.exports = router;
