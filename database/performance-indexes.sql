-- Performance optimization indexes for Axion ERP
-- Run this after the main schema setup

-- Jobs table indexes
CREATE INDEX idx_jobs_tenant_created ON jobs(tenant_id, created_at DESC);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_due_date ON jobs(due_date);
CREATE INDEX idx_jobs_customer ON jobs(customer_name);
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);

-- Quotes table indexes
CREATE INDEX idx_quotes_tenant_created ON quotes(tenant_id, created_at DESC);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_tenant_status ON quotes(tenant_id, status);

-- Customers table indexes
CREATE INDEX idx_customers_tenant_name ON customers(tenant_id, name);
CREATE INDEX idx_customers_tenant_created ON customers(tenant_id, created_at DESC);

-- Users table indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_jobs_tenant_status_created ON jobs(tenant_id, status, created_at DESC);
CREATE INDEX idx_quotes_tenant_status_created ON quotes(tenant_id, status, created_at DESC);

-- Full text search indexes (if using PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', 
--   coalesce(job_number, '') || ' ' || 
--   coalesce(customer_name, '') || ' ' || 
--   coalesce(part_number, '') || ' ' || 
--   coalesce(description, '')
-- ));