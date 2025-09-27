const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Service Information
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  
  code: {
    type: String,
    required: [true, 'Service code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'general',
      'cosmetic',
      'surgical',
      'orthodontic',
      'emergency',
      'preventive',
      'restorative'
    ]
  },
  
  // Service Details
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  detailedDescription: {
    type: String,
    maxlength: [2000, 'Detailed description cannot exceed 2000 characters']
  },
  
  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    priceRange: {
      min: Number,
      max: Number
    },
    isVariable: { type: Boolean, default: false },
    currency: { type: String, default: 'USD' }
  },
  
  // Duration and Scheduling
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  
  // Service Requirements
  requirements: {
    consultationRequired: { type: Boolean, default: false },
    preparationTime: Number, // in minutes
    recoveryTime: Number, // in minutes
    followUpRequired: { type: Boolean, default: false },
    followUpInterval: Number // in days
  },
  
  // Eligibility
  eligibility: {
    ageRestrictions: {
      minAge: Number,
      maxAge: Number
    },
    medicalConditions: [String],
    prerequisites: [String]
  },
  
  // Insurance and Payment
  insurance: {
    isCovered: { type: Boolean, default: false },
    coveragePercentage: Number,
    requiresPreApproval: { type: Boolean, default: false },
    codes: [String] // Insurance procedure codes
  },
  
  paymentOptions: [{
    type: {
      type: String,
      enum: ['full', 'installment', 'financing', 'insurance']
    },
    description: String,
    terms: String
  }],
  
  // Service Features
  features: [{
    name: String,
    description: String,
    icon: String
  }],
  
  // Before/After Information
  beforeAfter: {
    hasImages: { type: Boolean, default: false },
    imageCount: { type: Number, default: 0 },
    description: String
  },
  
  // Technology Used
  technology: [{
    name: String,
    description: String,
    icon: String
  }],
  
  // FAQ
  faq: [{
    question: String,
    answer: String
  }],
  
  // Service Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  
  // SEO and Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: String
  },
  
  // Images
  images: [{
    filename: String,
    originalName: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    order: Number
  }],
  
  // Statistics
  statistics: {
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    lastBooked: Date
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ code: 1 });
serviceSchema.index({ isFeatured: 1, isActive: 1 });
serviceSchema.index({ 'seo.slug': 1 });

// Virtual for display price
serviceSchema.virtual('displayPrice').get(function() {
  if (this.pricing.isVariable && this.pricing.priceRange) {
    return `$${this.pricing.priceRange.min} - $${this.pricing.priceRange.max}`;
  }
  return `$${this.pricing.basePrice}`;
});

// Virtual for duration display
serviceSchema.virtual('durationDisplay').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
});

// Method to check if service is available for patient
serviceSchema.methods.isAvailableForPatient = function(patient) {
  // Check age restrictions
  if (this.eligibility.ageRestrictions) {
    const age = new Date().getFullYear() - patient.dateOfBirth.getFullYear();
    if (this.eligibility.ageRestrictions.minAge && age < this.eligibility.ageRestrictions.minAge) {
      return false;
    }
    if (this.eligibility.ageRestrictions.maxAge && age > this.eligibility.ageRestrictions.maxAge) {
      return false;
    }
  }
  
  // Check medical conditions
  if (this.eligibility.medicalConditions && this.eligibility.medicalConditions.length > 0) {
    const hasConflictingCondition = this.eligibility.medicalConditions.some(condition =>
      patient.medicalHistory.medicalConditions.includes(condition)
    );
    if (hasConflictingCondition) {
      return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('Service', serviceSchema);
