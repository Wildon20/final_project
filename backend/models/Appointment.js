const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Patient Reference
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  
  // Appointment Details
  service: {
    type: String,
    required: [true, 'Service is required'],
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
  },
  
  serviceName: {
    type: String,
    required: [true, 'Service name is required']
  },
  
  // Scheduling
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  urgency: {
    type: String,
    enum: ['routine', 'soon', 'urgent', 'emergency'],
    default: 'routine'
  },
  
  // Doctor Assignment
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  patientNotes: {
    type: String,
    maxlength: [500, 'Patient notes cannot exceed 500 characters']
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['insurance', 'selfPay', 'paymentPlan', 'careCredit'],
    required: [true, 'Payment method is required']
  },
  
  estimatedCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  
  actualCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: Date,
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  cancelledAt: Date,
  
  // Reminders
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'phone']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

// Virtual for appointment datetime
appointmentSchema.virtual('appointmentDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Check if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  return this.appointmentDateTime < new Date();
});

// Check if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return appointmentDate.toDateString() === today.toDateString();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
