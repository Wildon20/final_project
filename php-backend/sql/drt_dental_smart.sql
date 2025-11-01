-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 01, 2025 at 07:40 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `drt_dental_smart`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `end_time` time DEFAULT NULL,
  `urgency` enum('routine','soon','urgent','emergency') DEFAULT 'routine',
  `status` enum('scheduled','confirmed','in-progress','completed','cancelled','no-show') DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `patient_notes` text DEFAULT NULL,
  `doctor_notes` text DEFAULT NULL,
  `payment_method` enum('insurance','selfPay','paymentPlan','careCredit') NOT NULL,
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `cancelled_by` enum('patient','doctor','admin') DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `service_id`, `service_name`, `appointment_date`, `appointment_time`, `duration`, `end_time`, `urgency`, `status`, `notes`, `patient_notes`, `doctor_notes`, `payment_method`, `estimated_cost`, `actual_cost`, `follow_up_required`, `follow_up_date`, `cancellation_reason`, `cancelled_by`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Free Consultation', '2025-02-15', '09:00:00', 30, '09:30:00', 'routine', 'scheduled', 'Regular checkup appointment', NULL, NULL, 'insurance', 0.00, NULL, 0, NULL, NULL, NULL, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56');

-- --------------------------------------------------------

--
-- Table structure for table `appointment_reminders`
--

CREATE TABLE `appointment_reminders` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `reminder_type` enum('email','sms','phone') NOT NULL,
  `scheduled_for` datetime NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','sent','delivered','failed') DEFAULT 'pending',
  `message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `title` enum('Dr.','Prof.','Dr. Prof.') NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `experience` int(11) NOT NULL,
  `bio` text DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `education` text DEFAULT NULL,
  `certifications` text DEFAULT NULL,
  `languages` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `first_name`, `last_name`, `title`, `specialization`, `license_number`, `email`, `phone`, `experience`, `bio`, `profile_image`, `education`, `certifications`, `languages`, `is_active`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 'Thembi', 'Dental', 'Dr.', 'General Dentistry', 'DENT001', 'dr.t@drtdental.com', '+26878514785', 10, 'Dr. T is a highly experienced general dentist with over 10 years of practice. Specializing in comprehensive dental care, cosmetic dentistry, and advanced implant procedures.', NULL, 'Doctor of Dental Surgery, University of Cape Town, 2010; Master of Science in Oral Surgery, University of the Witwatersrand, 2015', NULL, NULL, 1, 1, '2025-09-27 12:28:55', '2025-10-26 06:56:00'),
(2, 'Ntethelelo', 'Orthodontist', 'Dr.', 'Orthodontics', 'ORTHO001', 'dr.smith@drtdental.com', '+26878514786', 8, 'Dr. Smith is a certified orthodontist with extensive experience in creating beautiful, straight smiles using the latest technology.', NULL, 'Bachelor of Dental Surgery, University of Pretoria, 2010; Master of Science in Orthodontics, University of the Witwatersrand, 2012', NULL, NULL, 1, 1, '2025-09-27 12:28:55', '2025-10-26 06:56:30');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_services`
--

CREATE TABLE `doctor_services` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `service_code` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_services`
--

INSERT INTO `doctor_services` (`id`, `doctor_id`, `service_id`, `service_code`) VALUES
(1, 1, 1, 'CONSULTATION'),
(2, 1, 2, 'CLEANING'),
(3, 1, 3, 'WHITENING'),
(4, 1, 4, 'IMPLANTS'),
(5, 2, 1, 'CONSULTATION');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_working_hours`
--

