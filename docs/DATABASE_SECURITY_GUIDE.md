# OpenLove - Database Security & Maintenance Guide

## Security Overview

### Current Security Status ✅
- **RLS Enabled**: All tables have Row Level Security
- **Comprehensive Policies**: 74 API endpoints covered
- **Auth Integration**: Supabase Auth + custom user profiles
- **Data Isolation**: Users can only access permitted data

## Row Level Security (RLS) Policies

### Policy Structure
```sql
-- Pattern: table_operation_policy
CREATE POLICY "users_read_policy" ON users FOR SELECT USING (
  -- Policy logic here
);
```

### Key Security Functions
```sql
-- Get authenticated user ID
auth.user_id() -- Returns UUID from users table

-- Check friendship status
public.are_friends(user1_id, user2_id) -- Returns BOOLEAN

-- Check follow relationship  
public.is_following(follower_id, following_id) -- Returns BOOLEAN
```

## Critical Security Rules

### 1. User Data Access
```sql
-- ✅ Users can access:
- Their own profile (full access)
- Public profiles (limited fields)
- Friends' profiles (based on privacy settings)

-- ❌ Users CANNOT access:
- Private profiles of non-friends
- Deleted/suspended user data
- Admin-only fields
```

### 2. Content Visibility
```sql
-- ✅ Users can see:
- Public posts from active users
- Friends-only posts from friends
- Their own posts (all)

-- ❌ Users CANNOT see:
- Private posts from non-friends
- Hidden/moderated content
- Posts from suspended users
```

### 3. Messaging Security
```sql
-- ✅ Users can access:
- Conversations they participate in
- Messages from their conversations
- Their own message history

-- ❌ Users CANNOT access:
- Other users' private conversations
- Messages from conversations they left
- Deleted messages content
```

## API Security by Category

### Authentication APIs
| Endpoint | Security Level | Notes |
|----------|---------------|-------|
| `/api/auth/register` | 🔒 RLS + Validation | Creates user with auth.uid() |
| `/api/auth/verify-email` | 🔒 RLS Protected | Own verification only |
| `/api/check-username` | 🟡 Public Read | Rate limited |

### User & Profile APIs  
| Endpoint | Security Level | Notes |
|----------|---------------|-------|
| `/api/users/[id]` | 🔒 Privacy-based | RLS respects privacy_settings |
| `/api/profile/*` | 🔒 Own Profile Only | Full CRUD on own data |
| `/api/users/by-username` | 🔒 Privacy-based | Public/friends visibility |

### Content APIs
| Endpoint | Security Level | Notes |
|----------|---------------|-------|
| `/api/posts` | 🔒 Visibility-based | public/friends/private |
| `/api/comments/*` | 🔒 Post-access-based | Inherit from post visibility |
| `/api/timeline/*` | 🔒 Following-based | Friends + follows only |

### Social APIs
| Endpoint | Security Level | Notes |
|----------|---------------|-------|
| `/api/follows` | 🔒 Relationship-based | Own follows + public |
| `/api/friends/*` | 🔒 Friendship-based | Mutual access |
| `/api/notifications` | 🔒 Recipient Only | Own notifications only |

### Messaging APIs
| Endpoint | Security Level | Notes |
|----------|---------------|-------|
| `/api/chat/conversations` | 🔒 Participant Only | Active participants |
| `/api/chat/messages` | 🔒 Conversation Access | Message in own convos |

## Common Security Vulnerabilities

### 1. Permission Denied Errors
**Cause**: User not in `users` table or auth_id mismatch
```sql
-- Check user exists
SELECT id, auth_id FROM users WHERE auth_id = auth.uid();

-- Fix: Ensure registration creates users record
INSERT INTO users (auth_id, username, email) 
VALUES (auth.uid(), $username, $email);
```

### 2. Data Leakage in Joins
**Problem**: JOINs bypassing RLS
```sql
-- ❌ Dangerous: May expose private data
SELECT p.*, u.email FROM posts p JOIN users u ON p.user_id = u.id;

-- ✅ Safe: RLS applies to both tables
SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id;
```

