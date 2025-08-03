# Performance Optimizations for Axion ERP

This document describes the performance optimizations implemented for the Axion ERP application to improve database query performance, search functionality, and overall application responsiveness.

## Database Index Optimizations

### Jobs Table Indexes

1. **Primary Query Indexes**:
   - `idx_jobs_tenant_created`: Composite index on `(tenant_id, created_at DESC)` for tenant-isolated queries sorted by creation date
   - `idx_jobs_tenant_status`: Composite index on `(tenant_id, status)` for filtering by tenant and status
   - `idx_jobs_tenant_status_created_desc`: Composite index on `(tenant_id, status, created_at DESC)` for combined filtering and sorting

2. **Search Field Indexes**:
   - `idx_jobs_job_number`: Index on `job_number` for exact lookups
   - `idx_jobs_part_number`: Index on `part_number` for exact lookups
   - `idx_jobs_customer`: Index on `customer_name` for exact lookups
   - `idx_jobs_status`: Index on `status` for filtering
   - `idx_jobs_due_date`: Index on `due_date` for date-based queries

3. **Sorting Indexes**:
   - `idx_jobs_tenant_sortby_created`: Index on `(tenant_id, created_at)` for sorting by creation date
   - `idx_jobs_tenant_sortby_updated`: Index on `(tenant_id, updated_at)` for sorting by update date
   - `idx_jobs_tenant_sortby_due_date`: Index on `(tenant_id, due_date)` for sorting by due date
   - `idx_jobs_tenant_sortby_job_number`: Index on `(tenant_id, job_number)` for sorting by job number

4. **Pattern Matching Indexes**:
   - `idx_jobs_job_number_pattern`: Text pattern index on `job_number` for `ILIKE` queries
   - `idx_jobs_customer_name_pattern`: Text pattern index on `customer_name` for `ILIKE` queries
   - `idx_jobs_part_number_pattern`: Text pattern index on `part_number` for `ILIKE` queries

5. **Full-Text Search Index**:
   - `idx_jobs_search_vector`: GIN index on `search_vector` for full-text search capabilities
   - Automatically maintained via trigger `jobs_search_vector_trigger`

### Quotes Table Indexes

1. **Primary Query Indexes**:
   - `idx_quotes_tenant_created`: Composite index on `(tenant_id, created_at DESC)`
   - `idx_quotes_tenant_status`: Composite index on `(tenant_id, status)`
   - `idx_quotes_tenant_status_created`: Composite index on `(tenant_id, status, created_at DESC)`

2. **Search Field Indexes**:
   - `idx_quotes_status`: Index on `status` for filtering
   - `idx_quotes_valid_until`: Index on `valid_until` for date-based queries
   - `idx_quotes_customer`: Index on `customer_id` for customer-based queries

3. **Full-Text Search Index**:
   - `idx_quotes_search_vector`: GIN index on `search_vector` for full-text search capabilities
   - Automatically maintained via trigger `quotes_search_vector_trigger`

### Customers Table Indexes

- `idx_customers_tenant_name`: Composite index on `(tenant_id, name)`
- `idx_customers_tenant_created`: Composite index on `(tenant_id, created_at DESC)`

### Users Table Indexes

- `idx_users_clerk_id`: Index on `clerk_user_id` for user lookups
- `idx_users_tenant`: Index on `tenant_id` for tenant-based queries

## API Search Optimizations

### Jobs API (`/api/v1/jobs`)

The Jobs API now supports two search modes:

1. **Full-Text Search** (when available):
   - Uses PostgreSQL's `tsvector` and `websearch` functionality
   - Searches across `job_number`, `customer_name`, `part_number`, and `description`
   - Weighted search with `job_number` having highest priority
   - Significantly faster than `ILIKE` pattern matching

2. **Fallback ILIKE Search**:
   - Uses optimized `ILIKE` queries with pattern indexes
   - Searches across the same fields as full-text search
   - Automatic fallback when full-text search is not available

### Quotes API (`/api/v1/quotes`)

Similar to Jobs API with full-text search capabilities:
- Searches across `quote_number`, `title`, `description`
- Weighted search with `quote_number` having highest priority

## Implementation Benefits

### Performance Improvements

1. **Query Speed**: 
   - Index lookups instead of full table scans
   - Composite indexes for common query patterns
   - Reduced database load for frequently accessed data

2. **Search Performance**:
   - Full-text search is typically 10-100x faster than ILIKE pattern matching
   - Better relevance ranking for search results
   - Support for complex search queries (AND, OR, phrases)

3. **Sorting Efficiency**:
   - Pre-sorted indexes eliminate need for runtime sorting
   - Faster pagination for large datasets

4. **Automatic Maintenance**:
   - Search vectors automatically updated through database triggers
   - No application-level code changes needed for search vector maintenance

### Implementation Details

1. **Safe Migration**:
   - All indexes use `IF NOT EXISTS` checks
   - Search vector columns are conditionally added
   - Triggers are only created if they don't already exist

2. **Compatibility**:
   - Automatic fallback to ILIKE search if full-text search is not available
   - Works with existing data without requiring data migration
   - No breaking changes to existing API contracts

## Deployment Instructions

1. Apply the database migration:
   ```sql
   \i database/performance-indexes-enhanced.sql
   ```

2. The API changes are automatically compatible:
   - New search functionality is automatically detected
   - Fallback ensures compatibility with older database versions
   - No client-side changes required

## Monitoring Performance

1. **Query Performance**:
   - Monitor query execution times in Supabase logs
   - Use `EXPLAIN ANALYZE` to verify index usage

2. **Search Performance**:
   - Compare search response times before and after implementation
   - Monitor CPU and memory usage during search operations

3. **Index Usage**:
   - Check index usage statistics in PostgreSQL
   - Monitor for unused indexes that could be removed

## Future Enhancements

1. **Additional Full-Text Search**:
   - Extend to other tables (customers, work centers, etc.)
   - Add support for different languages
   - Implement synonym dictionaries for industry terms

2. **Query Caching**:
   - Implement Redis-based caching for frequently accessed queries
   - Add cache invalidation strategies for data updates

3. **Result Pagination**:
   - Implement cursor-based pagination for better performance with large datasets
   - Add support for infinite scrolling in UI components

4. **Search Analytics**:
   - Track common search terms to optimize indexes
   - Implement search result ranking based on usage patterns
