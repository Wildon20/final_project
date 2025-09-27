-- =====================================================
-- DR T DENTAL SMART SYSTEM DATABASE (FIXED VERSION)
-- 修復版本 - 相容於較舊的 MySQL 版本
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS drt_dental_smart;
USE drt_dental_smart;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Patients table - Core patient information
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer-not') NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Address information
    street_address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Eswatini',
    
    -- Emergency contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    
    -- Insurance information
    insurance_provider VARCHAR(100),
    insurance_member_id VARCHAR(50),
    insurance_group_number VARCHAR(50),
    insurance_active BOOLEAN DEFAULT FALSE,
    
    -- Medical information
    allergies TEXT,
    medications TEXT,
    medical_conditions TEXT,
    previous_dental_work TEXT,
    
    -- Preferences
    preferred_contact_method ENUM('email', 'phone', 'sms') DEFAULT 'email',
    marketing_consent BOOLEAN DEFAULT FALSE,
    reminder_consent BOOLEAN DEFAULT TRUE,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    last_login DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_last_name (last_name),
    INDEX idx_created_at (created_at)
);

-- Doctors table - Dental professionals
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
    
    -- Education and qualifications (stored as TEXT instead of JSON for compatibility)
    education TEXT,
    certifications TEXT,
    languages TEXT,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_specialization (specialization),
    INDEX idx_is_active (is_active),
    INDEX idx_is_available (is_available)
);

-- Doctor working hours table
CREATE TABLE doctor_working_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME,
    end_time TIME,
    is_working BOOLEAN DEFAULT TRUE,
    break_start_time TIME,
    break_end_time TIME,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_day (doctor_id, day_of_week)
);

-- Services table - Dental services offered
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category ENUM('general', 'cosmetic', 'surgical', 'orthodontic', 'emergency', 'preventive', 'restorative') NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    is_variable BOOLEAN DEFAULT FALSE,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Duration and requirements
    duration INT NOT NULL COMMENT 'Duration in minutes',
    consultation_required BOOLEAN DEFAULT FALSE,
    preparation_time INT DEFAULT 0 COMMENT 'Preparation time in minutes',
    recovery_time INT DEFAULT 0 COMMENT 'Recovery time in minutes',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_interval INT COMMENT 'Follow up interval in days',
    
    -- Age restrictions
    min_age INT,
    max_age INT,
    
    -- Medical requirements
    medical_conditions TEXT,
    prerequisites TEXT,
    
    -- Insurance information
    is_covered_by_insurance BOOLEAN DEFAULT FALSE,
    coverage_percentage DECIMAL(5,2),
    requires_pre_approval BOOLEAN DEFAULT FALSE,
    insurance_codes TEXT,
    
    -- Features and FAQ (stored as TEXT instead of JSON for compatibility)
    features TEXT,
    faq TEXT,
    
    -- Status and visibility
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    slug VARCHAR(255),
    
    -- Statistics
    total_bookings INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    last_booked DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_is_featured (is_featured),
    INDEX idx_code (code)
);

-- Doctor services relationship table
CREATE TABLE doctor_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    service_id INT NOT NULL,
    service_code VARCHAR(50) NOT NULL,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_service (doctor_id, service_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_service_id (service_id)
);

-- =====================================================
-- APPOINTMENT MANAGEMENT
-- =====================================================

-- Appointments table (修復版本 - 移除 GENERATED 欄位)
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    service_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    
    -- Appointment timing
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    end_time TIME, -- 手動計算，不使用 GENERATED
    
    -- Urgency and status
    urgency ENUM('routine', 'soon', 'urgent', 'emergency') DEFAULT 'routine',
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    
    -- Notes
    notes TEXT,
    patient_notes TEXT,
    doctor_notes TEXT,
    
    -- Payment information
    payment_method ENUM('insurance', 'selfPay', 'paymentPlan', 'careCredit') NOT NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by ENUM('patient', 'doctor', 'admin'),
    cancelled_at DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency)
);

-- Appointment reminders table
CREATE TABLE appointment_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    reminder_type ENUM('email', 'sms', 'phone') NOT NULL,
    scheduled_for DATETIME NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    message TEXT,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_scheduled_for (scheduled_for),
    INDEX idx_status (status)
);

-- =====================================================
-- MEDICAL RECORDS
-- =====================================================

