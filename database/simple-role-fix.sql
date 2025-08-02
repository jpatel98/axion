-- Simple role column fix - just what we need for RBAC
-- Run this in Supabase SQL Editor

-- Drop and recreate the role column with existing enum
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'operator' NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Done!
SELECT 'Role column fixed successfully!' as status;