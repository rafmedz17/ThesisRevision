-- Migration: Add submittedBy and timestamp fields to thesis table
-- Date: 2026-01-24
-- Description: Track which student submitted each thesis and when

ALTER TABLE thesis
ADD COLUMN submittedBy VARCHAR(36) AFTER status,
ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER submittedBy,
ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER createdAt,
ADD INDEX idx_submittedBy (submittedBy);

-- Add foreign key constraint (optional - comment out if users table doesn't exist yet)
-- ALTER TABLE thesis
-- ADD CONSTRAINT fk_thesis_submittedBy
-- FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE SET NULL;
