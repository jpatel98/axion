-- Migration: Add part_number and due_date fields to quotes table
-- Run this SQL to add the new fields to existing quotes table

BEGIN;

-- Add part_number field (optional, like in jobs)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS part_number VARCHAR(100);

-- Add due_date field (optional, like in jobs) 
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS due_date DATE;

-- Create indexes for the new fields for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_part_number ON quotes(part_number) WHERE part_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_due_date ON quotes(due_date) WHERE due_date IS NOT NULL;

-- Check if search_vector column exists, and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'search_vector'
    ) THEN
        -- Add search_vector column
        ALTER TABLE quotes ADD COLUMN search_vector tsvector;
        
        -- Create index for full-text search
        CREATE INDEX IF NOT EXISTS idx_quotes_search_vector ON quotes USING gin(search_vector);
    END IF;
END $$;

-- Update the search vector generation to include part_number if it exists
-- (This is for the enhanced performance indexes)
DROP FUNCTION IF EXISTS update_quotes_search_vector() CASCADE;

CREATE OR REPLACE FUNCTION update_quotes_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.quote_number, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.part_number, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.notes, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Recreate the trigger if it exists
DROP TRIGGER IF EXISTS quotes_search_vector_trigger ON quotes;
CREATE TRIGGER quotes_search_vector_trigger
BEFORE INSERT OR UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION update_quotes_search_vector();

-- Update existing records to populate search_vector
UPDATE quotes SET search_vector = 
  setweight(to_tsvector('english', coalesce(quote_number, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(title, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(part_number, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(notes, '')), 'D');

COMMIT;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name IN ('part_number', 'due_date')
ORDER BY column_name;