CREATE TABLE `doctor_working_hours` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_working` tinyint(1) DEFAULT 1,
  `break_start_time` time DEFAULT NULL,
  `break_end_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_working_hours`
--

INSERT INTO `doctor_working_hours` (`id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`, `is_working`, `break_start_time`, `break_end_time`) VALUES
(1, 1, 'monday', '09:00:00', '18:00:00', 1, NULL, NULL),
(2, 1, 'tuesday', '09:00:00', '18:00:00', 1, NULL, NULL),
(3, 1, 'wednesday', '09:00:00', '18:00:00', 1, NULL, NULL),
(4, 1, 'thursday', '09:00:00', '18:00:00', 1, NULL, NULL),
(5, 1, 'friday', '09:00:00', '18:00:00', 1, NULL, NULL),
(6, 1, 'saturday', '09:00:00', '13:00:00', 1, NULL, NULL),
(7, 1, 'sunday', '09:00:00', '18:00:00', 0, NULL, NULL),
(8, 2, 'monday', '09:00:00', '17:00:00', 1, NULL, NULL),
(9, 2, 'tuesday', '09:00:00', '17:00:00', 1, NULL, NULL),
(10, 2, 'wednesday', '09:00:00', '17:00:00', 1, NULL, NULL),
(11, 2, 'thursday', '09:00:00', '17:00:00', 1, NULL, NULL),
(12, 2, 'friday', '09:00:00', '17:00:00', 1, NULL, NULL),
(13, 2, 'saturday', '09:00:00', '12:00:00', 1, NULL, NULL),
(14, 2, 'sunday', '09:00:00', '17:00:00', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `record_type` enum('examination','treatment','procedure','consultation','follow-up','emergency','cleaning','surgery','restoration') NOT NULL,
  `treatment` varchar(255) NOT NULL,
  `primary_diagnosis` varchar(255) NOT NULL,
  `secondary_diagnosis` text DEFAULT NULL,
  `diagnosis_notes` text DEFAULT NULL,
  `chief_complaint` text DEFAULT NULL,
  `history_of_present_illness` text DEFAULT NULL,
  `clinical_findings` text DEFAULT NULL,
  `treatment_provided` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `follow_up_instructions` text DEFAULT NULL,
  `blood_pressure` varchar(20) DEFAULT NULL,
  `heart_rate` int(11) DEFAULT NULL,
  `temperature` decimal(4,2) DEFAULT NULL,
  `oxygen_saturation` int(11) DEFAULT NULL,
  `vital_signs_recorded_at` datetime DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_scheduled_date` date DEFAULT NULL,
  `follow_up_instructions_text` text DEFAULT NULL,
  `follow_up_priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('active','completed','cancelled','on-hold') DEFAULT 'active',
  `procedure_code` varchar(50) DEFAULT NULL,
  `procedure_description` text DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `insurance_covered` decimal(10,2) DEFAULT NULL,
  `patient_responsibility` decimal(10,2) DEFAULT NULL,
  `billing_status` enum('pending','submitted','approved','denied','paid') DEFAULT 'pending',
  `treatment_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_record_attachments`
--

CREATE TABLE `medical_record_attachments` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_record_imaging`
--

CREATE TABLE `medical_record_imaging` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `imaging_type` enum('x-ray','panoramic','cbct','intraoral','photograph','ct-scan','mri') NOT NULL,
  `description` text DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `taken_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `findings` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_record_medications`
--

CREATE TABLE `medical_record_medications` (
  `id` int(11) NOT NULL,
  `medical_record_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `prescribed_by` int(11) DEFAULT NULL,
  `prescribed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other','prefer-not') NOT NULL,
  `password` varchar(255) NOT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT 'Eswatini',
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_relationship` varchar(50) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `insurance_provider` varchar(100) DEFAULT NULL,
  `insurance_member_id` varchar(50) DEFAULT NULL,
  `insurance_group_number` varchar(50) DEFAULT NULL,
  `insurance_active` tinyint(1) DEFAULT 0,
  `allergies` text DEFAULT NULL,
  `medications` text DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `previous_dental_work` text DEFAULT NULL,
  `preferred_contact_method` enum('email','phone','sms') DEFAULT 'email',
  `marketing_consent` tinyint(1) DEFAULT 0,
  `reminder_consent` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expire` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `password`, `street_address`, `city`, `postal_code`, `country`, `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_phone`, `insurance_provider`, `insurance_member_id`, `insurance_group_number`, `insurance_active`, `allergies`, `medications`, `medical_conditions`, `previous_dental_work`, `preferred_contact_method`, `marketing_consent`, `reminder_consent`, `is_active`, `is_verified`, `verification_token`, `reset_password_token`, `reset_password_expire`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '+26812345678', '1990-05-15', 'male', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Main Street', 'Mbabane', 'H100', 'Eswatini', 'Jane Doe', NULL, '+26812345679', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'email', 0, 1, 1, 1, NULL, NULL, NULL, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56'),
(2, 'Sarah', 'Johnson', 'sarah.johnson@example.com', '+26812345680', '1985-08-22', 'female', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456 Oak Avenue', 'Manzini', 'M200', 'Eswatini', 'Mike Johnson', NULL, '+26812345681', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 'email', 0, 1, 1, 1, NULL, NULL, NULL, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56');

-- --------------------------------------------------------

--
-- Table structure for table `patient_messages`
--

