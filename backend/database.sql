-- DentalCare System Database Schema
-- MySQL Database Setup

-- Create database
CREATE DATABASE IF NOT EXISTS dentalcare_db;
USE dentalcare_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'staff', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20),
  availability TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_specialization (specialization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_mins INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  doctor_id INT NOT NULL,
  service_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  payment_status ENUM('paid', 'unpaid', 'pending') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_doctor_date (doctor_id, appointment_date),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data

-- Insert admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('Admin', 'User', 'admin@dentalcare.com', '$2a$10$xC0n3Z8YQN1YH9LqL.j/Q.EJ2Y8lH.YPz.V0KGqRGxQJvZ7JKz5Wm', 'admin');

-- Insert sample doctors
INSERT INTO doctors (name, specialization, email, phone, availability) VALUES
('Dr. Sarah Johnson', 'General Dentistry', 'sarah.johnson@dentalcare.com', '555-0101', 'Monday-Friday, 9AM-5PM'),
('Dr. Michael Chen', 'Orthodontics', 'michael.chen@dentalcare.com', '555-0102', 'Tuesday-Saturday, 10AM-6PM'),
('Dr. Emily Rodriguez', 'Cosmetic Dentistry', 'emily.rodriguez@dentalcare.com', '555-0103', 'Monday-Friday, 8AM-4PM'),
('Dr. David Kim', 'Pediatric Dentistry', 'david.kim@dentalcare.com', '555-0104', 'Monday-Friday, 9AM-5PM');

-- Insert sample services
INSERT INTO services (name, description, price, duration_mins) VALUES
('Dental Cleaning', 'Professional teeth cleaning and examination', 75.00, 45),
('Teeth Whitening', 'Professional teeth whitening treatment', 250.00, 60),
('Dental Filling', 'Cavity filling treatment', 150.00, 30),
('Root Canal', 'Root canal therapy', 500.00, 90),
('Tooth Extraction', 'Safe tooth removal', 200.00, 45),
('Dental Crown', 'Ceramic or porcelain crown', 800.00, 60),
('Braces Consultation', 'Initial orthodontic consultation', 100.00, 45),
('Dental Implant', 'Single tooth implant procedure', 2000.00, 120);
