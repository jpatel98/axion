-- Production Scheduling Schema Extension
-- Run after main schema.sql and phase2-schema.sql

-- Work Centers/Machines table
CREATE TABLE work_centers (
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

-- Workers/Operators table
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    skills TEXT[], -- Array of skills like ['CNC', 'VMC', 'Setup']
    hourly_rate DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Operations (break jobs into schedulable operations)
CREATE TABLE job_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    operation_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_hours DECIMAL(6,2) NOT NULL,
    actual_hours DECIMAL(6,2) DEFAULT 0,
    work_center_id UUID REFERENCES work_centers(id),
    required_skills TEXT[],
    status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, in_progress, completed
    priority INTEGER DEFAULT 1, -- 1 = normal, 2 = high, 3 = urgent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, job_id, operation_number)
);

-- Scheduled Operations (the actual schedule)
CREATE TABLE scheduled_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_operation_id UUID NOT NULL REFERENCES job_operations(id) ON DELETE CASCADE,
    work_center_id UUID NOT NULL REFERENCES work_centers(id),
    worker_id UUID REFERENCES workers(id),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add scheduling fields to jobs table
ALTER TABLE jobs 
ADD COLUMN scheduled_start_date DATE,
ADD COLUMN scheduled_end_date DATE,
ADD COLUMN priority INTEGER DEFAULT 1;

-- Create indexes for performance
CREATE INDEX idx_work_centers_tenant_id ON work_centers(tenant_id);
CREATE INDEX idx_workers_tenant_id ON workers(tenant_id);
CREATE INDEX idx_job_operations_tenant_id ON job_operations(tenant_id);
CREATE INDEX idx_job_operations_job_id ON job_operations(job_id);
CREATE INDEX idx_job_operations_work_center_id ON job_operations(work_center_id);
CREATE INDEX idx_scheduled_operations_tenant_id ON scheduled_operations(tenant_id);
CREATE INDEX idx_scheduled_operations_work_center_id ON scheduled_operations(work_center_id);
CREATE INDEX idx_scheduled_operations_worker_id ON scheduled_operations(worker_id);
CREATE INDEX idx_scheduled_operations_dates ON scheduled_operations(scheduled_start, scheduled_end);

-- Add updated_at triggers
CREATE TRIGGER update_work_centers_updated_at BEFORE UPDATE ON work_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_operations_updated_at BEFORE UPDATE ON job_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_operations_updated_at BEFORE UPDATE ON scheduled_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_operations ENABLE ROW LEVEL SECURITY;

-- Work Centers policies
CREATE POLICY "Users can view work centers in their tenant" ON work_centers
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can insert work centers in their tenant" ON work_centers
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update work centers in their tenant" ON work_centers
    FOR UPDATE USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can delete work centers in their tenant" ON work_centers
    FOR DELETE USING (tenant_id = get_current_tenant_id());

-- Workers policies
CREATE POLICY "Users can view workers in their tenant" ON workers
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can insert workers in their tenant" ON workers
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update workers in their tenant" ON workers
    FOR UPDATE USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can delete workers in their tenant" ON workers
    FOR DELETE USING (tenant_id = get_current_tenant_id());

-- Job Operations policies
CREATE POLICY "Users can view job operations in their tenant" ON job_operations
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can insert job operations in their tenant" ON job_operations
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update job operations in their tenant" ON job_operations
    FOR UPDATE USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can delete job operations in their tenant" ON job_operations
    FOR DELETE USING (tenant_id = get_current_tenant_id());

-- Scheduled Operations policies
CREATE POLICY "Users can view scheduled operations in their tenant" ON scheduled_operations
    FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can insert scheduled operations in their tenant" ON scheduled_operations
    FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update scheduled operations in their tenant" ON scheduled_operations
    FOR UPDATE USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can delete scheduled operations in their tenant" ON scheduled_operations
    FOR DELETE USING (tenant_id = get_current_tenant_id());