CREATE TABLE `patient_messages` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('general','appointment','billing','medical','emergency') DEFAULT 'general',
  `status` enum('unread','read','replied','closed') DEFAULT 'unread',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `category` enum('general','cosmetic','surgical','orthodontic','emergency','preventive','restorative') NOT NULL,
  `description` text NOT NULL,
  `detailed_description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `min_price` decimal(10,2) DEFAULT NULL,
  `max_price` decimal(10,2) DEFAULT NULL,
  `is_variable` tinyint(1) DEFAULT 0,
  `currency` varchar(3) DEFAULT 'USD',
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `consultation_required` tinyint(1) DEFAULT 0,
  `preparation_time` int(11) DEFAULT 0 COMMENT 'Preparation time in minutes',
  `recovery_time` int(11) DEFAULT 0 COMMENT 'Recovery time in minutes',
  `follow_up_required` tinyint(1) DEFAULT 0,
  `follow_up_interval` int(11) DEFAULT NULL COMMENT 'Follow up interval in days',
  `min_age` int(11) DEFAULT NULL,
  `max_age` int(11) DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `prerequisites` text DEFAULT NULL,
  `is_covered_by_insurance` tinyint(1) DEFAULT 0,
  `coverage_percentage` decimal(5,2) DEFAULT NULL,
  `requires_pre_approval` tinyint(1) DEFAULT 0,
  `insurance_codes` text DEFAULT NULL,
  `features` text DEFAULT NULL,
  `faq` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_popular` tinyint(1) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `total_bookings` int(11) DEFAULT 0,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `last_booked` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `code`, `category`, `description`, `detailed_description`, `base_price`, `min_price`, `max_price`, `is_variable`, `currency`, `duration`, `consultation_required`, `preparation_time`, `recovery_time`, `follow_up_required`, `follow_up_interval`, `min_age`, `max_age`, `medical_conditions`, `prerequisites`, `is_covered_by_insurance`, `coverage_percentage`, `requires_pre_approval`, `insurance_codes`, `features`, `faq`, `is_active`, `is_featured`, `is_popular`, `meta_title`, `meta_description`, `keywords`, `slug`, `total_bookings`, `average_rating`, `review_count`, `last_booked`, `created_at`, `updated_at`) VALUES
