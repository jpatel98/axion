-- Clean schema setup for RBAC system
-- Since there's no user data, we can start fresh

-- 1. Drop existing role column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- 2. Create the role enum type
CREATE TYPE user_role AS ENUM ('manager', 'operator');

-- 3. Add the role column with proper enum type
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'operator' NOT NULL;

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. Check that the table is ready
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- 6. Show current table structure  
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;