-- Optimize Posts Database Indexes for Timeline Performance
-- This migration adds critical indexes for fast timeline queries

-- Drop existing indexes that might conflict
DROP INDEX IF EXISTS idx_posts_visibility;
DROP INDEX IF EXISTS idx_posts_user_id;
DROP INDEX IF EXISTS idx_posts_created_at;
DROP INDEX IF EXISTS idx_posts_hashtags;

-- 1. Critical compound index for timeline queries (visibility + created_at)
-- This is the most important index for timeline performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_timeline_visibility_created 
ON posts (visibility, created_at DESC)
WHERE visibility IN ('public', 'friends_only');

-- 2. Index for user-specific post queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_visibility_created 
ON posts (user_id, visibility, created_at DESC);

-- 3. Index for hashtag searches (GIN index for array operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_hashtags_gin 
ON posts USING GIN (hashtags)
WHERE hashtags IS NOT NULL AND array_length(hashtags, 1) > 0;

-- 4. Index for mention searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_mentions_gin 
ON posts USING GIN (mentions)
WHERE mentions IS NOT NULL AND array_length(mentions, 1) > 0;

-- 5. Index for media posts filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_media_urls 
ON posts (created_at DESC)
WHERE media_urls IS NOT NULL AND array_length(media_urls, 1) > 0;

-- 6. Index for premium content filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_premium_created 
ON posts (is_premium_content, created_at DESC)
WHERE is_premium_content = true;

-- 7. Index for event posts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_events_created 
ON posts (is_event, created_at DESC)
WHERE is_event = true;

-- 8. Composite index for location-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_location_visibility 
ON posts (visibility, created_at DESC)
WHERE location IS NOT NULL;

-- Indexes for related tables

-- 9. Post likes optimization
DROP INDEX IF EXISTS idx_post_likes_post_id;
DROP INDEX IF EXISTS idx_post_likes_user_id;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_post_user 
ON post_likes (post_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_user_created 
ON post_likes (user_id, created_at DESC);

-- 10. Comments optimization
DROP INDEX IF EXISTS idx_comments_post_id;
DROP INDEX IF EXISTS idx_comments_user_id;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created 
ON comments (post_id, created_at ASC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_user_created 
ON comments (user_id, created_at DESC);

-- Index for threaded comments (replies)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_parent_created 
ON comments (parent_id, created_at ASC)
WHERE parent_id IS NOT NULL;

-- 11. Saved posts optimization
DROP INDEX IF EXISTS idx_saved_posts_user_id;
DROP INDEX IF EXISTS idx_saved_posts_post_id;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_posts_user_created 
ON saved_posts (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_posts_post_user 
ON saved_posts (post_id, user_id);

-- 12. Post views optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_views_post_user 
ON post_views (post_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_views_user_viewed 
ON post_views (user_id, viewed_at DESC);

-- 13. Follows table optimization (critical for friends posts)
DROP INDEX IF EXISTS idx_follows_follower;
DROP INDEX IF EXISTS idx_follows_following;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_follower_status 
ON follows (follower_id, status)
WHERE status = 'accepted';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_following_status 
ON follows (following_id, status)
WHERE status = 'accepted';

-- Compound index for RLS policy checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_relationship 
ON follows (follower_id, following_id, status);

-- 14. Users table optimization for joins
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_username 
ON users (username) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id_active 
ON users (id) 
WHERE is_active = true;

-- Partial indexes for better performance on specific queries

-- 15. Index for recent posts only (last 30 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_recent_public 
ON posts (created_at DESC) 
WHERE visibility = 'public' 
  AND created_at > (NOW() - INTERVAL '30 days');

-- 16. Index for trending posts (high engagement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_trending 
ON posts (((stats->>'likes')::int + (stats->>'comments')::int + (stats->>'shares')::int) DESC, created_at DESC)
WHERE visibility = 'public' 
  AND created_at > (NOW() - INTERVAL '7 days');

-- Add statistics to help query planner
ANALYZE posts;
ANALYZE post_likes;
ANALYZE comments;
ANALYZE saved_posts;
ANALYZE post_views;
ANALYZE follows;
ANALYZE users;

-- Create comments on indexes for documentation
COMMENT ON INDEX idx_posts_timeline_visibility_created IS 
'Critical index for timeline queries - filters by visibility and orders by creation date';

COMMENT ON INDEX idx_posts_user_visibility_created IS 
'Optimizes user-specific post queries with visibility filtering';

COMMENT ON INDEX idx_posts_hashtags_gin IS 
'GIN index for efficient hashtag array searches';

COMMENT ON INDEX idx_follows_relationship IS 
'Compound index for RLS policy checks on follows relationship';

COMMENT ON INDEX idx_posts_recent_public IS 
'Partial index for recent public posts - improves timeline performance';

COMMENT ON INDEX idx_posts_trending IS 
'Composite index for trending posts based on engagement metrics';