(1, 'Free Consultation', 'CONSULTATION', 'general', 'Initial examination and treatment planning', 'Comprehensive dental examination including oral health assessment, X-rays if needed, and personalized treatment plan development.', 0.00, NULL, NULL, 0, 'USD', 30, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 'Oral Examination, Treatment Planning, X-rays if needed', 'Is the consultation really free? Yes, our initial consultation is completely free with no hidden charges. How long does it take? The consultation typically takes 30 minutes.', 1, 1, 0, NULL, NULL, NULL, NULL, 0, 0.00, 0, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56'),
(2, 'Teeth Cleaning', 'CLEANING', 'general', 'Professional cleaning and examination', 'Professional dental cleaning including plaque removal, tartar scaling, polishing, and fluoride treatment.', 80.00, NULL, NULL, 0, 'USD', 45, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 'Plaque Removal, Teeth Polishing, Fluoride Treatment', 'How often should I get my teeth cleaned? We recommend professional cleaning every 6 months. Does it hurt? No, teeth cleaning is generally painless and comfortable.', 1, 1, 1, NULL, NULL, NULL, NULL, 0, 0.00, 0, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56'),
(3, 'Teeth Whitening', 'WHITENING', 'cosmetic', 'Professional in-office whitening', 'Professional teeth whitening treatment using advanced bleaching agents for immediate and dramatic results.', 300.00, NULL, NULL, 0, 'USD', 60, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 'Immediate Results, Safe & Effective, Custom Treatment', 'How long do the results last? Results can last 1-3 years with proper care. Is it safe? Yes, our professional whitening is completely safe and supervised.', 1, 1, 1, NULL, NULL, NULL, NULL, 0, 0.00, 0, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56'),
(4, 'Dental Implants', 'IMPLANTS', 'surgical', 'Permanent tooth replacement solutions', 'Advanced dental implant placement for permanent tooth replacement that looks and functions like natural teeth.', 1500.00, NULL, NULL, 0, 'USD', 120, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, 'Permanent Solution, Natural Look, Advanced Technology', 'How long does the procedure take? The complete process takes 3-6 months including healing time. Is it painful? The procedure is performed under local anesthesia, so you should feel minimal discomfort.', 1, 1, 0, NULL, NULL, NULL, NULL, 0, 0.00, 0, NULL, '2025-09-27 12:28:56', '2025-09-27 12:28:56');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `updated_at`) VALUES
(1, 'clinic_name', 'DR T DENTAL', 'string', 'Name of the dental clinic', 1, '2025-09-27 12:28:56'),
(2, 'clinic_phone', '+268 78514785', 'string', 'Main clinic phone number', 1, '2025-09-27 12:28:56'),
(3, 'clinic_email', 'contact@drtdental.com', 'string', 'Main clinic email address', 1, '2025-09-27 12:28:56'),
(4, 'clinic_address', '123 Dental Street, Mbabane, Eswatini', 'string', 'Clinic physical address', 1, '2025-09-27 12:28:56'),
(5, 'appointment_advance_days', '30', 'number', 'How many days in advance appointments can be booked', 0, '2025-09-27 12:28:56'),
(6, 'reminder_hours_before', '24', 'number', 'Hours before appointment to send reminder', 0, '2025-09-27 12:28:56'),
(7, 'max_appointments_per_day', '20', 'number', 'Maximum appointments per doctor per day', 0, '2025-09-27 12:28:56'),
(8, 'emergency_phone', '+268 78514785', 'string', 'Emergency contact number', 1, '2025-09-27 12:28:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_patient_id` (`patient_id`),
  ADD KEY `idx_doctor_id` (`doctor_id`),
  ADD KEY `idx_appointment_date` (`appointment_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_urgency` (`urgency`),
  ADD KEY `idx_appointments_date_time` (`appointment_date`,`appointment_time`),
  ADD KEY `idx_appointments_patient_date` (`patient_id`,`appointment_date`);

--
-- Indexes for table `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_appointment_id` (`appointment_id`),
  ADD KEY `idx_scheduled_for` (`scheduled_for`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_specialization` (`specialization`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_is_available` (`is_available`);

--
-- Indexes for table `doctor_services`
--
ALTER TABLE `doctor_services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_doctor_service` (`doctor_id`,`service_id`),
  ADD KEY `idx_doctor_id` (`doctor_id`),
  ADD KEY `idx_service_id` (`service_id`);

--
-- Indexes for table `doctor_working_hours`
--
ALTER TABLE `doctor_working_hours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_doctor_day` (`doctor_id`,`day_of_week`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `idx_patient_id` (`patient_id`),
  ADD KEY `idx_doctor_id` (`doctor_id`),
  ADD KEY `idx_treatment_date` (`treatment_date`),
  ADD KEY `idx_record_type` (`record_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_medical_records_patient_date` (`patient_id`,`treatment_date`);

--
-- Indexes for table `medical_record_attachments`
--
ALTER TABLE `medical_record_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_medical_record_id` (`medical_record_id`);

--
-- Indexes for table `medical_record_imaging`
--
ALTER TABLE `medical_record_imaging`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_medical_record_id` (`medical_record_id`),
  ADD KEY `idx_imaging_type` (`imaging_type`);

--
-- Indexes for table `medical_record_medications`
--
ALTER TABLE `medical_record_medications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescribed_by` (`prescribed_by`),
  ADD KEY `idx_medical_record_id` (`medical_record_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_last_name` (`last_name`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_patients_created_at` (`created_at`);

--
-- Indexes for table `patient_messages`
--
ALTER TABLE `patient_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patient_id` (`patient_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `doctor_services`
--
ALTER TABLE `doctor_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `doctor_working_hours`
--
ALTER TABLE `doctor_working_hours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_record_attachments`
--
ALTER TABLE `medical_record_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_record_imaging`
--
ALTER TABLE `medical_record_imaging`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_record_medications`
--
ALTER TABLE `medical_record_medications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patient_messages`
--
ALTER TABLE `patient_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  ADD CONSTRAINT `appointment_reminders_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_services`
--
ALTER TABLE `doctor_services`
  ADD CONSTRAINT `doctor_services_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_working_hours`
--
ALTER TABLE `doctor_working_hours`
  ADD CONSTRAINT `doctor_working_hours_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_records_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_records_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `medical_record_attachments`
--
ALTER TABLE `medical_record_attachments`
  ADD CONSTRAINT `medical_record_attachments_ibfk_1` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_record_imaging`
--
ALTER TABLE `medical_record_imaging`
  ADD CONSTRAINT `medical_record_imaging_ibfk_1` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_record_medications`
--
ALTER TABLE `medical_record_medications`
  ADD CONSTRAINT `medical_record_medications_ibfk_1` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_record_medications_ibfk_2` FOREIGN KEY (`prescribed_by`) REFERENCES `doctors` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `patient_messages`
--
ALTER TABLE `patient_messages`
  ADD CONSTRAINT `patient_messages_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
