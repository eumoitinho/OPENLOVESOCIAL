# OpenLove Architecture Documentation 2025

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer - Next.js 15 App Router"
        A[Client Browser] --> B[Next.js Pages]
        B --> C[React 19 Components]
        C --> D[Hero UI + Tailwind CSS]
        C --> E[Zustand State Management]
        C --> F[React Hook Form]
        B --> G[Server Components]
        B --> H[Client Components]
        
        subgraph "Key Pages"
            B --> I[/timeline - Main Feed]
            B --> J[/messages - Chat System]
            B --> K[/profile - User Profiles]
            B --> L[/events - Events System]
            B --> M[/communities - Groups]
            B --> N[/pricing - Plans]
        end
    end
    
    subgraph "API Layer - 65+ Endpoints"
        O[API Routes] --> P[/api/auth - Authentication]
        O --> Q[/api/posts - Content Management]
        O --> R[/api/chat - Messaging]
        O --> S[/api/payments - Monetization]
        O --> T[/api/notifications - Alerts]
        O --> U[/api/users - User Management]
        O --> V[/api/upload - Media]
        O --> W[/api/ai - Recommendations]
    end
    
    subgraph "Backend Services - Supabase"
        X[Supabase Platform] --> Y[PostgreSQL 15 Database]
        X --> Z[Realtime WebSockets]
        X --> AA[Storage CDN]
        X --> AB[Auth JWT System]
        X --> AC[Edge Functions]
        Y --> AD[Row Level Security]
        Y --> AE[25+ Tables]
        Y --> AF[Triggers & Functions]
    end
    
    subgraph "External Services"
        AG[Stripe API] --> AH[Credit Card Payments]
        AI[AbacatePay] --> AJ[PIX Payments Brazil]
        AK[IBGE API] --> AL[Brazilian Location Data]
        AM[WebRTC] --> AN[Video/Voice Calls]
        AO[Redis Cache] --> AP[Session Management]
    end
    
    subgraph "Infrastructure"
        AQ[Vercel Platform] --> AR[Global Edge Network]
        AQ --> AS[Serverless Functions]
        AQ --> AT[Image Optimization]
        AU[Cloudflare] --> AV[DDoS Protection]
        AU --> AW[Global CDN]
    end
    
    H -.-> O
    O -.-> X
    O -.-> AG
    O -.-> AI
    O -.-> AK
    R -.-> AM
    O -.-> AO
    AA -.-> AW
    
    style A fill:#ff6b6b,stroke:#ff5252,color:#fff
    style X fill:#4ecdc4,stroke:#45b7b8,color:#fff
    style AG fill:#5c7cfa,stroke:#4c6ef5,color:#fff
    style AQ fill:#ffe66d,stroke:#ffd43b,color:#333
