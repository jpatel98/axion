-- Production Database Setup for Axion ERP
-- Run this script to prepare your database for production

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for tenant isolation
-- Users can only see their own tenant's data

-- Users table policy
CREATE POLICY "Users can view own tenant" ON users
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Jobs table policies
CREATE POLICY "Users can view own tenant jobs" ON jobs
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant jobs" ON jobs
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can update own tenant jobs" ON jobs
    FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant jobs" ON jobs
    FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Quotes table policies
CREATE POLICY "Users can view own tenant quotes" ON quotes
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant quotes" ON quotes
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can update own tenant quotes" ON quotes
    FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant quotes" ON quotes
    FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Quote line items policies (based on quote ownership)
CREATE POLICY "Users can view quote line items" ON quote_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_line_items.quote_id 
            AND quotes.tenant_id = current_setting('app.current_tenant_id')::uuid
        )
    );

CREATE POLICY "Users can manage quote line items" ON quote_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_line_items.quote_id 
            AND quotes.tenant_id = current_setting('app.current_tenant_id')::uuid
        )
    );

-- Customers table policies
CREATE POLICY "Users can view own tenant customers" ON customers
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can insert own tenant customers" ON customers
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can update own tenant customers" ON customers
    FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can delete own tenant customers" ON customers
    FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- 3. Create database functions for common operations

-- Function to get next job number
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
$$ LANGUAGE plpgsql;

-- Function to get next quote number
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
$$ LANGUAGE plpgsql;

-- 4. Create audit log table
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

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_record ON audit_logs(table_name, record_id);

-- 5. Create backup policy (for Supabase)
-- This is a comment as it needs to be configured in Supabase dashboard
-- Enable Point-in-Time Recovery (PITR) for production database

-- 6. Performance monitoring view
CREATE OR REPLACE VIEW v_table_stats AS
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;