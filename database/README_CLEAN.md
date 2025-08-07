# Axion ERP Database Documentation
*Clean, organized database scripts for manufacturing management*

---

## 🗂️ Database Structure Overview

This folder contains a **cleaned and organized** set of database scripts for the Axion Manufacturing ERP system. All redundant and outdated files have been removed, leaving only essential, well-documented scripts.

---

## 📋 Core Database Files

### **01-core-schema.sql** ⭐ **PRIMARY SETUP**
**Complete database schema with all tables, indexes, and triggers**
- All essential tables: tenants, users, customers, jobs, quotes, work centers, etc.
- Performance indexes for optimal query speed  
- Row Level Security (RLS) enabled on all tables
- Automated triggers for updated_at timestamps
- Event logging for job status changes
- **USE THIS**: For any new database setup or complete rebuild

**Tables Included:**
- `tenants` - Multi-tenant organization support
- `users` - User accounts with role-based access
- `customers` - Customer management with full contact info
- `work_centers` - Shop floor work stations and capacity
- `jobs` - Manufacturing jobs with scheduling integration
- `quotes` - Quote management with line items
- `job_operations` - Operations breakdown for scheduling
- `scheduled_operations` - Calendar scheduling entries
- `user_invitations` - Team member invitation system
- `system_events` - Event logging for integration tracking

