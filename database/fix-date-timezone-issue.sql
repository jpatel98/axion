-- Fix timezone issues with date columns
-- This migration changes DATE columns to TEXT to avoid timezone conversion

BEGIN;

-- Jobs table: Change due_date from DATE to TEXT
ALTER TABLE jobs ALTER COLUMN due_date TYPE TEXT;

-- Quotes table: Change due_date from DATE to TEXT  
ALTER TABLE quotes ALTER COLUMN due_date TYPE TEXT;

-- Update any existing data to ensure proper format (YYYY-MM-DD)
UPDATE jobs SET due_date = to_char(due_date::date, 'YYYY-MM-DD') WHERE due_date IS NOT NULL;
UPDATE quotes SET due_date = to_char(due_date::date, 'YYYY-MM-DD') WHERE due_date IS NOT NULL;

COMMIT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('jobs', 'quotes') 
AND column_name = 'due_date'
ORDER BY table_name;