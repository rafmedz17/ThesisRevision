-- Production Database Migration Script
-- Execute these in order to update the production database

-- Step 1: Add role 'student' to users table
ALTER TABLE users
MODIFY COLUMN role ENUM('admin', 'student-assistant', 'student') NOT NULL;

-- Step 2: Add shelfLocation column to thesis table
ALTER TABLE thesis
ADD COLUMN shelfLocation VARCHAR(255);

-- Step 3: Add status column to thesis table (MUST be added BEFORE referencing it)
ALTER TABLE thesis
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved';

-- Step 4: Add indexes for shelfLocation and status
CREATE INDEX idx_shelf_location ON thesis (shelfLocation);
CREATE INDEX idx_status ON thesis (status);

-- Step 5: Now add submittedBy, createdAt, updatedAt columns (AFTER status exists)
ALTER TABLE thesis
ADD COLUMN submittedBy VARCHAR(36) AFTER status,
ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER submittedBy,
ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER createdAt;

-- Step 6: Add index for submittedBy
CREATE INDEX idx_submittedBy ON thesis (submittedBy);

-- Migration completed successfully!
