-- Check existing indexes on your tables
SELECT 
    t.tablename AS table_name,
    i.indexname AS index_name,
    i.indexdef AS index_definition
FROM 
    pg_indexes i
    JOIN pg_tables t ON i.tablename = t.tablename
WHERE 
    t.schemaname = 'public'
    AND t.tablename IN ('jobs', 'quotes', 'customers', 'users', 'quote_line_items')
ORDER BY 
    t.tablename, 
    i.indexname;

-- Check table sizes and row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    n_live_tup AS row_count
FROM 
    pg_stat_user_tables
WHERE 
    schemaname = 'public'
    AND tablename IN ('jobs', 'quotes', 'customers', 'users', 'quote_line_items')
ORDER BY 
    pg_total_relation_size(schemaname||'.'||tablename) DESC;