```

## Database Schema (25+ Tables)

```mermaid
erDiagram
    users ||--o{ posts : creates
    users ||--o{ comments : writes
    users ||--o{ likes : gives
    users ||--o{ follows : has
    users ||--o{ friends : connects
    users ||--o{ messages : sends
    users ||--o{ notifications : receives
    users ||--o{ subscriptions : owns
    users ||--o{ events : organizes
    users ||--o{ communities : joins
    users ||--o{ verification_requests : submits
    users ||--o{ user_monthly_usage : tracks
    users ||--o{ saved_posts : saves
    users ||--o{ blocked_users : blocks
    
    posts ||--o{ comments : contains
    posts ||--o{ likes : receives
    posts ||--o{ post_shares : shared
    posts ||--o{ saved_posts : bookmarked
    posts ||--o{ post_reports : reported
    posts ||--o{ post_views : viewed
    
    conversations ||--o{ messages : contains
    conversations ||--o{ conversation_participants : involves
    
    events ||--o{ event_participants : attended_by
    communities ||--o{ community_members : has_members
    communities ||--o{ posts : contains_posts
    
    users {
        uuid id PK
        uuid auth_id FK "Supabase Auth"
        string username UK "Unique handle"
        string email UK
        string name
        text bio
        string avatar_url
        string cover_url
        date birth_date
        string gender
        string profile_type "single/couple"
        string location
        string city
        string uf "State code"
        decimal latitude
        decimal longitude
        array interests
        array seeking
        array looking_for
        boolean is_premium
        string premium_type "free/gold/diamond"
        timestamp premium_expires_at
        string stripe_customer_id
        string abacatepay_customer_id
        jsonb privacy_settings
        jsonb notification_settings
        jsonb stats "followers/following counts"
        boolean is_verified
        boolean is_active
        timestamp last_active_at
        timestamp created_at
    }
    
    posts {
        uuid id PK
        uuid user_id FK
        text content "Up to 2000 chars"
        array media_urls "Up to 10 items"
        array media_types "image/video/audio"
        array media_thumbnails
        string visibility "public/friends/private"
        boolean is_premium_content
        decimal price "For paid content"
        array poll_options "Diamond feature"
        string location
        decimal latitude
        decimal longitude
        array hashtags
        array mentions
        boolean is_event
        jsonb event_details
        jsonb stats "likes/comments/shares/views"
        boolean is_reported
        boolean is_hidden
        timestamp created_at
    }
    
    messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        string type "text/image/video/audio/file"
        array media_urls
        uuid reply_to_id FK
        boolean is_edited
        boolean is_deleted
        boolean is_read
        integer read_count
        timestamp delivered_at
        timestamp created_at
    }
    
    subscriptions {
        uuid id PK
        uuid user_id FK
        string plan_type "gold/diamond"
        string status "active/cancelled/expired"
        string provider "stripe/abacatepay"
        string provider_subscription_id
        timestamp current_period_start
        timestamp current_period_end
        boolean cancel_at_period_end
        decimal price
        string currency "BRL"
        jsonb metadata
        timestamp created_at
    }
    
    notifications {
        uuid id PK
        uuid recipient_id FK
        uuid sender_id FK
        string type "like/comment/follow/message"
        string title
        text message
        jsonb related_data
        boolean is_read
        timestamp read_at
        boolean sent_via_email
        timestamp created_at
    }
```

## Authentication & Payment Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Supabase
    participant Database
    participant PaymentGateway
    
    rect rgb(255, 240, 240)
        Note over User,PaymentGateway: Registration with Premium Plan
        User->>Frontend: Access /auth/signup
        Frontend->>User: Show signup form + plans
        User->>Frontend: Select Diamond Plan
        Frontend->>API: POST /api/auth/register
        API->>Supabase: Create auth user
        Supabase-->>API: Return auth token
        API->>Database: Create user profile
        Database-->>API: Profile created
        
        API->>PaymentGateway: Initialize checkout
        Note over PaymentGateway: Stripe for cards, AbacatePay for PIX
        PaymentGateway-->>API: Checkout session
        API-->>Frontend: Redirect URL
        Frontend->>User: Payment page
        User->>PaymentGateway: Complete payment
        
        PaymentGateway->>API: Webhook: payment.success
        API->>Database: Update user premium status
        API->>Database: Create subscription record
        Database-->>API: Premium activated
        
        API-->>Frontend: Success response
        Frontend->>User: Welcome to Diamond!
    end
    
    rect rgb(240, 255, 240)
        Note over User,Database: Regular Login Flow
        User->>Frontend: Access /auth/signin
        Frontend->>Supabase: signInWithPassword()
        Supabase-->>Frontend: Session + JWT
        Frontend->>API: GET /api/profile/me
        API->>Database: Fetch full profile
        Database-->>API: User data + premium status
        API-->>Frontend: Complete profile
        Frontend->>User: Personalized timeline
    end
```

## Real-time Architecture

```mermaid
graph TB
    subgraph "Chat System"
        A[User sends message] --> B[Chat Component]
        B --> C[Supabase Realtime]
        C --> D[PostgreSQL Insert]
        D --> E[Trigger notification]
        C --> F[WebSocket broadcast]
        F --> G[Update all participants]
        
        H[Typing indicator] -.-> C
        I[Read receipts] -.-> C
        J[Online presence] -.-> C
    end
    
    subgraph "Notifications"
        K[User action] --> L[Create notification]
        L --> M[Insert to DB]
        M --> N[Realtime broadcast]
        N --> O[Update badge count]
        N --> P[Show toast]
        N --> Q[Play sound]
        
        R[Email notifications] -.-> M
        S[Push notifications] -.-> M
    end
    
    subgraph "Timeline Updates"
        T[New post] --> U[Insert post]
        U --> V[Update followers feeds]
        U --> W[Update hashtag feeds]
        U --> X[Update location feeds]
        U --> Y[AI recommendation update]
        
        V --> Z[Realtime channel]
        W --> Z
        X --> Z
        Z --> AA[Push to online users]
    end
    
    subgraph "WebRTC Features"
        AB[Voice call] --> AC[Signaling server]
        AD[Video call] --> AC
        AE[Screen share] --> AC
        AC --> AF[P2P connection]
        AF --> AG[Direct communication]
    end
    
    style A fill:#ff6b6b
    style K fill:#4ecdc4
    style T fill:#5c7cfa
    style AB fill:#ffe66d
```

## Premium Plans & Features

```mermaid
graph LR
    subgraph "Free Plan"
        A[Basic Features]
        A --> A1[1 image per post]
        A --> A2[Text posts only]
        A --> A3[Follow users]
        A --> A4[View public content]
        A --> A5[Basic profile]
        A --> A6[❌ No messages]
        A --> A7[❌ No events]
        A --> A8[❌ No communities]
    end
    
    subgraph "Gold Plan - R$25/month"
        B[Enhanced Features]
        B --> B1[✅ 5 images per post]
        B --> B2[✅ Video upload 25MB]
        B --> B3[✅ Audio recording]
        B --> B4[✅ Unlimited messages]
        B --> B5[✅ Create 2 events/month]
        B --> B6[✅ Join 3 communities]
        B --> B7[✅ Gold badge]
        B --> B8[✅ Priority support]
    end
    
    subgraph "Diamond Plan - R$45.90/month"
        C[Premium Features]
        C --> C1[✅ 10 images per post]
        C --> C2[✅ Video upload 50MB]
        C --> C3[✅ Create polls]
        C --> C4[✅ Voice/Video calls]
        C --> C5[✅ Create 10 events/month]
        C --> C6[✅ Join 5 communities]
        C --> C7[✅ Create private communities]
        C --> C8[✅ Analytics dashboard]
        C --> C9[✅ Verified badge ⭐]
        C --> C10[✅ Profile visitors]
        C --> C11[✅ Advanced filters]
        C --> C12[✅ No ads]
    end
    
    subgraph "Diamond Annual - R$459/year"
        D[Best Value]
        D --> D1[✅ All Diamond features]
        D --> D2[✅ Save R$91.80/year]
        D --> D3[✅ Exclusive badge]
        D --> D4[✅ Early access features]
    end
    
    style A fill:#e0e0e0
    style B fill:#ffd700
    style C fill:#b9f2ff
    style D fill:#ff6b6b
```

## AI Recommendation System

```mermaid
graph TB
    subgraph "Data Collection Layer"
        A[User Interactions] --> B[Likes/Comments]
        A --> C[View Time]
        A --> D[Profile Visits]
        A --> E[Message Patterns]
        A --> F[Search Queries]
        A --> G[Location Data]
    end
    
    subgraph "Feature Engineering"
        B --> H[Engagement Score]
        C --> H
        D --> I[Interest Signals]
        E --> I
        F --> J[Explicit Preferences]
        G --> K[Geographic Relevance]
        
        L[User Profile] --> M[Demographics]
        L --> N[Stated Interests]
        L --> O[Relationship Goals]
    end
    
    subgraph "ML Algorithms"
        H --> P[Collaborative Filtering]
        I --> P
        J --> Q[Content-Based Filtering]
        M --> Q
        N --> Q
        O --> Q
        K --> R[Location Matching]
        
        P --> S[Hybrid Algorithm]
        Q --> S
        R --> S
    end
    
    subgraph "Scoring Engine"
        S --> T[Calculate Compatibility]
        T --> U[Apply Weights]
        U --> V[Business Rules]
        V --> W[Diversity Filter]
        W --> X[Final Ranking]
    end
    
    subgraph "Delivery Channels"
        X --> Y[For You Timeline]
        X --> Z[Profile Suggestions]
        X --> AA[Event Recommendations]
        X --> AB[Community Suggestions]
        X --> AC[Open Dates Matches]
    end
    
    subgraph "Feedback Loop"
        Y --> AD[Track Performance]
        Z --> AD
        AA --> AD
        AB --> AD
        AC --> AD
        AD --> AE[Update Model]
        AE --> P
        AE --> Q
    end
    
    style A fill:#ff6b6b
    style S fill:#4ecdc4
    style X fill:#5c7cfa
    style AD fill:#ffe66d
```

## Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        A[User Request] --> B[HTTPS Only]
        B --> C[CSRF Protection]
        C --> D[XSS Prevention]
        D --> E[Input Sanitization]
    end
    
    subgraph "Authentication Layer"
        E --> F[JWT Validation]
        F --> G{Valid Token?}
        G -->|No| H[401 Unauthorized]
        G -->|Yes| I[Extract User Context]
        I --> J[Check Permissions]
    end
    
    subgraph "API Security"
        J --> K[Rate Limiting]
        K --> L[Request Validation]
        L --> M[Zod Schemas]
        M --> N[SQL Injection Prevention]
        N --> O[Business Logic]
    end
    
    subgraph "Database Security"
        O --> P[Row Level Security]
        P --> Q[User Isolation]
        P --> R[Friend Access]
        P --> S[Public Content]
        
        T[Encryption] --> U[Data at Rest]
        T --> V[Data in Transit]
        
        W[Audit Logs] --> X[All Changes Tracked]
    end
    
    subgraph "Content Security"
        Y[Media Upload] --> Z[Virus Scan]
        Y --> AA[Type Validation]
        Y --> AB[Size Limits]
        
        AC[User Content] --> AD[Profanity Filter]
        AC --> AE[Spam Detection]
        AC --> AF[NSFW Detection]
    end
    
    subgraph "Privacy Controls"
        AG[Profile Settings] --> AH[Visibility Control]
        AI[Message Settings] --> AJ[Contact Restrictions]
        AK[Block System] --> AL[User Blocking]
        AM[Data Export] --> AN[GDPR Compliance]
    end
    
    style A fill:#ff6b6b
    style P fill:#4ecdc4
    style Y fill:#5c7cfa
    style AG fill:#ffe66d
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Dev] --> B[Next.js Dev Server]
        B --> C[Hot Reload]
        B --> D[TypeScript Watch]
        B --> E[Supabase Local]
    end
    
    subgraph "CI/CD Pipeline"
        F[Git Push] --> G[GitHub]
        G --> H[Vercel Build]
        H --> I[Type Check]
        H --> J[Lint Check]
        H --> K[Build Assets]
        I --> L{Pass?}
        J --> L
        K --> L
        L -->|No| M[Fail Build]
        L -->|Yes| N[Deploy Preview]
    end
    
    subgraph "Production Environment"
        N --> O[Automated Tests]
        O --> P{Tests Pass?}
        P -->|No| Q[Rollback]
        P -->|Yes| R[Deploy to Edge]
        
        R --> S[Vercel Edge Network]
        S --> T[Global CDN]
        S --> U[Serverless Functions]
        S --> V[Image Optimization]
        
        W[Supabase Cloud] --> X[PostgreSQL Cluster]
        W --> Y[Realtime Infrastructure]
        W --> Z[Storage Network]
    end
    
    subgraph "Monitoring"
        AA[Vercel Analytics] --> AB[Performance Metrics]
        AC[Custom Analytics] --> AD[User Behavior]
        AE[Error Tracking] --> AF[Sentry Integration]
        AG[Uptime Monitor] --> AH[Status Page]
    end
    
    S -.-> W
    AB --> AI[Alerts]
    AD --> AI
    AF --> AI
    AH --> AI
    
    style A fill:#ff6b6b
    style G fill:#4ecdc4
    style S fill:#5c7cfa
    style AA fill:#ffe66d
```

## Project Statistics

- **Total Files**: 850+
- **React Components**: 120+
- **API Endpoints**: 65+
- **Database Tables**: 25+
- **Lines of Code**: 45,000+
- **Development Time**: 3 months
- **Current Version**: 0.3.0-alpha.2

## Technology Stack Summary

### Frontend
- Next.js 15.3.5 (App Router)
- React 19.1.0
- TypeScript 5
- Tailwind CSS 3.4
- Hero UI Components
- Framer Motion 12
- Zustand State Management

### Backend
- Supabase (PostgreSQL 15)
- Redis Cache
- WebRTC for calls
- Edge Functions

### Payments
- Stripe (International)
- AbacatePay (Brazil PIX)

### Infrastructure
- Vercel (Hosting)
- Cloudflare (CDN/DDoS)
- GitHub (Version Control)

---

*Generated: January 27, 2025*
*OpenLove - Connecting people through love and technology*