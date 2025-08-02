-- Setup RBAC system for manufacturing ERP
-- This migration creates the necessary tables and roles

-- Create role enum type
CREATE TYPE user_role AS ENUM ('manager', 'operator');

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  clerk_org_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'operator' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Create customers table if it doesn't exist (for the existing app functionality)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  contact_person TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quote_line_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS quote_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  job_number TEXT NOT NULL,
  customer_name TEXT,
  part_number TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  email_notifications BOOLEAN DEFAULT true,
  job_completion_notifications BOOLEAN DEFAULT true,
  inventory_alerts BOOLEAN DEFAULT true,
  quote_reminders BOOLEAN DEFAULT true,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  number_format TEXT DEFAULT 'en-US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints
ALTER TABLE users ADD CONSTRAINT unique_tenant_email UNIQUE (tenant_id, email);
ALTER TABLE quotes ADD CONSTRAINT unique_tenant_quote_number UNIQUE (tenant_id, quote_number);
ALTER TABLE jobs ADD CONSTRAINT unique_tenant_job_number UNIQUE (tenant_id, job_number);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create RLS policies for users
CREATE POLICY "Users can view users in their tenant" ON users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Managers can manage users in their tenant" ON users
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND role = 'manager'
    )
  );

-- Create RLS policies for other tables (tenant-based access)
CREATE POLICY "Tenant access policy" ON customers
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Tenant access policy" ON quotes
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Tenant access policy" ON quote_line_items
  FOR ALL USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users 
        WHERE clerk_user_id = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Tenant access policy" ON jobs
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Tenant access policy" ON settings
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM users 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM users 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM users 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;