-- Utility Scripts for Axion ERP Database Management
-- Collection of useful maintenance and development scripts

-- =============================================================================
-- DATA CLEANUP UTILITIES
-- =============================================================================

-- Clear all test data while preserving schema
CREATE OR REPLACE FUNCTION clear_test_data()
RETURNS TEXT AS $$
BEGIN
    -- Disable triggers temporarily to avoid constraint issues
    SET session_replication_role = replica;
    
    -- Clear data in dependency order
    DELETE FROM system_events;
    DELETE FROM scheduled_operations;  
    DELETE FROM job_operations;
    DELETE FROM quote_line_items;
    DELETE FROM user_invitations;
    DELETE FROM jobs;
    DELETE FROM quotes;
    DELETE FROM customers;
    DELETE FROM work_centers;
    DELETE FROM users;
    DELETE FROM tenants;
    
    -- Re-enable triggers
    SET session_replication_role = DEFAULT;
    
    RETURN 'All test data cleared successfully';
END;
$$ LANGUAGE plpgsql;

-- Clear only user data (keep system setup)
CREATE OR REPLACE FUNCTION clear_user_data()
RETURNS TEXT AS $$
BEGIN
    DELETE FROM system_events WHERE event_type NOT LIKE 'system.%';
    DELETE FROM job_operations;
    DELETE FROM quote_line_items;
    DELETE FROM user_invitations WHERE status = 'accepted';
    DELETE FROM jobs;
    DELETE FROM quotes;
    
    RETURN 'User data cleared, system data preserved';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DATABASE ANALYSIS UTILITIES
-- =============================================================================

-- Get table sizes and row counts
CREATE OR REPLACE FUNCTION database_stats()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        COALESCE(s.n_tup_ins - s.n_tup_del, 0) as row_count,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(t.schemaname||'.'||t.tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename) + pg_indexes_size(t.schemaname||'.'||t.tablename)) as total_size
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Get job statistics
CREATE OR REPLACE FUNCTION job_statistics(tenant_uuid UUID DEFAULT NULL)
RETURNS TABLE(
    status VARCHAR(50),
    count BIGINT,
    total_estimated_cost DECIMAL(12,2),
    total_actual_cost DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.status,
        COUNT(*) as count,
        COALESCE(SUM(j.estimated_cost), 0) as total_estimated_cost,
        COALESCE(SUM(j.actual_cost), 0) as total_actual_cost
    FROM jobs j
    WHERE tenant_uuid IS NULL OR j.tenant_id = tenant_uuid
    GROUP BY j.status
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE MONITORING
-- =============================================================================

-- Find slow queries and missing indexes
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check for missing indexes on foreign keys
CREATE OR REPLACE FUNCTION find_missing_fk_indexes()
RETURNS TABLE(
    table_name TEXT,
    column_name TEXT,
    constraint_name TEXT,
    suggested_index TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.table_name::TEXT,
        kcu.column_name::TEXT,
        tc.constraint_name::TEXT,
        ('CREATE INDEX idx_' || tc.table_name || '_' || kcu.column_name || ' ON ' || tc.table_name || '(' || kcu.column_name || ');')::TEXT as suggested_index
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = tc.table_name 
            AND indexdef LIKE '%' || kcu.column_name || '%'
        )
    ORDER BY tc.table_name, kcu.column_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DATA INTEGRITY CHECKS
-- =============================================================================

-- Check for orphaned records
CREATE OR REPLACE FUNCTION check_orphaned_records()
RETURNS TABLE(
    issue_type TEXT,
    table_name TEXT,
    count BIGINT,
    description TEXT
) AS $$
BEGIN
    -- Check for jobs without valid tenants
    RETURN QUERY
    SELECT 
        'orphaned_jobs'::TEXT,
        'jobs'::TEXT,
        COUNT(*)::BIGINT,
        'Jobs with invalid tenant_id references'::TEXT
    FROM jobs j
    LEFT JOIN tenants t ON j.tenant_id = t.id
    WHERE t.id IS NULL
    HAVING COUNT(*) > 0;
    
    -- Check for quotes without valid customers
    RETURN QUERY
    SELECT 
        'orphaned_quotes'::TEXT,
        'quotes'::TEXT,
        COUNT(*)::BIGINT,
        'Quotes with invalid customer_id references'::TEXT
    FROM quotes q
    LEFT JOIN customers c ON q.customer_id = c.id
    WHERE c.id IS NULL
    HAVING COUNT(*) > 0;
    
    -- Check for job operations without valid jobs
    RETURN QUERY
    SELECT 
        'orphaned_operations'::TEXT,
        'job_operations'::TEXT,
        COUNT(*)::BIGINT,
        'Job operations with invalid job_id references'::TEXT
    FROM job_operations jo
    LEFT JOIN jobs j ON jo.job_id = j.id
    WHERE j.id IS NULL
    HAVING COUNT(*) > 0;
    
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEQUENCE MANAGEMENT
-- =============================================================================

-- Reset sequences for job and quote numbering
CREATE OR REPLACE FUNCTION reset_sequences()
RETURNS TEXT AS $$
DECLARE
    max_job_num INTEGER;
    max_quote_num INTEGER;
BEGIN
    -- Extract numeric part from job numbers and find max
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM '\d+') AS INTEGER)), 0) 
    INTO max_job_num
    FROM jobs 
    WHERE job_number ~ '^JOB-\d+$';
    
    -- Extract numeric part from quote numbers and find max
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '\d+') AS INTEGER)), 0)
    INTO max_quote_num  
    FROM quotes
    WHERE quote_number ~ '^QUO-\d+$';
    
    RETURN format('Max job number: %s, Max quote number: %s', max_job_num, max_quote_num);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BACKUP AND RESTORE HELPERS
