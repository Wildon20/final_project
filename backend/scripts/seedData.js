const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const connectDB = require('../config/database');

// Sample data
const samplePatients = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+26812345678',
    dateOfBirth: new Date('1990-01-15'),
    gender: 'male',
    password: 'Password123',
    address: {
      street: '123 Main Street',
      city: 'Mbabane',
      postalCode: 'H100',
      country: 'Eswatini'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+26812345679'
    },
    insurance: {
      provider: 'Delta Dental',
      memberId: 'DD123456789',
      groupNumber: 'GRP001',
      isActive: true
    },
    medicalHistory: {
      allergies: ['Penicillin'],
      medications: ['None'],
      medicalConditions: ['None'],
      previousDentalWork: ['Filling - Tooth #14']
    },
    preferences: {
      preferredContactMethod: 'email',
      marketingConsent: true,
      reminderConsent: true
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+26812345680',
    dateOfBirth: new Date('1985-05-20'),
    gender: 'female',
    password: 'Password123',
    address: {
      street: '456 Oak Avenue',
      city: 'Manzini',
      postalCode: 'M200',
      country: 'Eswatini'
    },
    emergencyContact: {
      name: 'Mike Johnson',
      relationship: 'Brother',
      phone: '+26812345681'
    },
    insurance: {
      provider: 'Cigna Dental',
      memberId: 'CI987654321',
      groupNumber: 'GRP002',
      isActive: true
    },
    medicalHistory: {
      allergies: ['None'],
      medications: ['Blood pressure medication'],
      medicalConditions: ['Hypertension'],
      previousDentalWork: ['Crown - Tooth #6', 'Root canal - Tooth #19']
    },
    preferences: {
      preferredContactMethod: 'phone',
      marketingConsent: false,
      reminderConsent: true
    }
  }
];

const sampleDoctors = [
  {
    firstName: 'T',
    lastName: 'Dental',
    title: 'Dr.',
    specialization: 'General Dentistry',
    licenseNumber: 'DENT001',
    email: 'dr.t@drtdental.com',
    phone: '+26878514785',
    experience: 10,
    education: [
      {
        degree: 'Doctor of Dental Surgery',
        institution: 'University of Cape Town',
        year: 2010
      }
    ],
    certifications: [
      {
        name: 'Advanced Implant Surgery',
        issuingOrganization: 'International Association of Oral Implantology',
        issueDate: new Date('2015-03-15'),
        expiryDate: new Date('2025-03-15')
      }
    ],
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '09:00', end: '13:00', isWorking: true },
      sunday: { start: '09:00', end: '18:00', isWorking: false }
    },
    services: [
      'consultation', 'cleaning', 'whitening', 'emergency',
      'implants', 'crowns', 'fillings', 'extraction', 'root-canal'
    ],
    bio: 'Dr. T is a highly experienced general dentist with over 10 years of practice. Specializing in comprehensive dental care, cosmetic dentistry, and advanced implant procedures.',
    isActive: true,
    isAvailable: true
  },
  {
    firstName: 'Smith',
    lastName: 'Orthodontist',
    title: 'Dr.',
    specialization: 'Orthodontics',
    licenseNumber: 'ORTHO001',
    email: 'dr.smith@drtdental.com',
    phone: '+26878514786',
    experience: 8,
    education: [
      {
        degree: 'Master of Science in Orthodontics',
        institution: 'University of the Witwatersrand',
        year: 2012
      }
    ],
    services: ['orthodontics', 'invisalign', 'consultation'],
    bio: 'Dr. Smith is a certified orthodontist with extensive experience in creating beautiful, straight smiles using the latest technology.',
    isActive: true,
    isAvailable: true
  }
];

