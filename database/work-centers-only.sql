-- Work Centers Setup for Axion ERP
-- Apply this script to your Supabase database via the SQL Editor

-- 1. Create the work_centers table
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    machine_type VARCHAR(100), -- CNC, VMC, Lathe, Mill, etc.
    capacity_hours_per_day DECIMAL(4,2) DEFAULT 8.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_centers_tenant_id ON work_centers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_centers_name ON work_centers(name);
CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers(is_active);

-- 3. Add updated_at trigger (requires the trigger function to exist)
DO $$
BEGIN
    -- Check if the trigger function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Create the trigger
        DROP TRIGGER IF EXISTS update_work_centers_updated_at ON work_centers;
        CREATE TRIGGER update_work_centers_updated_at 
            BEFORE UPDATE ON work_centers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ELSE
        RAISE NOTICE 'Trigger function update_updated_at_column does not exist. Creating manually...';
        
        -- Create the trigger function
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Now create the trigger
        DROP TRIGGER IF EXISTS update_work_centers_updated_at ON work_centers;
        CREATE TRIGGER update_work_centers_updated_at 
            BEFORE UPDATE ON work_centers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- 4. Enable Row Level Security
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for work_centers
-- Note: Assumes you have a get_current_tenant_id() function
-- If not, you may need to adjust these policies based on your auth setup

DO $$
BEGIN
    -- Check if the function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_tenant_id') THEN
        -- Create policies using the function
        DROP POLICY IF EXISTS "Users can view work centers in their tenant" ON work_centers;
        CREATE POLICY "Users can view work centers in their tenant" ON work_centers
            FOR SELECT USING (tenant_id = get_current_tenant_id());

        DROP POLICY IF EXISTS "Users can insert work centers in their tenant" ON work_centers;
        CREATE POLICY "Users can insert work centers in their tenant" ON work_centers
            FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

        DROP POLICY IF EXISTS "Users can update work centers in their tenant" ON work_centers;
        CREATE POLICY "Users can update work centers in their tenant" ON work_centers
            FOR UPDATE USING (tenant_id = get_current_tenant_id());

        DROP POLICY IF EXISTS "Users can delete work centers in their tenant" ON work_centers;
        CREATE POLICY "Users can delete work centers in their tenant" ON work_centers
            FOR DELETE USING (tenant_id = get_current_tenant_id());
    ELSE
        RAISE NOTICE 'Function get_current_tenant_id() does not exist. You will need to create RLS policies manually.';
        
        -- Alternative: Disable RLS for now (less secure but functional)
        -- ALTER TABLE work_centers DISABLE ROW LEVEL SECURITY;
        
        -- Or create basic policies that allow all authenticated users
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON work_centers;
        CREATE POLICY "Enable all access for authenticated users" ON work_centers
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END$$;

-- 6. Insert some sample data (optional - remove if you don't want sample data)
INSERT INTO work_centers (tenant_id, name, description, machine_type, capacity_hours_per_day, is_active)
SELECT 
    t.id as tenant_id,
    'CNC Mill #1' as name,
    'Primary CNC milling machine' as description,
    'CNC Milling' as machine_type,
    8.0 as capacity_hours_per_day,
    true as is_active
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM work_centers wc WHERE wc.tenant_id = t.id AND wc.name = 'CNC Mill #1'
)
LIMIT 1;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Work centers table setup completed successfully!';
    RAISE NOTICE 'You can now use the Work Centers feature in your Axion ERP application.';
END$$;