-- =============================================================================

-- Create a snapshot of current data state
CREATE OR REPLACE FUNCTION create_data_snapshot(snapshot_name TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Create a table to track snapshots
    CREATE TABLE IF NOT EXISTS data_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        tenant_count INTEGER,
        user_count INTEGER,
        job_count INTEGER,
        quote_count INTEGER
    );
    
    -- Record snapshot metadata
    INSERT INTO data_snapshots (name, tenant_count, user_count, job_count, quote_count)
    SELECT 
        snapshot_name,
        (SELECT COUNT(*) FROM tenants),
        (SELECT COUNT(*) FROM users), 
        (SELECT COUNT(*) FROM jobs),
        (SELECT COUNT(*) FROM quotes);
        
    RETURN format('Snapshot "%s" created successfully', snapshot_name);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DEVELOPMENT HELPERS
-- =============================================================================

-- Generate next job number for a tenant
CREATE OR REPLACE FUNCTION next_job_number(tenant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    max_num INTEGER;
    next_num TEXT;
BEGIN
    -- Find the highest existing job number for this tenant
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM '\d+') AS INTEGER)), 0) + 1
    INTO max_num
    FROM jobs 
    WHERE tenant_id = tenant_uuid 
    AND job_number ~ '^JOB-\d+$';
    
    -- Format with leading zeros
    next_num := 'JOB-' || LPAD(max_num::TEXT, 3, '0');
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Generate next quote number for a tenant  
CREATE OR REPLACE FUNCTION next_quote_number(tenant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    max_num INTEGER;
    next_num TEXT;
BEGIN
    -- Find the highest existing quote number for this tenant
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '\d+') AS INTEGER)), 0) + 1
    INTO max_num
    FROM quotes
    WHERE tenant_id = tenant_uuid
    AND quote_number ~ '^QUO-\d+$';
    
    -- Format with leading zeros
    next_num := 'QUO-' || LPAD(max_num::TEXT, 3, '0');
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USAGE EXAMPLES
-- =============================================================================

/*
-- Example usage of utility functions:

-- Clear all test data
SELECT clear_test_data();

-- Get database statistics
SELECT * FROM database_stats();

-- Get job statistics for all tenants
SELECT * FROM job_statistics();

-- Get job statistics for specific tenant
SELECT * FROM job_statistics('f47ac10b-58cc-4372-a567-0e02b2c3d479');

-- Check for data integrity issues
SELECT * FROM check_orphaned_records();

-- Find missing indexes
SELECT * FROM find_missing_fk_indexes();

-- Generate next job number
SELECT next_job_number('f47ac10b-58cc-4372-a567-0e02b2c3d479');

-- Generate next quote number  
SELECT next_quote_number('f47ac10b-58cc-4372-a567-0e02b2c3d479');

-- Create a data snapshot
SELECT create_data_snapshot('before_integration_testing');

-- View slow queries (requires pg_stat_statements extension)
SELECT * FROM slow_queries;

*/