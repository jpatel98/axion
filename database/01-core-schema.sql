-- Axion Manufacturing ERP Database Schema
-- Complete core database structure with all essential tables
-- Run this first for any new database setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('operator', 'scheduler', 'manager', 'admin');
    END IF;
END $$;

-- Tenants table (multi-tenant support)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    clerk_org_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role user_role DEFAULT 'operator' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_per_tenant UNIQUE (tenant_id, email)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    contact_person VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Centers table
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 1,
    hourly_rate DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table (using TEXT for due_date to avoid timezone issues)
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255),
    part_number VARCHAR(255),
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    due_date TEXT, -- Format: YYYY-MM-DD
    priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    estimated_duration INTEGER, -- in hours
    auto_scheduled BOOLEAN DEFAULT false,
    scheduling_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_job_number_per_tenant UNIQUE (tenant_id, job_number)
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quote_number VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    valid_until TEXT, -- Format: YYYY-MM-DD
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_quote_number_per_tenant UNIQUE (tenant_id, quote_number)
);

-- Quote Line Items table
CREATE TABLE IF NOT EXISTS quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Operations table (for scheduling integration)
CREATE TABLE IF NOT EXISTS job_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    operation_name VARCHAR(255) NOT NULL,
    sequence_order INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL, -- in minutes
    work_center_id UUID REFERENCES work_centers(id),
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Operations table
CREATE TABLE IF NOT EXISTS scheduled_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_operation_id UUID REFERENCES job_operations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    work_center_id UUID REFERENCES work_centers(id),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_pending_invitation UNIQUE (tenant_id, email, status)
);

-- System Events table (for integration tracking)
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(tenant_id, name);

CREATE INDEX IF NOT EXISTS idx_work_centers_tenant ON work_centers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers(tenant_id, active);

CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_due_date ON jobs(due_date);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotes_tenant ON quotes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote ON quote_line_items(quote_id);

CREATE INDEX IF NOT EXISTS idx_job_operations_job ON job_operations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_operations_work_center ON job_operations(work_center_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_operations_tenant ON scheduled_operations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_operations_work_center ON scheduled_operations(work_center_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_operations_dates ON scheduled_operations(scheduled_start, scheduled_end);

CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON user_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON user_invitations(email, status);

CREATE INDEX IF NOT EXISTS idx_system_events_tenant ON system_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_entity ON system_events(entity_type, entity_id);

-- Add useful triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('tenants', 'users', 'customers', 'work_centers', 'jobs', 'quotes', 'job_operations', 'scheduled_operations')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- Event logging trigger for job status changes
CREATE OR REPLACE FUNCTION log_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO system_events (event_type, entity_type, entity_id, user_id, tenant_id, payload)
        VALUES (
            'job.status_changed',
            'job',
            NEW.id,
            NEW.updated_at::text::uuid, -- This would need to be set properly in application
            NEW.tenant_id,
            json_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'job_number', NEW.job_number
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_job_status_changes
    AFTER UPDATE OF status ON jobs
    FOR EACH ROW EXECUTE FUNCTION log_job_status_change();

-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be defined in 02-security-policies.sql