# Development Workflow Guide

## 🌳 Branching Strategy

### Branch Types:
- **`main`** - Production branch (protected, auto-deploys to Vercel)
- **`develop`** - Integration branch for testing features together
- **`feature/feature-name`** - New features and enhancements
- **`bugfix/bug-description`** - Bug fixes
- **`hotfix/critical-fix`** - Emergency production fixes

## 🚀 Development Process

### 1. Starting New Work

```bash
# Always start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/add-inventory-management
# or
git checkout -b bugfix/fix-job-status-filter
```

### 2. Development & Testing

```bash
# Make your changes
# Test locally
npm run dev
npm run build
npm run typecheck

# Commit frequently
git add .
git commit -m "feat: add inventory table structure"
```

### 3. Ready for Review

```bash
# Push feature branch
git push -u origin feature/add-inventory-management

# Create Pull Request on GitHub
# Target: develop branch (not main!)
```

### 4. After PR Approval

```bash
# Merge to develop via GitHub
# Then update your local develop
git checkout develop
git pull origin develop

# Clean up feature branch
git branch -d feature/add-inventory-management
git push origin --delete feature/add-inventory-management
```

### 5. Release to Production

```bash
# When develop is ready for production
git checkout main
git pull origin main
git merge develop
git push origin main

# This will trigger Vercel deployment
```

## 🔥 Hotfix Process (Emergency)

```bash
# For critical production bugs
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-auth-bug

# Make minimal fix
# Test thoroughly
git add .
git commit -m "hotfix: resolve auth token expiration"

# Deploy immediately
git checkout main
git merge hotfix/fix-critical-auth-bug
git push origin main

# Also merge back to develop
git checkout develop
git merge hotfix/fix-critical-auth-bug
git push origin develop
```

## ✅ Quality Gates

### Before Every Commit:
- [ ] Code runs locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] Types are valid (`npm run typecheck`)
- [ ] No console errors

### Before Every PR:
- [ ] Feature works end-to-end
- [ ] No breaking changes
- [ ] Database changes documented
- [ ] Environment variables documented

### Before Production:
- [ ] All tests pass
- [ ] Performance tested
- [ ] Database migrations applied
- [ ] Monitoring configured

## 🛠 Quick Commands

```bash
# Start new feature
./scripts/new-feature.sh inventory-management

# Finish feature  
./scripts/finish-feature.sh

# Deploy to production
./scripts/deploy.sh

# Emergency rollback
./scripts/rollback.sh
```

## 🚨 Emergency Procedures

### If Production Breaks:
1. **Immediate**: Rollback via Vercel dashboard
2. **Create hotfix branch** from main
3. **Fix and test** thoroughly
4. **Deploy hotfix** to main
5. **Post-mortem** - document what happened

### If Database Issue:
1. **Check Supabase logs**
2. **Restore from backup** if needed
3. **Apply fix** via hotfix process
4. **Update monitoring** to prevent recurrence