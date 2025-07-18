-- DEBUG: Find all triggers and functions affecting follows table

-- 1. List all triggers on follows table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation,
    action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'follows';

-- 2. List all functions that might be called by triggers
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND (
    routine_name LIKE '%follow%' OR 
    routine_name LIKE '%user_stats%' OR
    routine_name LIKE '%notification%'
);

-- 3. Check for any triggers that might be calling update_user_stats
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.action_statement
FROM information_schema.triggers t
WHERE t.action_statement LIKE '%update_user_stats%';

-- 4. Check the current schema of follows table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- 5. Find any functions that reference 'user_id' 
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_definition LIKE '%user_id%'
AND routine_definition LIKE '%follows%';

-- 6. Check for notification triggers that might be the issue
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%notification%' 
AND event_object_table = 'follows';