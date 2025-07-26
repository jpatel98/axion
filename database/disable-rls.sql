-- Run this in your Supabase SQL Editor to fix the RLS error

-- Disable RLS for all tables temporarily
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
DROP POLICY IF EXISTS "Allow tenant creation during user sync" ON tenants;
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
DROP POLICY IF EXISTS "Users can view jobs in their tenant" ON jobs;
DROP POLICY IF EXISTS "Users can insert jobs in their tenant" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs in their tenant" ON jobs;
DROP POLICY IF EXISTS "Users can delete jobs in their tenant" ON jobs;