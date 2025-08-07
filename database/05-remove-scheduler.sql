-- Migration: Remove scheduler functionality
-- This script removes scheduler-specific database elements while preserving core manufacturing workflow

BEGIN;

-- Drop scheduled operations table and related indexes
DROP TABLE IF EXISTS scheduled_operations CASCADE;
DROP INDEX IF EXISTS idx_scheduled_operations_tenant;
DROP INDEX IF EXISTS idx_scheduled_operations_work_center;
DROP INDEX IF EXISTS idx_scheduled_operations_dates;

-- Remove auto_scheduled and scheduling_notes from jobs table
ALTER TABLE jobs DROP COLUMN IF EXISTS auto_scheduled;
ALTER TABLE jobs DROP COLUMN IF EXISTS scheduling_notes;

-- Keep job_operations table structure as it's useful for basic manufacturing workflow
-- Only remove scheduler-specific fields if they exist
ALTER TABLE job_operations DROP COLUMN IF EXISTS scheduled_start;
ALTER TABLE job_operations DROP COLUMN IF EXISTS scheduled_end;

-- Update user_role enum to remove 'scheduler' role
-- First, check if any users have scheduler role and update them to operator
UPDATE users SET role = 'operator' WHERE role = 'scheduler';

-- Drop and recreate the enum without scheduler
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('operator', 'manager', 'admin');

-- Re-add the column with the new enum type
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Clean up any scheduled operations references in utility scripts would be handled by removing the table above

COMMIT;

-- Verify the changes
SELECT 'Migration completed successfully. Scheduler functionality removed.' as result;