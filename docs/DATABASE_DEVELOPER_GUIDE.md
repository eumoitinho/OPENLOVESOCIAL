# OpenLove - Developer Database Guide

## Quick Reference

### Connection Info
- **Database**: PostgreSQL via Supabase
- **Schema**: Public (default)
- **Auth**: Supabase Auth + RLS
- **Types**: `app/lib/database.types.ts`

### Key Files
- **Main Migration**: `supabase/migrations/20250120_004_nuclear_complete_rebuild.sql`
- **Types**: `app/lib/database.types.ts`
- **Client**: `lib/supabase-server.ts` & `lib/supabase-browser.ts`

## Common Queries

### Users
```typescript
// Get user profile
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single();

// Update user profile  
const { data, error } = await supabase
  .from('users')
  .update({ bio, location })
  .eq('id', userId);
```

### Posts
```typescript
// Get timeline posts
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    users!posts_user_id_fkey (username, avatar_url),
    _count:likes!likes_target_id_fkey (count)
  `)
  .eq('visibility', 'public')
  .order('created_at', { ascending: false })
  .limit(20);

// Create post
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: userId,
    content,
    media_urls,
    visibility: 'public'
  });
```

### Likes (Unified System)
```typescript
// Like a post
const { data, error } = await supabase
  .from('likes')
  .insert({
    user_id: userId,
    target_id: postId,
    target_type: 'post',
    reaction_type: 'like'
  });

// Unlike 
const { error } = await supabase
  .from('likes')
  .delete()
  .eq('user_id', userId)
  .eq('target_id', postId)
  .eq('target_type', 'post');
```

### Comments
```typescript
// Get post comments
const { data: comments } = await supabase
  .from('comments')
  .select(`
    *,
    users!comments_user_id_fkey (username, avatar_url)
  `)
  .eq('post_id', postId)
  .is('parent_id', null)
  .order('created_at', { ascending: true });

// Add comment
const { data, error } = await supabase
  .from('comments')
  .insert({
    post_id: postId,
    user_id: userId,
    content,
    parent_id: parentId // null for top-level
  });
```

### Messages
```typescript
// Get conversation messages
const { data: messages } = await supabase
  .from('messages')
  .select(`
    *,
    users!messages_sender_id_fkey (username, avatar_url)
  `)
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true });

// Send message
const { data, error } = await supabase
  .from('messages')
  .insert({
    conversation_id: conversationId,
    sender_id: userId,
    content,
    type: 'text'
  });

// Mark as read
const { error } = await supabase
  .from('messages')
  .update({ is_read: true })
  .eq('conversation_id', conversationId)
  .eq('is_read', false);
```

## Row Level Security (RLS)

### Understanding RLS Policies
All tables have RLS enabled. Common patterns:

```sql
-- Users can only see public/friends content
CREATE POLICY "posts_public_read" ON posts FOR SELECT USING (
  visibility = 'public' OR
  (visibility = 'friends' AND user_id IN (
    SELECT friend_id FROM friends 
    WHERE user_id = auth.uid() AND status = 'accepted'
  ))
);

-- Users can only modify their own content
CREATE POLICY "posts_own_crud" ON posts FOR ALL USING (
  user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);
```

### Working with Auth
```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Get user profile from our users table
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('auth_id', user.id)
  .single();
```

## Performance Tips

### Efficient Queries
```typescript
// ✅ Good: Use select() with specific fields
const { data } = await supabase
  .from('posts')
  .select('id, content, created_at, users(username)')
  .limit(20);

// ❌ Bad: Don't select(*) for large datasets
const { data } = await supabase
  .from('posts')
  .select('*')
  .limit(100);
```

### Indexes Usage
```typescript
// ✅ These queries use indexes efficiently:

// Timeline query (uses idx_posts_timeline)
.from('posts')
.eq('visibility', 'public')
.order('created_at', { ascending: false })

// User posts (uses idx_posts_user)  
.from('posts')
.eq('user_id', userId)
.order('created_at', { ascending: false })

// Hashtag search (uses idx_posts_hashtags GIN index)
.from('posts')
.contains('hashtags', ['travel'])
```

### Realtime Subscriptions
```typescript
// Subscribe to new posts
const channel = supabase
  .channel('public:posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('New post:', payload.new);
    }
  )
  .subscribe();

// Subscribe to messages in conversation
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

## Common Patterns

### Stats Updates
Stats are updated automatically via triggers:
```sql
-- Post stats updated when likes/comments change
UPDATE posts SET stats = jsonb_set(
  stats, 
  '{likes_count}', 
  (SELECT COUNT(*) FROM likes WHERE target_id = posts.id)::text::jsonb
);
```

### Soft Deletes
Some tables use soft deletes:
```typescript
// Mark as deleted instead of hard delete
const { error } = await supabase
  .from('posts')
  .update({ is_hidden: true, moderation_reason: 'user_request' })
  .eq('id', postId);
```

### JSON Queries
```typescript
// Query JSON fields
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('privacy_settings->profile_visibility', 'public');

// Update JSON fields
const { error } = await supabase
  .from('users')
  .update({ 
    privacy_settings: { 
      ...existingSettings, 
      show_location: false 
    }
  })
  .eq('id', userId);
```

## Error Handling

### Common Errors
```typescript
// Permission denied (RLS)
if (error?.code === '42501') {
  console.log('User lacks permission for this operation');
}

// Unique constraint violation
if (error?.code === '23505') {
  console.log('Duplicate entry (username, email, etc.)');
}

// Foreign key violation  
if (error?.code === '23503') {
  console.log('Referenced record does not exist');
}

// Check constraint violation
if (error?.code === '23514') {
  console.log('Invalid value for constrained field');
}
```

### Debugging RLS
```typescript
// If queries return empty when they shouldn't:
// 1. Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('Auth user:', user);

// 2. Check if user exists in users table
const { data: profile } = await supabase
  .from('users')
  .select('id, auth_id')
  .eq('auth_id', user?.id);
console.log('Profile:', profile);

// 3. Temporarily disable RLS for testing (development only!)
// ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

## Migration Management

### Current State
- **Active Migration**: `20250120_004_nuclear_complete_rebuild.sql` 
- **Latest Fix**: `20250121_001_fix_database_inconsistencies.sql`

### Creating New Migrations
```bash
# Generate new migration file
supabase migration new your_migration_name

# Apply migrations
supabase db push

# Reset database (development only!)
supabase db reset
```

This guide covers the essential patterns for working with the OpenLove database. For complete schema details, see `DATABASE_SCHEMA.md`.