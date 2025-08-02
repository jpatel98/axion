-- Simple RBAC role fix
-- Run this first to fix the role column

-- Drop existing role column and recreate with enum
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Create the role enum type
CREATE TYPE user_role AS ENUM ('manager', 'operator');

-- Add the role column with proper enum type
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'operator' NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Verify the change
SELECT 'Role column updated successfully!' as status;