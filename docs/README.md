# OpenLove - Database Documentation

## 📋 Overview
Documentação completa do banco de dados OpenLove, baseada no schema nuclear em produção.

## 📚 Documentation Index

### 🏗️ Core Documentation
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Schema completo do banco de dados
- **[DATABASE_RELATIONSHIPS.md](./DATABASE_RELATIONSHIPS.md)** - Relacionamentos entre tabelas
- **[DATABASE_DEVELOPER_GUIDE.md](./DATABASE_DEVELOPER_GUIDE.md)** - Guia prático para desenvolvedores
- **[DATABASE_SECURITY_GUIDE.md](./DATABASE_SECURITY_GUIDE.md)** - Segurança e manutenção

### 🗃️ Database Status
- **Current Version**: Nuclear Rebuild v1.0
- **Active Migrations**: 3 files
- **Tables**: 17 core tables
- **Security**: RLS enabled on all tables
- **Performance**: Optimized indexes

## 🚀 Quick Start

### For Developers
```bash
# 1. Check current schema
cat supabase/migrations/20250120_004_nuclear_complete_rebuild.sql

# 2. Understand types
cat app/lib/database.types.ts

# 3. Review API patterns
cat docs/DATABASE_DEVELOPER_GUIDE.md
```

### For Database Admins
```bash
# 1. Review security
cat docs/DATABASE_SECURITY_GUIDE.md

# 2. Check migration status
supabase migration list

# 3. Apply missing migrations
supabase db push
```

## 🔐 Security Status

### ✅ Implemented
- Row Level Security (RLS) on all tables
- Comprehensive policies for 74 API endpoints
- Auth integration with Supabase
- Privacy-based access control
- Friend/follow relationship checks

### 🛡️ Key Features
- **User Isolation**: Users only see permitted data
- **Content Visibility**: Respects privacy settings
- **Message Security**: Conversation-based access
- **Admin Controls**: Moderation capabilities

## 📊 Schema Overview

### Core Tables
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles | Privacy settings, stats, payments |
| `posts` | Content posts | Visibility, media, monetization |
| `comments` | Post comments | Threading, reactions |
| `likes` | Unified reactions | Posts + comments |
| `follows` | Social following | Status tracking |
| `friends` | Friendships | Request/accept flow |
| `conversations` | Chat groups | Direct + group messaging |
| `messages` | Chat messages | Media, reactions, threading |
| `events` | Event system | Location, participation |
| `communities` | Community groups | Membership, moderation |
| `notifications` | User notifications | Read status, actions |
| `subscriptions` | Payment plans | Multi-provider support |

## 🔧 Maintenance

### Current Migrations
```
supabase/migrations/
├── 20250120_004_nuclear_complete_rebuild.sql  # Core schema
├── 20250121_001_fix_database_inconsistencies.sql  # Type fixes  
└── 20250121_002_complete_rls_policies.sql  # Security policies
```

### Health Checks
- ✅ RLS enabled on all tables
- ✅ Policies cover all API endpoints
- ✅ Indexes optimized for performance
- ✅ Types aligned with schema
- ✅ No orphaned data

## 🎯 Recent Changes

### ✅ Completed (2025-01-21)
1. **Database Refactoring**
   - Fixed 65+ inconsistencies between code and DB
   - Aligned TypeScript types with actual schema
   - Corrected field nomenclature (author_id → user_id)
   - Unified likes system (post_likes + comment_likes → likes)

2. **Documentation Cleanup**
   - Removed 24 obsolete documentation files
   - Cleaned up old migrations (13 files removed)
   - Created fresh documentation based on nuclear schema

3. **Security Implementation**
   - Created comprehensive RLS policies
   - Added utility functions for relationship checks
   - Enabled security on all 17 tables
   - Fixed permission denied errors

4. **Code Quality**
   - Fixed PL/pgSQL syntax errors
   - Removed emoji characters causing encoding issues
   - Standardized migration formatting

## ⚠️ Important Notes

### For Development
- **Always use nuclear migration as source of truth**
- **Test with RLS enabled** (disable only for debugging)
- **Follow privacy settings** in user queries
- **Use proper auth context** (auth.user_id())

### For Production
- **Monitor permission denied errors** (should be < 1%)
- **Regular security audits** of policies
- **Performance monitoring** of RLS impact
- **Backup before schema changes**

## 📞 Troubleshooting

### Common Issues
| Error | Cause | Solution |
|-------|-------|----------|
| `permission denied for table users` | User not in users table | Check auth_id mapping |
| `target_type constraint violation` | Wrong likes table usage | Use 'post' or 'comment' |
| `RLS policy not found` | Missing policy | Apply RLS migration |
| `auth.uid() is null` | Not authenticated | Check auth token |

### Debug Commands
```sql
-- Check current user
SELECT auth.uid(), auth.user_id();

-- Check RLS status
\d+ users  -- Shows RLS enabled

-- Test policy
SET row_security = on;
SELECT * FROM users LIMIT 1;
```

## 📈 Performance Tips

### Optimized Queries
- Use specific SELECT fields (not SELECT *)
- Leverage existing indexes for WHERE clauses
- Use LIMIT for pagination
- Follow JOIN patterns from developer guide

### Index Usage
All queries use optimized indexes:
- **Timeline queries**: `idx_posts_timeline`
- **User posts**: `idx_posts_user` 
- **Hashtag search**: `idx_posts_hashtags` (GIN)
- **Messages**: `idx_messages_conversation`

## 🔮 Future Improvements

### Planned Features
- Enhanced search capabilities
- Real-time subscriptions optimization
- Advanced analytics tracking
- Multi-language content support

### Schema Evolution
- Backward compatible migrations only
- Gradual feature rollouts
- Performance monitoring integration
- Automated testing for policies

---

**Last Updated**: 2025-01-21  
**Schema Version**: Nuclear Rebuild v1.0  
**Security Level**: Production Ready ✅