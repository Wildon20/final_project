const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  // Professional Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    enum: ['Dr.', 'Prof.', 'Dr. Prof.']
  },
  
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'General Dentistry',
      'Orthodontics',
      'Oral Surgery',
      'Periodontics',
      'Endodontics',
      'Prosthodontics',
      'Pediatric Dentistry',
      'Cosmetic Dentistry'
    ]
  },
  
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Professional Details
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date
  }],
  
  // Availability
  workingHours: {
    monday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorking: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorking: { type: Boolean, default: false } },
    sunday: { start: String, end: String, isWorking: { type: Boolean, default: false } }
  },
  
  // Services Provided
  services: [{
    type: String,
    enum: [
      'consultation',
      'cleaning',
      'whitening',
      'emergency',
      'orthodontics',
      'implants',
      'crowns',
      'fillings',
      'extraction',
      'root-canal',
      'veneers',
      'invisalign'
    ]
  }],
  
  // Profile Information
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  
  profileImage: String,
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
doctorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get full name
doctorSchema.virtual('fullName').get(function() {
  return `${this.title} ${this.firstName} ${this.lastName}`;
});

// Get display name
doctorSchema.virtual('displayName').get(function() {
  return `${this.title} ${this.lastName}`;
});

// Check if doctor is available at specific time
doctorSchema.methods.isAvailableAt = function(date, time) {
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleLowerCase();
  
  if (!this.workingHours[dayOfWeek]?.isWorking) {
    return false;
  }
  
  const { start, end } = this.workingHours[dayOfWeek];
  return time >= start && time <= end;
};

// Get available time slots for a specific date
doctorSchema.methods.getAvailableTimeSlots = function(date) {
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleLowerCase();
  
  if (!this.workingHours[dayOfWeek]?.isWorking) {
    return [];
  }
  
  const { start, end } = this.workingHours[dayOfWeek];
  const slots = [];
  
  // Generate 30-minute slots
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  
  for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 30)) {
    const timeString = time.toTimeString().slice(0, 5);
    slots.push(timeString);
  }
  
  return slots;
};

module.exports = mongoose.model('Doctor', doctorSchema);
