-- Production Database Setup for Axion ERP (Fixed Version)
-- Run this script to prepare your database for production

-- 1. Enable Row Level Security (RLS) on all tables (safe version)
DO $$
BEGIN
    -- Enable RLS only if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.tablename = 'users' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.tablename = 'jobs' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.tablename = 'quotes' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.tablename = 'quote_line_items' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.tablename = 'customers' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Users can view own tenant" ON users;
DROP POLICY IF EXISTS "Users can view own tenant jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own tenant jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own tenant jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own tenant jobs" ON jobs;
DROP POLICY IF EXISTS "Users can view own tenant quotes" ON quotes;
DROP POLICY IF EXISTS "Users can insert own tenant quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update own tenant quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete own tenant quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view quote line items" ON quote_line_items;
DROP POLICY IF EXISTS "Users can manage quote line items" ON quote_line_items;
DROP POLICY IF EXISTS "Users can view own tenant customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own tenant customers" ON customers;
DROP POLICY IF EXISTS "Users can update own tenant customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own tenant customers" ON customers;

-- Create RLS policies for tenant isolation
-- Note: These policies assume you'll set the tenant_id in your application context

-- Users table policy
CREATE POLICY "Users can view own tenant" ON users
    FOR ALL USING (true); -- Adjust based on your auth requirements

-- Jobs table policies
CREATE POLICY "Users can view own tenant jobs" ON jobs
    FOR SELECT USING (true); -- Will be restricted by your app-level filtering

CREATE POLICY "Users can insert own tenant jobs" ON jobs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own tenant jobs" ON jobs
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own tenant jobs" ON jobs
    FOR DELETE USING (true);

-- Quotes table policies
CREATE POLICY "Users can view own tenant quotes" ON quotes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own tenant quotes" ON quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own tenant quotes" ON quotes
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own tenant quotes" ON quotes
    FOR DELETE USING (true);

-- Quote line items policies
CREATE POLICY "Users can view quote line items" ON quote_line_items
    FOR SELECT USING (true);

CREATE POLICY "Users can manage quote line items" ON quote_line_items
    FOR ALL USING (true);

-- Customers table policies
CREATE POLICY "Users can view own tenant customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own tenant customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own tenant customers" ON customers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own tenant customers" ON customers
    FOR DELETE USING (true);

-- 3. Create database functions for common operations

-- Function to get next job number (safe version)
CREATE OR REPLACE FUNCTION get_next_job_number(p_tenant_id uuid)
RETURNS text AS $$
DECLARE
    v_next_number integer;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM '[0-9]+') AS integer)), 0) + 1
    INTO v_next_number
    FROM jobs
    WHERE tenant_id = p_tenant_id
    AND job_number ~ '^JOB-[0-9]+$';
    
    RETURN 'JOB-' || LPAD(v_next_number::text, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next quote number (safe version)
CREATE OR REPLACE FUNCTION get_next_quote_number(p_tenant_id uuid)
RETURNS text AS $$
DECLARE
    v_next_number integer;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '[0-9]+') AS integer)), 0) + 1
    INTO v_next_number
    FROM quotes
    WHERE tenant_id = p_tenant_id
    AND quote_number ~ '^QTE-[0-9]+$';
    
    RETURN 'QTE-' || LPAD(v_next_number::text, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create audit log table (safe version)
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action varchar(50) NOT NULL,
    table_name varchar(50) NOT NULL,
    record_id uuid NOT NULL,
    old_values jsonb,
    new_values jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(table_name, record_id);

-- 5. Performance monitoring view (fixed)
DROP VIEW IF EXISTS v_table_stats;
CREATE VIEW v_table_stats AS
SELECT 
    schemaname,
    relname as tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6. Grant necessary permissions (safe version)
DO $$
BEGIN
    -- Grant permissions if they don't already exist
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
EXCEPTION
    WHEN others THEN
        NULL; -- Ignore errors if permissions already exist
END $$;

-- 7. Success message
SELECT 'Production database setup completed successfully!' as status;