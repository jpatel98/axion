-- Seed test data for manufacturing ERP
-- Run this after the clean-schema-setup.sql

-- Insert test tenant (your company)
INSERT INTO tenants (id, name, slug, created_at) 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Axion Manufacturing',
  'axion-manufacturing',
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Insert test customers
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
);

-- Insert test quotes
INSERT INTO quotes (id, tenant_id, customer_id, quote_number, title, description, status, subtotal, tax_rate, tax_amount, total, valid_until, created_at) VALUES
(
  'q1111111-1111-1111-1111-111111111111',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'c1111111-1111-1111-1111-111111111111',
  'QUO-2024-001',
  'Widget Assembly Project',
  'Custom widget assembly with precision machining',
  'sent',
  5000.00,
  0.0875,
  437.50,
  5437.50,
  CURRENT_DATE + INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
),
(
  'q2222222-2222-2222-2222-222222222222',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'c2222222-2222-2222-2222-222222222222',
  'QUO-2024-002',
  'Component Manufacturing',
  'Batch production of precision components',
  'draft',
  3200.00,
  0.0875,
  280.00,
  3480.00,
  CURRENT_DATE + INTERVAL '45 days',
  NOW() - INTERVAL '2 days'
);

-- Insert quote line items
INSERT INTO quote_line_items (quote_id, item_number, description, quantity, unit_price, created_at) VALUES
(
  'q1111111-1111-1111-1111-111111111111',
  1,
  'Widget Assembly - Model A',
  100,
  45.00,
  NOW() - INTERVAL '5 days'
),
(
  'q1111111-1111-1111-1111-111111111111',
  2,
  'Precision Machining Service',
  10,
  50.00,
  NOW() - INTERVAL '5 days'
),
(
  'q2222222-2222-2222-2222-222222222222',
  1,
  'Component Type B - Batch 100',
  50,
  64.00,
  NOW() - INTERVAL '2 days'
);

-- Insert test jobs
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
);

-- Insert company settings
INSERT INTO settings (tenant_id, company_name, contact_email, phone, address, currency, timezone, created_at) VALUES
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Axion Manufacturing Inc.',
  'info@axionmfg.com',
  '(555) 100-2000',
  '123 Industrial Way, Manufacturing City, MC 12345',
  'USD',
  'America/New_York',
  NOW()
) ON CONFLICT (tenant_id) DO NOTHING;

-- Show summary of inserted data
SELECT 
  'Customers' as table_name, 
  COUNT(*) as record_count 
FROM customers 
WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

UNION ALL

SELECT 
  'Quotes' as table_name, 
  COUNT(*) as record_count 
FROM quotes 
WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

UNION ALL

SELECT 
  'Jobs' as table_name, 
  COUNT(*) as record_count 
FROM jobs 
WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

ORDER BY table_name;