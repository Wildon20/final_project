const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, featured, popular, page = 1, limit = 20 } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (popular === 'true') {
      query.isPopular = true;
    }

    const services = await Service.find(query)
      .sort({ isFeatured: -1, isPopular: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get service by code
// @route   GET /api/services/code/:code
// @access  Public
const getServiceByCode = async (req, res) => {
  try {
    const service = await Service.findOne({ 
      code: req.params.code.toUpperCase(),
      isActive: true 
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          services: {
            $push: {
              id: '$_id',
              name: '$name',
              code: '$code',
              description: '$description',
              basePrice: '$pricing.basePrice',
              duration: '$duration',
              isFeatured: '$isFeatured',
              isPopular: '$isPopular'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
const searchServices = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const query = { 
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { detailedDescription: { $regex: q, $options: 'i' } },
        { 'seo.keywords': { $regex: q, $options: 'i' } }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseInt(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseInt(maxPrice);
    }

    const services = await Service.find(query)
      .sort({ isFeatured: -1, isPopular: -1, 'statistics.totalBookings': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get featured services
// @route   GET /api/services/featured
// @access  Public
const getFeaturedServices = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const services = await Service.find({
      isActive: true,
      isFeatured: true
    })
    .sort({ 'statistics.totalBookings': -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
const getPopularServices = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const services = await Service.find({
      isActive: true,
      isPopular: true
    })
    .sort({ 'statistics.totalBookings': -1, 'statistics.averageRating': -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get popular services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get service pricing
// @route   GET /api/services/:id/pricing
// @access  Public
const getServicePricing = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).select('pricing paymentOptions insurance');

    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: {
        pricing: service.pricing,
        paymentOptions: service.paymentOptions,
        insurance: service.insurance
      }
    });
  } catch (error) {
    console.error('Get service pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getServices,
  getService,
  getServiceByCode,
  getServiceCategories,
  searchServices,
  getFeaturedServices,
  getPopularServices,
  getServicePricing
};
