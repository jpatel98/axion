-- Clear all data from the database for a fresh start
-- Run this in Supabase SQL Editor

-- Clear in dependency order (children first, then parents)
DELETE FROM invitations;
DELETE FROM scheduled_operations;
DELETE FROM job_operations;
DELETE FROM jobs;
DELETE FROM quotes;
DELETE FROM customers;
DELETE FROM work_centers;
DELETE FROM workers;
DELETE FROM users;
DELETE FROM tenants;

-- Reset any sequences if they exist
-- (Most tables use UUIDs, but reset any that might use sequences)

SELECT 'All data cleared successfully! Database is now empty.' as status;

-- Show table counts to verify
SELECT 
  'tenants' as table_name, 
  COUNT(*) as remaining_records 
FROM tenants

UNION ALL

SELECT 
  'users' as table_name, 
  COUNT(*) as remaining_records 
FROM users

UNION ALL

SELECT 
  'customers' as table_name, 
  COUNT(*) as remaining_records 
FROM customers

UNION ALL

SELECT 
  'jobs' as table_name, 
  COUNT(*) as remaining_records 
FROM jobs

UNION ALL

SELECT 
  'invitations' as table_name, 
  COUNT(*) as remaining_records 
FROM invitations

ORDER BY table_name;