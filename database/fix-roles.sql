-- Quick fix for RBAC role issues
-- Run this in your Supabase SQL Editor

-- 1. Create the role enum type
CREATE TYPE user_role AS ENUM ('manager', 'operator');

-- 2. Add a new role column with the enum type (since we can't directly alter the existing one)
ALTER TABLE users ADD COLUMN role_new user_role DEFAULT 'operator';

-- 3. Update the new column based on existing role values
UPDATE users SET role_new = CASE 
  WHEN role = 'admin' THEN 'manager'::user_role
  WHEN role = 'manager' THEN 'manager'::user_role
  WHEN role = 'operator' THEN 'operator'::user_role
  ELSE 'operator'::user_role
END;

-- 4. Drop the old role column and rename the new one
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_new TO role;

-- 5. Make sure role is not null
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- 6. Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 7. If you need to manually fix any user roles, use this format:
-- UPDATE users SET role = 'manager' WHERE email = 'your-email@example.com';

-- 8. Check current users and their roles
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at;