### 3. Missing Relationship Checks
**Problem**: APIs not checking friendships
```sql
-- ❌ Wrong: Direct user access
SELECT * FROM users WHERE id = $user_id;

-- ✅ Correct: Let RLS handle visibility
SELECT * FROM users WHERE id = $user_id; -- RLS checks privacy
```

## Database Maintenance

### 1. Regular Health Checks
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;

-- Check policy coverage
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Check orphaned data
SELECT COUNT(*) as orphaned_posts
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
WHERE u.id IS NULL;
```

### 2. Performance Monitoring
```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%users%' OR query LIKE '%posts%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 3. Security Auditing
```sql
-- Check admin users
SELECT id, username, email, role, status
FROM users 
WHERE role IN ('admin', 'moderator');

-- Check suspicious activity
SELECT user_id, COUNT(*) as post_count
FROM posts 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 50;

-- Check failed policy access
-- (Monitor application logs for "permission denied" errors)
```

## Backup & Recovery

### 1. Automated Backups
```bash
# Supabase handles automated backups
# Point-in-time recovery available
# Custom backup for critical data:

pg_dump --host=db.xxx.supabase.co \
        --username=postgres \
        --dbname=postgres \
        --table=users \
        --table=posts \
        > backup_$(date +%Y%m%d).sql
```

### 2. Migration Safety
```sql
-- Always test migrations on staging
-- Backup before major schema changes
-- Use transactions for multiple operations

BEGIN;
  -- Migration steps here
  SELECT 'Migration test successful';
ROLLBACK; -- or COMMIT when ready
```

## Emergency Procedures

### 1. Disable RLS (Emergency Only)
```sql
-- ⚠️ DANGER: Only for emergency debugging
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 2. Block Malicious User
```sql
-- Suspend user account
UPDATE users 
SET status = 'suspended', 
    updated_at = NOW()
WHERE id = $malicious_user_id;

-- Hide all their content
UPDATE posts 
SET is_hidden = true, 
    moderation_reason = 'automated_suspension'
WHERE user_id = $malicious_user_id;
```

### 3. Data Recovery
```sql
-- Restore deleted content (soft delete)
UPDATE posts 
SET is_hidden = false, 
    moderation_reason = NULL
WHERE user_id = $user_id 
  AND moderation_reason = 'user_request'
  AND updated_at > NOW() - INTERVAL '7 days';
```

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Permission Denied Rate**: Should be < 1%
2. **Auth Success Rate**: Should be > 99%
3. **Database Connection Pool**: Monitor utilization
4. **Query Performance**: Watch for slow queries
5. **Failed Login Attempts**: Monitor for brute force

### Alert Thresholds
```sql
-- Too many permission denied (potential attack)
-- Alert if > 100 permission denied per minute

-- Unusual data access patterns
-- Alert if single user accesses > 1000 profiles/hour

-- Database performance
-- Alert if avg query time > 100ms
```

## Best Practices

### For Developers
1. **Always test with RLS enabled**
2. **Use proper auth context in queries**
3. **Validate permissions in API logic**
4. **Never bypass RLS unless absolutely necessary**
5. **Log security events for monitoring**

### For Database Admins
1. **Regular policy audits**
2. **Monitor performance impact of RLS**
3. **Keep security functions updated**
4. **Document all policy changes**
5. **Test disaster recovery procedures**

## Migration Files Status

### Current Active Migrations
- ✅ `20250120_004_nuclear_complete_rebuild.sql` - Core schema
- ✅ `20250121_001_fix_database_inconsistencies.sql` - Type fixes
- ✅ `20250121_002_complete_rls_policies.sql` - Security policies

### Deprecated/Removed
All previous migrations have been cleaned up. Only use the three active migrations above.

This security setup provides defense-in-depth for the OpenLove application while maintaining performance and usability.