-- Test Data Setup for Axion ERP
-- Run this after 01-core-schema.sql and 02-security-policies.sql for development/testing

-- Insert test tenant
INSERT INTO tenants (id, name, slug, created_at) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Axion Manufacturing',
    'axion-manufacturing',
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Insert test customers
INSERT INTO customers (id, tenant_id, name, email, phone, contact_person, address_line1, city, state, zip_code, created_at) VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Acme Manufacturing',
    'orders@acme-mfg.com',
    '555-0101',
    'John Smith',
    '123 Industrial Blvd',
    'Detroit',
    'MI',
    '48201',
    NOW() - INTERVAL '30 days'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Precision Parts Co',
    'procurement@precisionparts.com',
    '555-0102',
    'Sarah Johnson',
    '456 Machine Ave',
    'Chicago',
    'IL',
    '60601',
    NOW() - INTERVAL '45 days'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Industrial Solutions Ltd',
    'orders@industrialsolutions.com',
    '555-0103',
    'Mike Davis',
    '789 Factory St',
    'Milwaukee',
    'WI',
    '53201',
    NOW() - INTERVAL '60 days'
);

-- Insert test work centers
INSERT INTO work_centers (id, tenant_id, name, description, capacity, hourly_rate, created_at) VALUES
(
    'w1111111-1111-1111-1111-111111111111',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'CNC Machining',
    'Computer-controlled machining center for precision parts',
    2,
    85.00,
    NOW() - INTERVAL '90 days'
),
(
    'w2222222-2222-2222-2222-222222222222',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Welding Station',
    'MIG/TIG welding for metal fabrication',
    3,
    65.00,
    NOW() - INTERVAL '90 days'
),
(
    'w3333333-3333-3333-3333-333333333333',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Assembly Line',
    'Final assembly and quality control',
    4,
    45.00,
    NOW() - INTERVAL '90 days'
),
(
    'w4444444-4444-4444-4444-444444444444',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Surface Finishing',
    'Painting, coating, and surface treatment',
    2,
    55.00,
    NOW() - INTERVAL '90 days'
);

-- Insert test quotes
INSERT INTO quotes (id, tenant_id, quote_number, customer_id, title, description, status, subtotal, tax_rate, tax_amount, total, valid_until, created_at) VALUES
(
    'q1111111-1111-1111-1111-111111111111',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'QUO-001',
    'c1111111-1111-1111-1111-111111111111',
    'Custom Bracket Assembly',
    'Precision machined aluminum brackets for industrial equipment',
    'approved',
    2500.00,
    0.0875,
    218.75,
    2718.75,
    '2025-09-15',
    NOW() - INTERVAL '25 days'
),
(
    'q2222222-2222-2222-2222-222222222222',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'QUO-002',
    'c2222222-2222-2222-2222-222222222222',
    'Steel Rod Manufacturing',
    '10x Steel rods with custom threading and surface treatment',
    'sent',
    1800.00,
    0.0875,
    157.50,
    1957.50,
    '2025-08-30',
    NOW() - INTERVAL '15 days'
);

-- Insert quote line items
INSERT INTO quote_line_items (quote_id, description, quantity, unit_price, line_total) VALUES
('q1111111-1111-1111-1111-111111111111', 'CNC Machining - Aluminum Bracket', 50, 35.00, 1750.00),
('q1111111-1111-1111-1111-111111111111', 'Welding and Assembly', 50, 12.00, 600.00),
('q1111111-1111-1111-1111-111111111111', 'Surface Finishing - Anodizing', 50, 3.00, 150.00),
('q2222222-2222-2222-2222-222222222222', 'Steel Rod Base Material', 10, 120.00, 1200.00),
('q2222222-2222-2222-2222-222222222222', 'Custom Threading Operation', 10, 45.00, 450.00),
('q2222222-2222-2222-2222-222222222222', 'Surface Treatment', 10, 15.00, 150.00);

-- Insert test jobs (including one from quote conversion)
INSERT INTO jobs (id, tenant_id, job_number, customer_name, part_number, description, quantity, estimated_cost, actual_cost, status, due_date, priority_level, created_at, updated_at) VALUES
(
    'j1111111-1111-1111-1111-111111111111',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-001',
    'Acme Manufacturing',
    'BRKT-2024-001',
    'Custom Bracket Assembly - Precision machined aluminum brackets',
    50,
    2718.75,
    1850.25,
    'completed',
    '2025-08-15',
    4,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '2 days'
),
(
    'j2222222-2222-2222-2222-222222222222',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-002',
    'Precision Parts Co',
    'GEAR-2024-002',
    'Industrial Gear Set - High precision gears for manufacturing equipment',
    25,
    3200.00,
    1200.00,
    'in_progress',
    '2025-08-25',
    5,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 hour'
),
(
    'j3333333-3333-3333-3333-333333333333',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-003',
    'Industrial Solutions Ltd',
    'PLATE-2024-003',
    'Heavy Duty Mounting Plates - Reinforced steel plates for industrial mounting',
    100,
    4500.00,
    0.00,
    'pending',
    '2025-09-10',
    3,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    'j4444444-4444-4444-4444-444444444444',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-004',
    'Acme Manufacturing',
    'SHFT-2024-004',
    'Drive Shaft Assembly - Custom drive shafts with precision balancing',
    15,
    2800.00,
    350.00,
    'in_progress',
    '2025-08-20',
    4,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '30 minutes'
);

