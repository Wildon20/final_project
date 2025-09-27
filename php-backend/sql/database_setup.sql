-- Create database
CREATE DATABASE IF NOT EXISTS drt_dental;
USE drt_dental;

-- Patients table
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer-not') NOT NULL,
    password VARCHAR(255) NOT NULL,
    street_address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Eswatini',
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_member_id VARCHAR(50),
    insurance_group_number VARCHAR(50),
    insurance_active BOOLEAN DEFAULT FALSE,
    allergies TEXT,
    medications TEXT,
    medical_conditions TEXT,
    previous_dental_work TEXT,
    preferred_contact_method ENUM('email', 'phone', 'sms') DEFAULT 'email',
    marketing_consent BOOLEAN DEFAULT FALSE,
    reminder_consent BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    title ENUM('Dr.', 'Prof.', 'Dr. Prof.') NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    experience INT NOT NULL,
    bio TEXT,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctor working hours table
CREATE TABLE doctor_working_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Doctor services table
CREATE TABLE doctor_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    service_code VARCHAR(50) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category ENUM('general', 'cosmetic', 'surgical', 'orthodontic', 'emergency', 'preventive', 'restorative') NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    is_variable BOOLEAN DEFAULT FALSE,
    currency VARCHAR(3) DEFAULT 'USD',
    duration INT NOT NULL COMMENT 'Duration in minutes',
    consultation_required BOOLEAN DEFAULT FALSE,
    preparation_time INT DEFAULT 0 COMMENT 'Preparation time in minutes',
    recovery_time INT DEFAULT 0 COMMENT 'Recovery time in minutes',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_interval INT COMMENT 'Follow up interval in days',
    min_age INT,
    max_age INT,
    medical_conditions TEXT,
    prerequisites TEXT,
    is_covered_by_insurance BOOLEAN DEFAULT FALSE,
    coverage_percentage DECIMAL(5,2),
    requires_pre_approval BOOLEAN DEFAULT FALSE,
    insurance_codes TEXT,
    features JSON,
    faq JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    slug VARCHAR(255),
    total_bookings INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    last_booked DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    service_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    urgency ENUM('routine', 'soon', 'urgent', 'emergency') DEFAULT 'routine',
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    notes TEXT,
    patient_notes TEXT,
    payment_method ENUM('insurance', 'selfPay', 'paymentPlan', 'careCredit') NOT NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    cancellation_reason TEXT,
    cancelled_by ENUM('patient', 'doctor', 'admin'),
    cancelled_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Appointment reminders table
CREATE TABLE appointment_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    reminder_type ENUM('email', 'sms', 'phone') NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'delivered', 'failed') DEFAULT 'sent',
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Medical records table
CREATE TABLE medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    record_type ENUM('examination', 'treatment', 'procedure', 'consultation', 'follow-up', 'emergency', 'cleaning', 'surgery', 'restoration') NOT NULL,
    treatment VARCHAR(255) NOT NULL,
    primary_diagnosis VARCHAR(255) NOT NULL,
    secondary_diagnosis TEXT,
    diagnosis_notes TEXT,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    clinical_findings TEXT,
    treatment_provided TEXT,
    recommendations TEXT,
    follow_up_instructions TEXT,
    blood_pressure VARCHAR(20),
    heart_rate INT,
    temperature DECIMAL(4,2),
    oxygen_saturation INT,
    vital_signs_recorded_at DATETIME,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_scheduled_date DATE,
    follow_up_instructions_text TEXT,
    follow_up_priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('active', 'completed', 'cancelled', 'on-hold') DEFAULT 'active',
    procedure_code VARCHAR(50),
    procedure_description TEXT,
    cost DECIMAL(10,2),
    insurance_covered DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    billing_status ENUM('pending', 'submitted', 'approved', 'denied', 'paid') DEFAULT 'pending',
    treatment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Medical record medications table
CREATE TABLE medical_record_medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    instructions TEXT,
    prescribed_by INT,
    prescribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (prescribed_by) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Medical record attachments table
CREATE TABLE medical_record_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);

-- Medical record imaging table
CREATE TABLE medical_record_imaging (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    imaging_type ENUM('x-ray', 'panoramic', 'cbct', 'intraoral', 'photograph') NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    findings TEXT,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO doctors (first_name, last_name, title, specialization, license_number, email, phone, experience, bio, is_active, is_available) VALUES
('T', 'Dental', 'Dr.', 'General Dentistry', 'DENT001', 'dr.t@drtdental.com', '+26878514785', 10, 'Dr. T is a highly experienced general dentist with over 10 years of practice. Specializing in comprehensive dental care, cosmetic dentistry, and advanced implant procedures.', TRUE, TRUE),
('Smith', 'Orthodontist', 'Dr.', 'Orthodontics', 'ORTHO001', 'dr.smith@drtdental.com', '+26878514786', 8, 'Dr. Smith is a certified orthodontist with extensive experience in creating beautiful, straight smiles using the latest technology.', TRUE, TRUE);

INSERT INTO doctor_working_hours (doctor_id, day_of_week, start_time, end_time, is_working) VALUES
(1, 'monday', '09:00:00', '18:00:00', TRUE),
(1, 'tuesday', '09:00:00', '18:00:00', TRUE),
(1, 'wednesday', '09:00:00', '18:00:00', TRUE),
(1, 'thursday', '09:00:00', '18:00:00', TRUE),
(1, 'friday', '09:00:00', '18:00:00', TRUE),
(1, 'saturday', '09:00:00', '13:00:00', TRUE),
(1, 'sunday', '09:00:00', '18:00:00', FALSE),
(2, 'monday', '09:00:00', '17:00:00', TRUE),
(2, 'tuesday', '09:00:00', '17:00:00', TRUE),
(2, 'wednesday', '09:00:00', '17:00:00', TRUE),
(2, 'thursday', '09:00:00', '17:00:00', TRUE),
(2, 'friday', '09:00:00', '17:00:00', TRUE),
(2, 'saturday', '09:00:00', '12:00:00', TRUE),
(2, 'sunday', '09:00:00', '17:00:00', FALSE);

INSERT INTO services (name, code, category, description, detailed_description, base_price, duration, is_active, is_featured, is_popular) VALUES
('Free Consultation', 'CONSULTATION', 'general', 'Initial examination and treatment planning', 'Comprehensive dental examination including oral health assessment, X-rays if needed, and personalized treatment plan development.', 0.00, 30, TRUE, TRUE, FALSE),
('Teeth Cleaning', 'CLEANING', 'general', 'Professional cleaning and examination', 'Professional dental cleaning including plaque removal, tartar scaling, polishing, and fluoride treatment.', 80.00, 45, TRUE, TRUE, TRUE),
('Teeth Whitening', 'WHITENING', 'cosmetic', 'Professional in-office whitening', 'Professional teeth whitening treatment using advanced bleaching agents for immediate and dramatic results.', 300.00, 60, TRUE, TRUE, TRUE),
('Dental Implants', 'IMPLANTS', 'surgical', 'Permanent tooth replacement solutions', 'Advanced dental implant placement for permanent tooth replacement that looks and functions like natural teeth.', 1500.00, 120, TRUE, TRUE, FALSE);

INSERT INTO doctor_services (doctor_id, service_code) VALUES
(1, 'CONSULTATION'),
(1, 'CLEANING'),
(1, 'WHITENING'),
(1, 'IMPLANTS'),
(2, 'CONSULTATION');

