-- Performance optimization indexes for Axion ERP (Safe version)
-- This script checks if indexes exist before creating them

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_created ON jobs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_due_date ON jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_name);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status ON jobs(tenant_id, status);

-- Quotes table indexes
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_created ON quotes(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_status ON quotes(tenant_id, status);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_tenant_name ON customers(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_created ON customers(tenant_id, created_at DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_status_created ON jobs(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_status_created ON quotes(tenant_id, status, created_at DESC);

-- Check existing indexes (optional - run this to see what indexes already exist)
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename IN ('jobs', 'quotes', 'customers', 'users')
ORDER BY 
    tablename, 
    indexname;
*/