-- Additional Scheduling Tables for Axion ERP
-- Run this after work_centers table is created

-- 1. Job Operations table (break jobs into schedulable operations)
CREATE TABLE IF NOT EXISTS job_operations (
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
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, job_id, operation_number)
);

-- 2. Scheduled Operations table (the actual schedule)
CREATE TABLE IF NOT EXISTS scheduled_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    job_operation_id UUID NOT NULL REFERENCES job_operations(id) ON DELETE CASCADE,
    work_center_id UUID NOT NULL REFERENCES work_centers(id),
    worker_id UUID,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Workers table (optional, for assigning operators)
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    skills TEXT[],
    hourly_rate DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add scheduling fields to existing jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS scheduled_start_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_end_date DATE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_operations_tenant_id ON job_operations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_operations_job_id ON job_operations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_operations_work_center_id ON job_operations(work_center_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_operations_tenant_id ON scheduled_operations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_operations_work_center_id ON scheduled_operations(work_center_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_operations_worker_id ON scheduled_operations(worker_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_operations_dates ON scheduled_operations(scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_workers_tenant_id ON workers(tenant_id);

-- 6. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_job_operations_updated_at ON job_operations;
CREATE TRIGGER update_job_operations_updated_at 
    BEFORE UPDATE ON job_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_operations_updated_at ON scheduled_operations;
CREATE TRIGGER update_scheduled_operations_updated_at 
    BEFORE UPDATE ON scheduled_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workers_updated_at ON workers;
CREATE TRIGGER update_workers_updated_at 
    BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Disable RLS for now (same approach as work_centers)
ALTER TABLE job_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;