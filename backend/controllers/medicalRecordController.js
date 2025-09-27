const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get patient medical records
// @route   GET /api/medical-records
// @access  Private
const getMedicalRecords = async (req, res) => {
  try {
    const { recordType, page = 1, limit = 10 } = req.query;
    
    const query = { patient: req.patient._id };
    if (recordType) {
      query.recordType = recordType;
    }

    const medicalRecords = await MedicalRecord.find(query)
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'service serviceName appointmentDate')
      .sort({ treatmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      success: true,
      data: medicalRecords,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization phone email')
      .populate('appointment', 'service serviceName appointmentDate appointmentTime');

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check if patient owns this record
    if (medicalRecord.patient._id.toString() !== req.patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: medicalRecord
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get medical summary
// @route   GET /api/medical-records/summary
// @access  Private
const getMedicalSummary = async (req, res) => {
  try {
    const patientId = req.patient._id;

    // Get latest medical record
    const latestRecord = await MedicalRecord.findOne({ patient: patientId })
      .populate('doctor', 'firstName lastName')
      .sort({ treatmentDate: -1 });

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: patientId,
      status: { $in: ['scheduled', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    })
    .populate('doctor', 'firstName lastName')
    .sort({ appointmentDate: 1 })
    .limit(3);

    // Get treatment statistics
    const treatmentStats = await MedicalRecord.aggregate([
      { $match: { patient: patientId } },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 },
          lastTreatment: { $max: '$treatmentDate' }
        }
      }
    ]);

    // Get insurance status
    const patient = await Patient.findById(patientId).select('insurance');

    res.json({
      success: true,
      data: {
        lastVisit: latestRecord ? {
          date: latestRecord.treatmentDate,
          treatment: latestRecord.treatment,
          doctor: latestRecord.doctor
        } : null,
        nextAppointment: upcomingAppointments.length > 0 ? {
          date: upcomingAppointments[0].appointmentDate,
          time: upcomingAppointments[0].appointmentTime,
          service: upcomingAppointments[0].serviceName,
          doctor: upcomingAppointments[0].doctor
        } : null,
        treatmentPlan: latestRecord?.treatmentPlan || null,
        insuranceStatus: patient.insurance?.isActive ? 'Active' : 'Inactive',
        treatmentHistory: treatmentStats
      }
    });
  } catch (error) {
    console.error('Get medical summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Download medical record attachment
// @route   GET /api/medical-records/:id/attachments/:attachmentId
// @access  Private
const downloadAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;

    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check if patient owns this record
    if (medicalRecord.patient.toString() !== req.patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const attachment = medicalRecord.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // In a real application, you would serve the file from storage
    // For now, just return the attachment info
    res.json({
      success: true,
      data: {
        filename: attachment.filename,
        originalName: attachment.originalName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        description: attachment.description
      }
    });
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get treatment timeline
// @route   GET /api/medical-records/timeline
// @access  Private
const getTreatmentTimeline = async (req, res) => {
  try {
    const { year } = req.query;
    const patientId = req.patient._id;

    let dateFilter = {};
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = {
        treatmentDate: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const timeline = await MedicalRecord.find({
      patient: patientId,
      ...dateFilter
    })
    .populate('doctor', 'firstName lastName specialization')
    .populate('appointment', 'service serviceName')
    .sort({ treatmentDate: -1 });

    // Group by month
    const groupedTimeline = timeline.reduce((acc, record) => {
      const month = record.treatmentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(record);
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedTimeline
    });
  } catch (error) {
    console.error('Get treatment timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecord,
  getMedicalSummary,
  downloadAttachment,
  getTreatmentTimeline
};
