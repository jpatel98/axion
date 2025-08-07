# Axion ERP Database Scripts
*Clean, organized database setup for manufacturing management*

---

## 🗂️ Database Files (Cleaned & Organized)

### **01-core-schema.sql** ⭐ **START HERE**
Complete database schema with all tables, indexes, and security setup.
- All essential tables for manufacturing ERP
- Performance indexes and triggers
- Row Level Security enabled
- **Use for**: New database setup or complete rebuild

### **02-security-policies.sql** 🔒 **SECURITY**
Multi-tenant security policies and role-based access control.
- Tenant data isolation
- Role permissions (operator/scheduler/manager/admin)
- **Run after**: 01-core-schema.sql

### **03-test-data.sql** 🧪 **DEVELOPMENT**
Realistic test data for development and demos.
- Sample customers, jobs, quotes, work centers
- Various job states and scheduling data
- **Use for**: Development, testing, and demos

### **04-utility-scripts.sql** 🛠️ **UTILITIES**
Database maintenance and helper functions.
- Data cleanup utilities
- Performance analysis tools
- Development helpers
- **Use for**: Ongoing maintenance

### **seed-test-data.sql** 📊 **LEGACY SUPPORT**
Original seed data script (kept for compatibility).

---

## 🚀 Quick Start

### **New Database Setup:**
```sql
\i 01-core-schema.sql      -- Core tables and structure
\i 02-security-policies.sql -- Security and access control
\i 03-test-data.sql        -- (Optional) Test data
\i 04-utility-scripts.sql  -- (Optional) Utility functions
```

### **Production Setup:**
```sql
\i 01-core-schema.sql      -- Core structure
\i 02-security-policies.sql -- Security policies
\i 04-utility-scripts.sql  -- Utilities (recommended)
-- Skip test data for production
```

---

## 📋 What Was Cleaned Up

**Removed Redundant Files:**
- `complete-setup.sql` & `complete-setup-fixed.sql` → Consolidated
- `performance-indexes-*.sql` → Integrated into core schema  
- `scheduling-*.sql` → Merged into core schema
- `setup-rls.sql` → Enhanced in security policies
- Various small migration files → Integrated

**Result**: 18 files → 5 clean, well-organized files

---

## 📚 Documentation

See **[README_CLEAN.md](./README_CLEAN.md)** for detailed documentation including:
- Complete table structure
- Utility function reference  
- Migration guide from old structure
- Troubleshooting guide
- Integration roadmap compatibility

---

## ⚠️ Important Notes

- **Always run security policies** after core schema
- **Test thoroughly** in development before production
- **Backup existing data** before major changes
- **Use utility functions** for safe data management