-- Insert job operations for scheduling
INSERT INTO job_operations (job_id, operation_name, sequence_order, estimated_duration, work_center_id, status) VALUES
-- JOB-002 operations (in progress)
('j2222222-2222-2222-2222-222222222222', 'Material Preparation', 1, 120, 'w1111111-1111-1111-1111-111111111111', 'completed'),
('j2222222-2222-2222-2222-222222222222', 'CNC Machining - Rough', 2, 480, 'w1111111-1111-1111-1111-111111111111', 'in_progress'),
('j2222222-2222-2222-2222-222222222222', 'CNC Machining - Finish', 3, 360, 'w1111111-1111-1111-1111-111111111111', 'pending'),
('j2222222-2222-2222-2222-222222222222', 'Quality Control', 4, 60, 'w3333333-3333-3333-3333-333333333333', 'pending'),

-- JOB-003 operations (pending)
('j3333333-3333-3333-3333-333333333333', 'Material Cutting', 1, 240, 'w1111111-1111-1111-1111-111111111111', 'pending'),
('j3333333-3333-3333-3333-333333333333', 'Welding', 2, 600, 'w2222222-2222-2222-2222-222222222222', 'pending'),
('j3333333-3333-3333-3333-333333333333', 'Surface Treatment', 3, 180, 'w4444444-4444-4444-4444-444444444444', 'pending'),
('j3333333-3333-3333-3333-333333333333', 'Final Assembly', 4, 300, 'w3333333-3333-3333-3333-333333333333', 'pending'),

-- JOB-004 operations (in progress)
('j4444444-4444-4444-4444-444444444444', 'Material Preparation', 1, 90, 'w1111111-1111-1111-1111-111111111111', 'completed'),
('j4444444-4444-4444-4444-444444444444', 'Precision Machining', 2, 720, 'w1111111-1111-1111-1111-111111111111', 'in_progress'),
('j4444444-4444-4444-4444-444444444444', 'Balancing & Testing', 3, 240, 'w3333333-3333-3333-3333-333333333333', 'pending'),
('j4444444-4444-4444-4444-444444444444', 'Quality Inspection', 4, 120, 'w3333333-3333-3333-3333-333333333333', 'pending');

-- Insert some scheduled operations for calendar
INSERT INTO scheduled_operations (tenant_id, title, description, work_center_id, scheduled_start, scheduled_end, status, created_at) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-002 - CNC Machining Finish',
    'Final precision machining for gear set',
    'w1111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '8 hours',
    'scheduled',
    NOW()
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-003 - Material Cutting',
    'Steel plate cutting and preparation',
    'w1111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 4 hours',
    'scheduled',
    NOW()
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'JOB-004 - Balancing & Testing', 
    'Drive shaft precision balancing',
    'w3333333-3333-3333-3333-333333333333',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days 4 hours',
    'scheduled',
    NOW()
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Maintenance - CNC Calibration',
    'Weekly calibration and maintenance',
    'w1111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days 2 hours',
    'scheduled',
    NOW()
);

-- Insert some system events for testing
INSERT INTO system_events (event_type, entity_type, entity_id, tenant_id, payload) VALUES
('job.status_changed', 'job', 'j2222222-2222-2222-2222-222222222222', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
 '{"old_status": "pending", "new_status": "in_progress", "job_number": "JOB-002"}'::jsonb),
('job.created', 'job', 'j4444444-4444-4444-4444-444444444444', 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
 '{"job_number": "JOB-004", "customer": "Acme Manufacturing"}'::jsonb),
('quote.approved', 'quote', 'q1111111-1111-1111-1111-111111111111', 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
 '{"quote_number": "QUO-001", "total": 2718.75}'::jsonb);

-- Success message
SELECT 'Test data inserted successfully! You now have:' as message
UNION ALL
SELECT '- 1 tenant (Axion Manufacturing)' 
UNION ALL
SELECT '- 3 customers with contact information'
UNION ALL
SELECT '- 4 work centers (CNC, Welding, Assembly, Finishing)'
UNION ALL  
SELECT '- 2 quotes (1 approved, 1 sent)'
UNION ALL
SELECT '- 4 jobs in various states (1 completed, 2 in progress, 1 pending)'
UNION ALL
SELECT '- Job operations for scheduling integration'
UNION ALL
SELECT '- Scheduled operations for calendar display'
UNION ALL
SELECT '- Sample system events for testing';