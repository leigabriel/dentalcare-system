-- Migration: Add declined status and payment features to appointments table
-- Run this if you have an existing database

-- Add 'declined' to status enum
ALTER TABLE appointments 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'declined') DEFAULT 'pending';

-- Add payment_method column if it doesn't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_method ENUM('gcash', 'paypal', 'clinic') DEFAULT 'clinic' AFTER payment_status;

-- Add payment_reference column if it doesn't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255) DEFAULT NULL AFTER payment_method;

-- Add paid_at column if it doesn't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL DEFAULT NULL AFTER payment_reference;
