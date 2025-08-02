# Database Scripts

## Essential Scripts

### `schema.sql`
Main database schema with all tables and basic structure.

### `complete-setup.sql` 
**USE THIS ONE** - Complete RBAC setup with test data. Includes:
- Role enum fix
- Test customers, quotes, jobs
- Company settings

### `setup-rls.sql`
Row Level Security policies for multi-tenant access.

## Feature-Specific Scripts

### `scheduling-schema.sql` & `scheduling-tables.sql`
Production scheduling features and work center management.

### `phase2-schema.sql`
Extended features for advanced manufacturing workflows.

### `production-setup-fixed.sql`
Production-ready database setup with optimizations.

### `performance-indexes-safe.sql`
Performance indexes that are safe to apply to production.

### `work-centers-simple.sql`
Basic work center setup for shop floor operations.

## Quick Start

1. **For RBAC setup**: Run `complete-setup.sql` in Supabase SQL Editor
2. **For production**: Run `production-setup-fixed.sql` 
3. **For performance**: Run `performance-indexes-safe.sql`