### **02-security-policies.sql** 🔒 **SECURITY**
**Row Level Security policies for multi-tenant data isolation**
- Tenant-based data isolation (users only see their org's data)
- Role-based permissions (operator/scheduler/manager/admin)
- Secure multi-tenant access patterns
- **RUN AFTER**: 01-core-schema.sql

### **03-test-data.sql** 🧪 **DEVELOPMENT**
**Realistic test data for development and testing**
- Sample tenant (Axion Manufacturing)
- 3 customers with full contact information
- 4 work centers (CNC, Welding, Assembly, Finishing)
- 2 quotes with line items (1 approved, 1 sent)
- 4 jobs in various states (completed, in-progress, pending)
- Job operations for scheduling integration
- Calendar entries for scheduler testing
- **USE FOR**: Development, testing, and demos

### **04-utility-scripts.sql** 🛠️ **MAINTENANCE**
**Database maintenance and development helper functions**
- Data cleanup utilities (`clear_test_data()`, `clear_user_data()`)
- Performance analysis (`database_stats()`, `job_statistics()`)
- Data integrity checks (`check_orphaned_records()`)
- Development helpers (`next_job_number()`, `next_quote_number()`)
- **USE FOR**: Ongoing database maintenance and development

---

## 🚀 Quick Start Guide

### **For New Database Setup:**
```sql
-- 1. Create database schema and structure
\i 01-core-schema.sql

-- 2. Set up security policies  
\i 02-security-policies.sql

-- 3. (Optional) Add test data for development
\i 03-test-data.sql

-- 4. (Optional) Load utility functions
\i 04-utility-scripts.sql
```

### **For Production Deployment:**
```sql
-- 1. Schema and structure
\i 01-core-schema.sql

-- 2. Security policies
\i 02-security-policies.sql

-- 3. Utility functions (recommended)
\i 04-utility-scripts.sql

-- Skip test data for production!
```

### **For Development/Testing:**
```sql
-- Load everything including test data
\i 01-core-schema.sql
\i 02-security-policies.sql  
\i 03-test-data.sql
\i 04-utility-scripts.sql
```

---

## 🔧 Utility Functions Reference

### **Data Management**
```sql
-- Clear all test data
SELECT clear_test_data();

-- Clear only user-generated data  
SELECT clear_user_data();

-- Get database size and statistics
SELECT * FROM database_stats();
```

### **Analytics & Reporting**
```sql
-- Job statistics by status
SELECT * FROM job_statistics();

-- Job statistics for specific tenant
SELECT * FROM job_statistics('tenant-uuid-here');

-- Check for data integrity issues
SELECT * FROM check_orphaned_records();
```

### **Development Helpers**
```sql
-- Generate next job number
SELECT next_job_number('tenant-uuid-here');

-- Generate next quote number
SELECT next_quote_number('tenant-uuid-here');

-- Create data snapshot for testing
SELECT create_data_snapshot('before_feature_test');
```

---

## 📊 Database Schema Highlights

### **Multi-Tenant Architecture**
- All tables include `tenant_id` for data isolation
- Row Level Security enforces tenant boundaries
- Supports multiple manufacturing companies in one database

### **Role-Based Access Control**
- **Operator**: Can update job status, view assigned work
- **Scheduler**: Can manage scheduling and resource allocation  
- **Manager**: Can create jobs, quotes, manage operations
- **Admin**: Full system access and user management

### **Integration-Ready Design**
- `job_operations` table for detailed scheduling
- `scheduled_operations` for calendar integration
- `system_events` for real-time updates and workflow automation
- JSON payload support for flexible event data

### **Performance Optimized**
- Strategic indexes on frequently queried columns
- Composite indexes for multi-column searches
- Tenant-aware indexing for multi-tenant performance

---

## 🗑️ Cleaned Up Files

### **Removed Redundant Scripts:**
- `complete-setup.sql` & `complete-setup-fixed.sql` → **Consolidated into 01-core-schema.sql**
- `performance-indexes-safe.sql` & `performance-indexes-enhanced.sql` → **Merged into core schema**
- `scheduling-schema.sql` & `scheduling-tables.sql` → **Integrated into core schema**
- `setup-rls.sql` → **Enhanced and moved to 02-security-policies.sql**
- `simple-role-fix.sql` → **Incorporated into core schema**
- `clear-users.sql` & `clear-all-data.sql` → **Replaced with utility functions**
- `fix-date-timezone-issue.sql` → **Applied and integrated**

### **Archived Development Scripts:**
- `phase2-schema.sql` → **Features integrated into core schema**
- `production-setup-fixed.sql` → **Functionality moved to core files**
- `add-*.sql` migration files → **Changes integrated into core schema**

---

## 📈 Migration from Old Structure

If you have an existing database with the old script structure:

### **Backup First:**
```bash
pg_dump your_database > backup_$(date +%Y%m%d).sql
```

### **For Existing Databases:**
1. **Export your data** (customers, jobs, quotes, etc.)
2. **Drop and recreate** database with new clean structure
3. **Import your data** back into the new structure
4. **Test thoroughly** before deploying

### **Development Databases:**
```sql
-- Quick reset for development
SELECT clear_test_data();
\i 01-core-schema.sql
\i 02-security-policies.sql  
\i 03-test-data.sql
```

---

## 🎯 Integration Roadmap Compatibility

These clean database scripts are **fully compatible** with the [Seamless Integration Roadmap](./SEAMLESS_INTEGRATION_ROADMAP.md):

- **Phase 1**: Job-to-schedule integration ready with `job_operations` and `scheduled_operations`
- **Phase 2**: Real-time updates supported by `system_events` table
- **Phase 3**: Analytics ready with performance-optimized schema

---

## ⚠️ Important Notes

### **Security Considerations:**
- RLS policies are **essential** for multi-tenant security
- Never skip the security policies script in any environment
- Test RLS policies thoroughly with different user roles

### **Performance Notes:**
- Indexes are optimized for typical manufacturing ERP queries
- Monitor query performance and add indexes as needed
- Use `database_stats()` function to monitor table growth

### **Maintenance:**
- Run `check_orphaned_records()` periodically to ensure data integrity
- Use utility functions for safe data cleanup in development
- Create snapshots before major schema changes

---

## 🆘 Troubleshooting

### **Common Issues:**

**"relation already exists" errors:**
- Use `IF NOT EXISTS` clauses (already included in scripts)
- Or drop and recreate database for clean start

**RLS policy errors:**
- Ensure `02-security-policies.sql` runs after core schema
- Check that user authentication is properly configured

**Performance issues:**
- Run `SELECT * FROM find_missing_fk_indexes();` to identify missing indexes
- Use `SELECT * FROM slow_queries;` to identify slow queries (requires pg_stat_statements)

**Data integrity issues:**
- Run `SELECT * FROM check_orphaned_records();` to identify problems
- Use utility functions to clean up inconsistent data

---

*This clean database structure provides a solid foundation for the Axion Manufacturing ERP system with room for growth and integration enhancements.*