# RBAC System Setup Guide

## Quick Fix for Current Issues

### Step 1: Fix Database Schema
1. Go to your Supabase dashboard: https://xngvzozmxzxobkbkixtm.supabase.co
2. Navigate to **SQL Editor**
3. Run the SQL from `fix-roles.sql` file

### Step 2: Test User Sync
1. Visit `http://localhost:3000/debug-sync` in your browser
2. Click **"Force Sync"** to properly sync your user
3. Verify your role is set correctly

### Step 3: Test RBAC System
- If you're a **Manager**: You should see the main dashboard
- If you're an **Operator**: You should be redirected to `/dashboard/operator`

## What's Working Now

✅ **Role-Based Access Control**
- Two roles: Manager and Operator  
- Different dashboard interfaces
- Permission-based component rendering

✅ **User Sync System**  
- Automatic user creation from Clerk
- Role assignment (first user becomes manager)
- Debug tools for troubleshooting

✅ **Dashboard Routing**
- Managers → `/dashboard` (full analytics, user management)
- Operators → `/dashboard/operator` (production-focused)

## Troubleshooting

### Issue: "User not found" errors
**Solution**: Visit `/debug-sync` and click "Force Sync"

### Issue: Wrong role assigned  
**Solution**: Run this SQL in Supabase:
```sql
UPDATE users SET role = 'manager' WHERE email = 'your-email@example.com';
```

### Issue: Still seeing role fetch errors
**Solution**: 
1. Check that the enum type was created properly
2. Verify user exists with correct role in database
3. Clear browser cache and retry

## Next Steps

Once RBAC is working:
1. **Add more operators** - Create additional users with operator role
2. **Shop floor features** - Add time tracking for operators  
3. **Permissions refinement** - Add more granular permissions as needed
4. **Production deployment** - Apply same migration to production database

## File Structure Created

```
src/
├── lib/types/roles.ts          # Role definitions and permissions
├── hooks/useUserRole.ts        # User role state management  
├── hooks/usePermissions.ts     # Permission checking hooks
├── components/rbac/            # RBAC components
│   ├── PermissionGate.tsx      # Conditional rendering
│   └── RoleBasedRedirect.tsx   # Role-based routing
├── app/dashboard/operator/     # Operator dashboard
└── app/debug-sync/             # Debug utilities
```

## Verification Commands

```bash
# Check current branch and changes
git status
git log --oneline -5

# Test the application
npm run dev
# Visit http://localhost:3000/debug-sync
```