-- Medical records table
CREATE TABLE medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    
    -- Record classification
    record_type ENUM('examination', 'treatment', 'procedure', 'consultation', 'follow-up', 'emergency', 'cleaning', 'surgery', 'restoration') NOT NULL,
    treatment VARCHAR(255) NOT NULL,
    
    -- Diagnosis
    primary_diagnosis VARCHAR(255) NOT NULL,
    secondary_diagnosis TEXT,
    diagnosis_notes TEXT,
    
    -- Clinical information
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    clinical_findings TEXT,
    treatment_provided TEXT,
    recommendations TEXT,
    follow_up_instructions TEXT,
    
    -- Vital signs
    blood_pressure VARCHAR(20),
    heart_rate INT,
    temperature DECIMAL(4,2),
    oxygen_saturation INT,
    vital_signs_recorded_at DATETIME,
    
    -- Follow-up planning
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_scheduled_date DATE,
    follow_up_instructions_text TEXT,
    follow_up_priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Status and billing
    status ENUM('active', 'completed', 'cancelled', 'on-hold') DEFAULT 'active',
    procedure_code VARCHAR(50),
    procedure_description TEXT,
    cost DECIMAL(10,2),
    insurance_covered DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    billing_status ENUM('pending', 'submitted', 'approved', 'denied', 'paid') DEFAULT 'pending',
    
    -- Treatment date
    treatment_date DATE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_treatment_date (treatment_date),
    INDEX idx_record_type (record_type),
    INDEX idx_status (status)
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
    FOREIGN KEY (prescribed_by) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_medical_record_id (medical_record_id)
);

-- Medical record attachments table
CREATE TABLE medical_record_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    INDEX idx_medical_record_id (medical_record_id)
);

-- Medical record imaging table
CREATE TABLE medical_record_imaging (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id INT NOT NULL,
    imaging_type ENUM('x-ray', 'panoramic', 'cbct', 'intraoral', 'photograph', 'ct-scan', 'mri') NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    findings TEXT,
    
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    INDEX idx_medical_record_id (medical_record_id),
    INDEX idx_imaging_type (imaging_type)
);

-- =====================================================
-- PATIENT COMMUNICATION
-- =====================================================

-- Patient messages table
CREATE TABLE patient_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('general', 'appointment', 'billing', 'medical', 'emergency') DEFAULT 'general',
    status ENUM('unread', 'read', 'replied', 'closed') DEFAULT 'unread',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample doctors
INSERT INTO doctors (first_name, last_name, title, specialization, license_number, email, phone, experience, bio, education, is_active, is_available) VALUES
('T', 'Dental', 'Dr.', 'General Dentistry', 'DENT001', 'dr.t@drtdental.com', '+26878514785', 10, 'Dr. T is a highly experienced general dentist with over 10 years of practice. Specializing in comprehensive dental care, cosmetic dentistry, and advanced implant procedures.', 
 'Doctor of Dental Surgery, University of Cape Town, 2010; Master of Science in Oral Surgery, University of the Witwatersrand, 2015', TRUE, TRUE),

('Smith', 'Orthodontist', 'Dr.', 'Orthodontics', 'ORTHO001', 'dr.smith@drtdental.com', '+26878514786', 8, 'Dr. Smith is a certified orthodontist with extensive experience in creating beautiful, straight smiles using the latest technology.',
 'Bachelor of Dental Surgery, University of Pretoria, 2010; Master of Science in Orthodontics, University of the Witwatersrand, 2012', TRUE, TRUE);

-- Insert doctor working hours
INSERT INTO doctor_working_hours (doctor_id, day_of_week, start_time, end_time, is_working) VALUES
-- Dr. T working hours
(1, 'monday', '09:00:00', '18:00:00', TRUE),
(1, 'tuesday', '09:00:00', '18:00:00', TRUE),
(1, 'wednesday', '09:00:00', '18:00:00', TRUE),
(1, 'thursday', '09:00:00', '18:00:00', TRUE),
(1, 'friday', '09:00:00', '18:00:00', TRUE),
(1, 'saturday', '09:00:00', '13:00:00', TRUE),
(1, 'sunday', '09:00:00', '18:00:00', FALSE),
-- Dr. Smith working hours
(2, 'monday', '09:00:00', '17:00:00', TRUE),
(2, 'tuesday', '09:00:00', '17:00:00', TRUE),
(2, 'wednesday', '09:00:00', '17:00:00', TRUE),
(2, 'thursday', '09:00:00', '17:00:00', TRUE),
(2, 'friday', '09:00:00', '17:00:00', TRUE),
(2, 'saturday', '09:00:00', '12:00:00', TRUE),
(2, 'sunday', '09:00:00', '17:00:00', FALSE);

