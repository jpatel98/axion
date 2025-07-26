-- Axion Manufacturing ERP Database Schema
-- Phase 1: Core Tables (tenants, users, jobs)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table (multi-tenant support)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    clerk_org_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table (core entity for manufacturing)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255),
    part_number VARCHAR(100),
    description TEXT,
    quantity INTEGER DEFAULT 1,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, shipped
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, job_number)
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_jobs_tenant_id ON jobs(tenant_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Row Level Security (RLS) policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Function to get current user's tenant_id from Clerk JWT
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    user_id TEXT;
    tenant_uuid UUID;
BEGIN
    -- Get the user ID from the JWT token
    user_id := auth.jwt() ->> 'sub';
    
    IF user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get the tenant_id for this user
    SELECT tenant_id INTO tenant_uuid
    FROM users 
    WHERE clerk_user_id = user_id
    LIMIT 1;
    
    RETURN tenant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current clerk user ID
CREATE OR REPLACE FUNCTION get_current_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN auth.jwt() ->> 'sub';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for tenants table
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (id = get_current_tenant_id());

CREATE POLICY "Allow tenant creation during user sync" ON tenants
    FOR INSERT WITH CHECK (true); -- Allow creation but RLS will still protect reads

-- RLS Policies for users table
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (clerk_user_id = get_current_clerk_user_id());

CREATE POLICY "Users can insert themselves" ON users
    FOR INSERT WITH CHECK (clerk_user_id = get_current_clerk_user_id());

-- RLS Policies for jobs table
CREATE POLICY "Users can view jobs in their tenant" ON jobs
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can insert jobs in their tenant" ON jobs
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update jobs in their tenant" ON jobs
    FOR UPDATE USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can delete jobs in their tenant" ON jobs
    FOR DELETE USING (tenant_id = get_current_tenant_id());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create tenant and user from Clerk webhook
CREATE OR REPLACE FUNCTION handle_clerk_user_created()
RETURNS TRIGGER AS $$
DECLARE
    tenant_id_var UUID;
BEGIN
    -- Check if organization exists, create if not
    SELECT id INTO tenant_id_var 
    FROM tenants 
    WHERE clerk_org_id = NEW.clerk_org_id;
    
    IF tenant_id_var IS NULL THEN
        INSERT INTO tenants (name, slug, clerk_org_id)
        VALUES (
            COALESCE(NEW.organization_name, 'Default Organization'),
            COALESCE(NEW.organization_slug, 'default-org'),
            NEW.clerk_org_id
        )
        RETURNING id INTO tenant_id_var;
    END IF;
    
    -- Set tenant_id for the new user
    NEW.tenant_id = tenant_id_var;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;