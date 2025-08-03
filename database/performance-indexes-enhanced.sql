-- Performance optimization indexes for Axion ERP (Enhanced version)
-- This script adds additional indexes for better query performance

-- Check if we're running on Supabase (which supports these features)
DO $$ 
BEGIN
  -- Jobs table indexes (existing)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_created') THEN
    CREATE INDEX idx_jobs_tenant_created ON jobs(tenant_id, created_at DESC);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_status') THEN
    CREATE INDEX idx_jobs_status ON jobs(status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_due_date') THEN
    CREATE INDEX idx_jobs_due_date ON jobs(due_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_customer') THEN
    CREATE INDEX idx_jobs_customer ON jobs(customer_name);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_status') THEN
    CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
  END IF;

  -- Additional optimized indexes for common query patterns in the jobs API
  -- Composite index for tenant_id and status filtering (most common filter pattern)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_status_created_desc') THEN
    CREATE INDEX idx_jobs_tenant_status_created_desc ON jobs(tenant_id, status, created_at DESC);
  END IF;

  -- Individual field indexes for search operations (used in the ilike queries)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_job_number') THEN
    CREATE INDEX idx_jobs_job_number ON jobs(job_number);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_part_number') THEN
    CREATE INDEX idx_jobs_part_number ON jobs(part_number);
  END IF;

  -- Composite indexes for sorting operations
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_sortby_created') THEN
    CREATE INDEX idx_jobs_tenant_sortby_created ON jobs(tenant_id, created_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_sortby_updated') THEN
    CREATE INDEX idx_jobs_tenant_sortby_updated ON jobs(tenant_id, updated_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_sortby_due_date') THEN
    CREATE INDEX idx_jobs_tenant_sortby_due_date ON jobs(tenant_id, due_date);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_sortby_job_number') THEN
    CREATE INDEX idx_jobs_tenant_sortby_job_number ON jobs(tenant_id, job_number);
  END IF;

  -- Enhanced search indexes using text pattern matching for faster ilike operations
  -- These indexes improve the performance of the search functionality
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_job_number_pattern') THEN
    CREATE INDEX idx_jobs_job_number_pattern ON jobs(job_number text_pattern_ops);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_customer_name_pattern') THEN
    CREATE INDEX idx_jobs_customer_name_pattern ON jobs(customer_name text_pattern_ops);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_part_number_pattern') THEN
    CREATE INDEX idx_jobs_part_number_pattern ON jobs(part_number text_pattern_ops);
  END IF;

  -- Quotes table indexes (existing from safe version)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_tenant_created') THEN
    CREATE INDEX idx_quotes_tenant_created ON quotes(tenant_id, created_at DESC);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_status') THEN
    CREATE INDEX idx_quotes_status ON quotes(status);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_valid_until') THEN
    CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_customer') THEN
    CREATE INDEX idx_quotes_customer ON quotes(customer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_tenant_status') THEN
    CREATE INDEX idx_quotes_tenant_status ON quotes(tenant_id, status);
  END IF;

  -- Customers table indexes (existing from safe version)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'customers' AND indexname = 'idx_customers_tenant_name') THEN
    CREATE INDEX idx_customers_tenant_name ON customers(tenant_id, name);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'customers' AND indexname = 'idx_customers_tenant_created') THEN
    CREATE INDEX idx_customers_tenant_created ON customers(tenant_id, created_at DESC);
  END IF;

  -- Users table indexes (existing from safe version)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_clerk_id') THEN
    CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_tenant') THEN
    CREATE INDEX idx_users_tenant ON users(tenant_id);
  END IF;

  -- Additional composite indexes for common query patterns
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_tenant_status_created') THEN
    CREATE INDEX idx_jobs_tenant_status_created ON jobs(tenant_id, status, created_at DESC);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_tenant_status_created') THEN
    CREATE INDEX idx_quotes_tenant_status_created ON quotes(tenant_id, status, created_at DESC);
  END IF;

  -- Full-text search indexes for improved search performance
  -- First check if the search_vector column exists, if not create it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE jobs ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(job_number, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(customer_name, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(part_number, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;
  END IF;

  -- Create index on the search vector for fast full-text search if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'jobs' AND indexname = 'idx_jobs_search_vector') THEN
    CREATE INDEX idx_jobs_search_vector ON jobs USING GIN(search_vector);
  END IF;

  -- Create trigger to update search vector when relevant fields change
  -- This ensures the search vector stays up to date with the data
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'jobs_search_vector_trigger'
  ) THEN
    CREATE OR REPLACE FUNCTION update_jobs_search_vector() RETURNS TRIGGER AS $$
    BEGIN
      NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.job_number, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.customer_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.part_number, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER jobs_search_vector_trigger
    BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_jobs_search_vector();
  END IF;

  -- Full-text search for quotes
  -- First check if the search_vector column exists for quotes, if not create it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE quotes ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(quote_number, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(title, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;
  END IF;

  -- Create index on the search vector for quotes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'quotes' AND indexname = 'idx_quotes_search_vector') THEN
    CREATE INDEX idx_quotes_search_vector ON quotes USING GIN(search_vector);
  END IF;

  -- Create trigger to update search vector for quotes
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'quotes_search_vector_trigger'
  ) THEN
    CREATE OR REPLACE FUNCTION update_quotes_search_vector() RETURNS TRIGGER AS $$
    BEGIN
      NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.quote_number, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER quotes_search_vector_trigger
    BEFORE INSERT OR UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_quotes_search_vector();
  END IF;
END $$;