const sampleServices = [
  {
    name: 'Free Consultation',
    code: 'CONSULTATION',
    category: 'general',
    description: 'Initial examination and treatment planning',
    detailedDescription: 'Comprehensive dental examination including oral health assessment, X-rays if needed, and personalized treatment plan development.',
    pricing: {
      basePrice: 0,
      isVariable: false,
      currency: 'USD'
    },
    duration: 30,
    requirements: {
      consultationRequired: false,
      preparationTime: 0,
      recoveryTime: 0,
      followUpRequired: false
    },
    features: [
      { name: 'Oral Examination', description: 'Complete mouth examination', icon: 'fas fa-search' },
      { name: 'Treatment Planning', description: 'Personalized treatment plan', icon: 'fas fa-clipboard-list' },
      { name: 'X-rays if needed', description: 'Diagnostic imaging', icon: 'fas fa-camera' }
    ],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Teeth Cleaning',
    code: 'CLEANING',
    category: 'general',
    description: 'Professional cleaning and examination',
    detailedDescription: 'Professional dental cleaning including plaque removal, tartar scaling, polishing, and fluoride treatment.',
    pricing: {
      basePrice: 80,
      isVariable: false,
      currency: 'USD'
    },
    duration: 45,
    requirements: {
      consultationRequired: false,
      preparationTime: 0,
      recoveryTime: 0,
      followUpRequired: true,
      followUpInterval: 180
    },
    features: [
      { name: 'Plaque Removal', description: 'Complete plaque and tartar removal', icon: 'fas fa-broom' },
      { name: 'Polishing', description: 'Teeth polishing for smooth finish', icon: 'fas fa-gem' },
      { name: 'Fluoride Treatment', description: 'Protective fluoride application', icon: 'fas fa-shield-alt' }
    ],
    isActive: true,
    isFeatured: true,
    isPopular: true
  },
  {
    name: 'Teeth Whitening',
    code: 'WHITENING',
    category: 'cosmetic',
    description: 'Professional in-office whitening',
    detailedDescription: 'Professional teeth whitening treatment using advanced bleaching agents for immediate and dramatic results.',
    pricing: {
      basePrice: 300,
      priceRange: { min: 250, max: 400 },
      isVariable: true,
      currency: 'USD'
    },
    duration: 60,
    requirements: {
      consultationRequired: true,
      preparationTime: 15,
      recoveryTime: 0,
      followUpRequired: true,
      followUpInterval: 30
    },
    features: [
      { name: 'Immediate Results', description: 'Visible whitening in one session', icon: 'fas fa-sun' },
      { name: 'Safe Treatment', description: 'Professional-grade whitening agents', icon: 'fas fa-shield-alt' },
      { name: 'Customized', description: 'Personalized treatment plan', icon: 'fas fa-user-cog' }
    ],
    isActive: true,
    isFeatured: true,
    isPopular: true
  },
  {
    name: 'Dental Implants',
    code: 'IMPLANTS',
    category: 'surgical',
    description: 'Permanent tooth replacement solutions',
    detailedDescription: 'Advanced dental implant placement for permanent tooth replacement that looks and functions like natural teeth.',
    pricing: {
      basePrice: 1500,
      priceRange: { min: 1200, max: 2000 },
      isVariable: true,
      currency: 'USD'
    },
    duration: 120,
    requirements: {
      consultationRequired: true,
      preparationTime: 30,
      recoveryTime: 60,
      followUpRequired: true,
      followUpInterval: 90
    },
    features: [
      { name: 'Permanent Solution', description: 'Long-lasting tooth replacement', icon: 'fas fa-screwdriver' },
      { name: 'Natural Look', description: 'Indistinguishable from real teeth', icon: 'fas fa-smile' },
      { name: 'Advanced Technology', description: 'Latest implant technology', icon: 'fas fa-robot' }
    ],
    isActive: true,
    isFeatured: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create patients
    const patients = await Patient.create(samplePatients);
    console.log(`👥 Created ${patients.length} patients`);

    // Create doctors
    const doctors = await Doctor.create(sampleDoctors);
    console.log(`👨‍⚕️ Created ${doctors.length} doctors`);

    // Create services
    const services = await Service.create(sampleServices);
    console.log(`🦷 Created ${services.length} services`);

    // Create sample appointments
    const appointments = await Appointment.create([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        service: 'consultation',
        serviceName: 'Free Consultation',
        appointmentDate: new Date('2025-02-15'),
        appointmentTime: '09:00',
        duration: 30,
        urgency: 'routine',
        status: 'scheduled',
        paymentMethod: 'insurance',
        estimatedCost: 0
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        service: 'cleaning',
        serviceName: 'Teeth Cleaning',
        appointmentDate: new Date('2025-02-20'),
        appointmentTime: '14:00',
        duration: 45,
        urgency: 'routine',
        status: 'confirmed',
        paymentMethod: 'insurance',
        estimatedCost: 80
      }
    ]);
    console.log(`📅 Created ${appointments.length} appointments`);

    // Create sample medical records
    const medicalRecords = await MedicalRecord.create([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]._id,
        recordType: 'examination',
        treatment: 'Comprehensive dental examination',
        diagnosis: {
          primary: 'Healthy dentition',
          secondary: ['Minor tartar buildup'],
          notes: 'Patient has good oral hygiene with minor areas needing attention'
        },
        clinicalNotes: {
          chiefComplaint: 'Routine checkup',
          historyOfPresentIllness: 'No current dental issues',
          clinicalFindings: 'Healthy gums, no cavities detected',
          treatmentProvided: 'Oral examination, X-rays taken',
          recommendations: 'Continue regular brushing and flossing',
          followUpInstructions: 'Schedule cleaning in 6 months'
        },
        treatmentDate: new Date('2025-02-15'),
        status: 'completed'
      }
    ]);
    console.log(`📋 Created ${medicalRecords.length} medical records`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Patients: ${patients.length}`);
    console.log(`- Doctors: ${doctors.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`- Appointments: ${appointments.length}`);
    console.log(`- Medical Records: ${medicalRecords.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
