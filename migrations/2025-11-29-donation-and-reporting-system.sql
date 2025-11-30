-- Migration: Add Donation Tracking and Post Reporting System
-- Date: 2025-11-29
-- Description: Adds status tracking, images, and enhanced fields for donations and reports

-- ============================================
-- 1. DONATIONS TABLE - Add new tracking fields
-- ============================================

-- Add donor_phone column
ALTER TABLE donations
ADD COLUMN donor_phone VARCHAR(255) NULL AFTER donor_name;

-- Add item_description column
ALTER TABLE donations
ADD COLUMN item_description TEXT NULL AFTER quantity;

-- Add status enum column
ALTER TABLE donations
ADD COLUMN status ENUM('pledged', 'in_transit', 'delivered', 'fulfilled')
NOT NULL DEFAULT 'pledged'
AFTER item_description;

-- Add fulfilled_at timestamp
ALTER TABLE donations
ADD COLUMN fulfilled_at TIMESTAMP NULL AFTER status;

-- Add index on status for filtering
ALTER TABLE donations
ADD INDEX idx_donations_status (status);

-- ============================================
-- 2. DONATION_IMAGES TABLE - Create new table
-- ============================================

CREATE TABLE IF NOT EXISTS donation_images (
  id CHAR(36) PRIMARY KEY,
  donation_id CHAR(36) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign key constraint
  CONSTRAINT fk_donation_images_donation
    FOREIGN KEY (donation_id)
    REFERENCES donations(id)
    ON DELETE CASCADE,

  -- Index for faster lookups
  INDEX idx_donation_id (donation_id),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. POST_FLAGS TABLE - Add reporting enhancements
-- ============================================

-- Add reporter_id column (nullable for anonymous reports)
ALTER TABLE post_flags
ADD COLUMN reporter_id CHAR(36) NULL AFTER post_id;

-- Update reason enum to include new categories
ALTER TABLE post_flags
MODIFY COLUMN reason ENUM('spam', 'scam', 'fake', 'harassment', 'inappropriate', 'other')
NOT NULL DEFAULT 'other';

-- Add status enum column for tracking report lifecycle
ALTER TABLE post_flags
ADD COLUMN status ENUM('pending', 'resolved', 'dismissed')
NOT NULL DEFAULT 'pending'
AFTER details;

-- Add foreign key for reporter
ALTER TABLE post_flags
ADD CONSTRAINT fk_post_flags_reporter
  FOREIGN KEY (reporter_id)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Add indexes for performance
ALTER TABLE post_flags
ADD INDEX idx_reporter_id (reporter_id),
ADD INDEX idx_status (status);

-- ============================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================

-- Verify donations table structure
-- DESCRIBE donations;

-- Verify donation_images table exists
-- DESCRIBE donation_images;

-- Verify post_flags table structure
-- DESCRIBE post_flags;

-- Check existing data (should show new columns with NULL/default values)
-- SELECT id, status, donor_phone, item_description, fulfilled_at FROM donations LIMIT 5;
-- SELECT id, reason, status, reporter_id FROM post_flags LIMIT 5;
