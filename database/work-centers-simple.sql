-- Work Centers Setup for Axion ERP (Simple Version)
-- Apply this script to your Supabase database via the SQL Editor

-- 1. Create the work_centers table
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    machine_type VARCHAR(100),
    capacity_hours_per_day DECIMAL(4,2) DEFAULT 8.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_centers_tenant_id ON work_centers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_centers_name ON work_centers(name);
CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers(is_active);

-- 3. Create or replace the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create the trigger
DROP TRIGGER IF EXISTS update_work_centers_updated_at ON work_centers;
CREATE TRIGGER update_work_centers_updated_at 
    BEFORE UPDATE ON work_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies - using basic authenticated user policy
-- (This allows all authenticated users to access work_centers)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON work_centers;
CREATE POLICY "Enable all access for authenticated users" ON work_centers
    FOR ALL USING (auth.role() = 'authenticated');