-- Insert sample services
INSERT INTO services (name, code, category, description, detailed_description, base_price, duration, is_active, is_featured, is_popular, features, faq) VALUES
('Free Consultation', 'CONSULTATION', 'general', 'Initial examination and treatment planning', 'Comprehensive dental examination including oral health assessment, X-rays if needed, and personalized treatment plan development.', 0.00, 30, TRUE, TRUE, FALSE,
 'Oral Examination, Treatment Planning, X-rays if needed',
 'Is the consultation really free? Yes, our initial consultation is completely free with no hidden charges. How long does it take? The consultation typically takes 30 minutes.'),

('Teeth Cleaning', 'CLEANING', 'general', 'Professional cleaning and examination', 'Professional dental cleaning including plaque removal, tartar scaling, polishing, and fluoride treatment.', 80.00, 45, TRUE, TRUE, TRUE,
 'Plaque Removal, Teeth Polishing, Fluoride Treatment',
 'How often should I get my teeth cleaned? We recommend professional cleaning every 6 months. Does it hurt? No, teeth cleaning is generally painless and comfortable.'),

('Teeth Whitening', 'WHITENING', 'cosmetic', 'Professional in-office whitening', 'Professional teeth whitening treatment using advanced bleaching agents for immediate and dramatic results.', 300.00, 60, TRUE, TRUE, TRUE,
 'Immediate Results, Safe & Effective, Custom Treatment',
 'How long do the results last? Results can last 1-3 years with proper care. Is it safe? Yes, our professional whitening is completely safe and supervised.'),

('Dental Implants', 'IMPLANTS', 'surgical', 'Permanent tooth replacement solutions', 'Advanced dental implant placement for permanent tooth replacement that looks and functions like natural teeth.', 1500.00, 120, TRUE, TRUE, FALSE,
 'Permanent Solution, Natural Look, Advanced Technology',
 'How long does the procedure take? The complete process takes 3-6 months including healing time. Is it painful? The procedure is performed under local anesthesia, so you should feel minimal discomfort.');

-- Link doctors to services
INSERT INTO doctor_services (doctor_id, service_id, service_code) VALUES
(1, 1, 'CONSULTATION'),
(1, 2, 'CLEANING'),
(1, 3, 'WHITENING'),
(1, 4, 'IMPLANTS'),
(2, 1, 'CONSULTATION');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('clinic_name', 'DR T DENTAL', 'string', 'Name of the dental clinic', TRUE),
('clinic_phone', '+268 78514785', 'string', 'Main clinic phone number', TRUE),
('clinic_email', 'contact@drtdental.com', 'string', 'Main clinic email address', TRUE),
('clinic_address', '123 Dental Street, Mbabane, Eswatini', 'string', 'Clinic physical address', TRUE),
('appointment_advance_days', '30', 'number', 'How many days in advance appointments can be booked', FALSE),
('reminder_hours_before', '24', 'number', 'Hours before appointment to send reminder', FALSE),
('max_appointments_per_day', '20', 'number', 'Maximum appointments per doctor per day', FALSE),
('emergency_phone', '+268 78514785', 'string', 'Emergency contact number', TRUE);

-- Insert sample patient (password is 'password123' hashed)
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, password, street_address, city, postal_code, emergency_contact_name, emergency_contact_phone, is_verified) VALUES
('John', 'Doe', 'john.doe@example.com', '+26812345678', '1990-05-15', 'male', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Main Street', 'Mbabane', 'H100', 'Jane Doe', '+26812345679', TRUE),
('Sarah', 'Johnson', 'sarah.johnson@example.com', '+26812345680', '1985-08-22', 'female', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456 Oak Avenue', 'Manzini', 'M200', 'Mike Johnson', '+26812345681', TRUE);

-- Insert sample appointment
INSERT INTO appointments (patient_id, doctor_id, service_id, service_name, appointment_date, appointment_time, duration, end_time, urgency, status, notes, payment_method, estimated_cost) VALUES
(1, 1, 1, 'Free Consultation', '2025-02-15', '09:00:00', 30, '09:30:00', 'routine', 'scheduled', 'Regular checkup appointment', 'insurance', 0.00);

-- =====================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for better performance
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_medical_records_patient_date ON medical_records(patient_id, treatment_date);
CREATE INDEX idx_patients_created_at ON patients(created_at);

-- =====================================================
-- DATABASE COMPLETED
-- =====================================================

-- Display completion message
SELECT 'DR T DENTAL SMART SYSTEM DATABASE CREATED SUCCESSFULLY!' as message;
SELECT 'Database: drt_dental_smart' as database_name;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'drt_dental_smart';
