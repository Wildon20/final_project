const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const { validationResult } = require('express-validator');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      service,
      serviceName,
      appointmentDate,
      appointmentTime,
      urgency,
      notes,
      patientNotes,
      paymentMethod,
      estimatedCost
    } = req.body;

    // Check if appointment time is available
    const existingAppointment = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Get service details
    const serviceDetails = await Service.findOne({ code: service.toUpperCase() });
    if (!serviceDetails) {
      return res.status(400).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Find available doctor for the service
    const availableDoctor = await Doctor.findOne({
      services: service,
      isActive: true,
      isAvailable: true
    });

    if (!availableDoctor) {
      return res.status(400).json({
        success: false,
        message: 'No doctor available for this service at the moment'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.patient._id,
      service,
      serviceName: serviceName || serviceDetails.name,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration: serviceDetails.duration,
      urgency,
      notes,
      patientNotes,
      paymentMethod,
      estimatedCost: estimatedCost || serviceDetails.pricing.basePrice,
      doctor: availableDoctor._id
    });

    // Populate appointment details
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { patient: req.patient._id };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'firstName lastName specialization')
      .populate('patient', 'firstName lastName email phone')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if patient owns this appointment
    if (appointment.patient._id.toString() !== req.patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if patient owns this appointment
    if (appointment.patient.toString() !== req.patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if appointment can be updated
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled appointment'
      });
    }

    const {
      appointmentDate,
      appointmentTime,
      notes,
      patientNotes,
      paymentMethod
    } = req.body;

    if (appointmentDate) appointment.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (notes) appointment.notes = notes;
    if (patientNotes) appointment.patientNotes = patientNotes;
    if (paymentMethod) appointment.paymentMethod = paymentMethod;

    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName specialization' }
    ]);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if patient owns this appointment
    if (appointment.patient.toString() !== req.patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = 'patient';
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/available-slots
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { date, service } = req.query;

    if (!date || !service) {
      return res.status(400).json({
        success: false,
        message: 'Date and service are required'
      });
    }

    // Get service details
    const serviceDetails = await Service.findOne({ code: service.toUpperCase() });
    if (!serviceDetails) {
      return res.status(400).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Find doctors who provide this service
    const doctors = await Doctor.find({
      services: service,
      isActive: true,
      isAvailable: true
    });

    if (doctors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No doctors available for this service'
      });
    }

    // Get all time slots for the date
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    const availableSlots = [];
    const doctorIds = doctors.map(doctor => doctor._id);

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      appointmentDate: appointmentDate,
      doctor: { $in: doctorIds },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Generate available slots
    doctors.forEach(doctor => {
      const workingHours = doctor.workingHours[dayOfWeek];
      if (workingHours && workingHours.isWorking) {
        const slots = doctor.getAvailableTimeSlots(date);
        
        slots.forEach(slot => {
          // Check if slot is available
          const isBooked = existingAppointments.some(apt => 
            apt.doctor.toString() === doctor._id.toString() && 
            apt.appointmentTime === slot
          );

          if (!isBooked) {
            availableSlots.push({
              time: slot,
              doctor: {
                id: doctor._id,
                name: doctor.displayName,
                specialization: doctor.specialization
              },
              duration: serviceDetails.duration
            });
          }
        });
      }
    });

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots
};
