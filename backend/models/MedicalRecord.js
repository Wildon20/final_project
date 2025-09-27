const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  // Patient Reference
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  
  // Doctor Reference
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  
  // Appointment Reference (if applicable)
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Record Type
  recordType: {
    type: String,
    required: [true, 'Record type is required'],
    enum: [
      'examination',
      'treatment',
      'procedure',
      'consultation',
      'follow-up',
      'emergency',
      'cleaning',
      'surgery',
      'restoration'
    ]
  },
  
  // Treatment Details
  treatment: {
    type: String,
    required: [true, 'Treatment description is required'],
    maxlength: [500, 'Treatment description cannot exceed 500 characters']
  },
  
  // Diagnosis
  diagnosis: {
    primary: {
      type: String,
      required: [true, 'Primary diagnosis is required']
    },
    secondary: [String],
    notes: String
  },
  
  // Treatment Plan
  treatmentPlan: {
    description: String,
    procedures: [{
      name: String,
      status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'cancelled'],
        default: 'planned'
      },
      scheduledDate: Date,
      completedDate: Date,
      notes: String
    }],
    estimatedCost: Number,
    estimatedDuration: String
  },
  
  // Clinical Notes
  clinicalNotes: {
    chiefComplaint: String,
    historyOfPresentIllness: String,
    clinicalFindings: String,
    treatmentProvided: String,
    recommendations: String,
    followUpInstructions: String
  },
  
  // Vital Signs (if applicable)
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    recordedAt: Date
  },
  
  // Medications
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    prescribedAt: Date
  }],
  
  // Images and Documents
  attachments: [{
    filename: String,
    originalName: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }],
  
  // X-rays and Scans
  imaging: [{
    type: {
      type: String,
      enum: ['x-ray', 'panoramic', 'cbct', 'intraoral', 'photograph']
    },
    description: String,
    filename: String,
    takenAt: Date,
    findings: String
  }],
  
  // Follow-up Information
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: Date,
    instructions: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'on-hold'],
    default: 'active'
  },
  
  // Billing Information
  billing: {
    procedureCode: String,
    description: String,
    cost: Number,
    insuranceCovered: Number,
    patientResponsibility: Number,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'denied', 'paid'],
      default: 'pending'
    }
  },
  
  // Timestamps
  treatmentDate: {
    type: Date,
    required: [true, 'Treatment date is required']
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
medicalRecordSchema.index({ patient: 1, treatmentDate: -1 });
medicalRecordSchema.index({ doctor: 1, treatmentDate: -1 });
medicalRecordSchema.index({ recordType: 1 });
medicalRecordSchema.index({ status: 1 });

// Virtual for treatment summary
medicalRecordSchema.virtual('treatmentSummary').get(function() {
  return {
    type: this.recordType,
    treatment: this.treatment,
    diagnosis: this.diagnosis.primary,
    date: this.treatmentDate,
    doctor: this.doctor
  };
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
