-- Complete RBAC and test data setup (FIXED VERSION)
-- Run this entire script in your Supabase SQL Editor

-- STEP 1: Fix the role column safely (skip if role column already exists properly)
DO $$ 
BEGIN
    -- Only add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'operator' NOT NULL;
    END IF;
END $$;

-- Create index safely
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- STEP 2: Insert test tenant
INSERT INTO tenants (id, name, slug, created_at) 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Axion Manufacturing',
  'axion-manufacturing',
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- STEP 3: Insert test customers
INSERT INTO customers (id, tenant_id, name, email, phone, contact_person, created_at) VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'ABC Corporation',
  'orders@abccorp.com',
  '(555) 123-4567',
  'John Smith',
  NOW()
),
(
  'c2222222-2222-2222-2222-222222222222',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'XYZ Industries',
  'procurement@xyzind.com',
  '(555) 987-6543',
  'Sarah Johnson',
  NOW()
),
(
  'c3333333-3333-3333-3333-333333333333',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Tech Innovations LLC',
  'purchasing@techinnov.com',
  '(555) 456-7890',
  'Mike Wilson',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Insert test jobs
INSERT INTO jobs (id, tenant_id, job_number, customer_name, part_number, description, quantity, estimated_cost, actual_cost, status, due_date, created_at) VALUES
(
  'j1111111-1111-1111-1111-111111111111',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'JOB-2024-001',
  'ABC Corporation',
  'WGT-001-A',
  'Widget Assembly Production Run',
  100,
  4500.00,
  3800.00,
  'in_progress',
  CURRENT_DATE + INTERVAL '10 days',
  NOW() - INTERVAL '3 days'
),
(
  'j2222222-2222-2222-2222-222222222222',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'JOB-2024-002',
  'XYZ Industries',
  'CMP-002-B',
  'Component Manufacturing Batch',
  50,
  3200.00,
  0.00,
  'pending',
  CURRENT_DATE + INTERVAL '15 days',
  NOW() - INTERVAL '1 day'
),
(
  'j3333333-3333-3333-3333-333333333333',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'JOB-2024-003',
  'Tech Innovations LLC',
  'TECH-003-C',
  'Prototype Development',
  25,
  2800.00,
  2950.00,
  'completed',
  CURRENT_DATE - INTERVAL '5 days',
  NOW() - INTERVAL '20 days'
)
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Show summary
SELECT 'Setup Complete!' as status;

SELECT 
  'Customers' as table_name, 
  COUNT(*) as record_count 
FROM customers 
WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

UNION ALL

SELECT 
  'Jobs' as table_name, 
  COUNT(*) as record_count 
FROM jobs 
WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

ORDER BY table_name;