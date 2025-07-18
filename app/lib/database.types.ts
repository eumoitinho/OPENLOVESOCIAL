export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          bio: string | null
          avatar_url: string | null
          interests: string[]
          location: string | null
          website: string | null
          is_verified: boolean
          is_premium: boolean
          profile_type: 'single' | 'couple' | 'trans' | 'other'
          city: string | null
          latitude: number | null
          longitude: number | null
          username_changed: boolean
          role: 'user' | 'moderator' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          bio?: string | null
          avatar_url?: string | null
          interests?: string[]
          location?: string | null
          website?: string | null
          is_verified?: boolean
          is_premium?: boolean
          profile_type?: 'single' | 'couple' | 'trans' | 'other'
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          username_changed?: boolean
          role?: 'user' | 'moderator' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          bio?: string | null
          avatar_url?: string | null
          interests?: string[]
          location?: string | null
          website?: string | null
          is_verified?: boolean
          is_premium?: boolean
          profile_type?: 'single' | 'couple' | 'trans' | 'other'
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          username_changed?: boolean
          role?: 'user' | 'moderator' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string
          viewed_profile_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          viewer_id: string
          viewed_profile_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          viewer_id?: string
          viewed_profile_id?: string
          viewed_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          recommender_id: string
          recommended_profile_id: string
          target_profile_id: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recommender_id: string
          recommended_profile_id: string
          target_profile_id: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recommender_id?: string
          recommended_profile_id?: string
          target_profile_id?: string
          message?: string | null
          created_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          user_id: string
          url: string
          filename: string
          original_name: string
          file_type: 'image' | 'video'
          mime_type: string
          file_size: number
          width: number | null
          height: number | null
          duration: number | null
          alt_text: string | null
          is_profile_picture: boolean
          is_public: boolean
          visibility: 'public' | 'friends_only'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          filename: string
          original_name: string
          file_type: 'image' | 'video'
          mime_type: string
          file_size: number
          width?: number | null
          height?: number | null
          duration?: number | null
          alt_text?: string | null
          is_profile_picture?: boolean
          is_public?: boolean
          visibility?: 'public' | 'friends_only'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          filename?: string
          original_name?: string
          file_type?: 'image' | 'video'
          mime_type?: string
          file_size?: number
          width?: number | null
          height?: number | null
          duration?: number | null
          alt_text?: string | null
          is_profile_picture?: boolean
          is_public?: boolean
          visibility?: 'public' | 'friends_only'
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          category_id: string | null
          image_url: string | null
          banner_url: string | null
          is_private: boolean
          member_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          category_id?: string | null
          image_url?: string | null
          banner_url?: string | null
          is_private?: boolean
          member_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          category_id?: string | null
          image_url?: string | null
          banner_url?: string | null
          is_private?: boolean
          member_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          media_urls: string[] | null
          media_types: string[] | null
          hashtags: string[] | null
          mentions: string[] | null
          visibility: 'public' | 'friends_only' | 'private'
          is_event: boolean
          event_details: Json | null
          location: string | null
          is_premium_content: boolean
          price: number | null
          stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          media_urls?: string[] | null
          media_types?: string[] | null
          hashtags?: string[] | null
          mentions?: string[] | null
          visibility?: 'public' | 'friends_only' | 'private'
          is_event?: boolean
          event_details?: Json | null
          location?: string | null
          is_premium_content?: boolean
          price?: number | null
          stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          media_urls?: string[] | null
          media_types?: string[] | null
          hashtags?: string[] | null
          mentions?: string[] | null
          visibility?: 'public' | 'friends_only' | 'private'
          is_event?: boolean
          event_details?: Json | null
          location?: string | null
          is_premium_content?: boolean
          price?: number | null
          stats?: Json
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_type?: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_id: string | null
          stats: Json
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_id?: string | null
          stats?: Json
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          stats?: Json
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
        }
      }
      saved_posts: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          viewed_at?: string
        }
      }
      post_shares: {
        Row: {
          id: string
          post_id: string
          user_id: string
          shared_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          shared_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          shared_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          updated_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          post_id: string
          question: string
          options: Json
          total_votes: number
          expires_at: string | null
          allow_multiple_votes: boolean
          is_voting_closed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          question: string
          options: Json
          total_votes?: number
          expires_at?: string | null
          allow_multiple_votes?: boolean
          is_voting_closed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          question?: string
          options?: Json
          total_votes?: number
          expires_at?: string | null
          allow_multiple_votes?: boolean
          is_voting_closed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          option_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          option_ids: string[]
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          option_ids?: string[]
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          is_verified: boolean
          is_premium: boolean
          is_active: boolean
          last_seen: string | null
          created_at: string
          updated_at: string
          // Campos de assinatura
          plano: 'free' | 'gold' | 'diamante' | 'diamante_anual'
          status_assinatura: 'inactive' | 'pending' | 'authorized' | 'cancelled' | 'suspended'
          ultimo_pagamento: string | null
          proximo_pagamento: string | null
          // Mercado Pago
          mp_customer_id: string | null
          mp_subscription_id: string | null
          // Stripe
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          payment_provider: 'mercadopago' | 'stripe'
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          is_verified?: boolean
          is_premium?: boolean
          is_active?: boolean
          last_seen?: string | null
          created_at?: string
          updated_at?: string
          // Campos de assinatura
          plano?: 'free' | 'gold' | 'diamante' | 'diamante_anual'
          status_assinatura?: 'inactive' | 'pending' | 'authorized' | 'cancelled' | 'suspended'
          ultimo_pagamento?: string | null
          proximo_pagamento?: string | null
          // Mercado Pago
          mp_customer_id?: string | null
          mp_subscription_id?: string | null
          // Stripe
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          payment_provider?: 'mercadopago' | 'stripe'
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          is_verified?: boolean
          is_premium?: boolean
          is_active?: boolean
          last_seen?: string | null
          created_at?: string
          updated_at?: string
          // Campos de assinatura
          plano?: 'free' | 'gold' | 'diamante' | 'diamante_anual'
          status_assinatura?: 'inactive' | 'pending' | 'authorized' | 'cancelled' | 'suspended'
          ultimo_pagamento?: string | null
          proximo_pagamento?: string | null
          // Mercado Pago
          mp_customer_id?: string | null
          mp_subscription_id?: string | null
          // Stripe
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          payment_provider?: 'mercadopago' | 'stripe'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_profile_view: {
        Args: { target_profile_id: string }
        Returns: boolean
      }
      are_mutual_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      can_send_message: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_profile_view_stats: {
        Args: { target_profile_id?: string }
        Returns: {
          total_views: number
          unique_viewers: number
          views_today: number
          views_this_week: number
          views_this_month: number
        }[]
      }
      get_received_recommendations: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          recommender_username: string
          recommender_full_name: string
          recommender_avatar_url: string | null
          recommended_username: string
          recommended_full_name: string
          recommended_avatar_url: string | null
          message: string | null
          created_at: string
        }[]
      }
      search_users: {
        Args: {
          search_query?: string
          interest_filter?: string[]
          profile_type_filter?: string
          user_lat?: number
          user_lng?: number
          max_distance_km?: number
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          username: string
          full_name: string
          bio: string | null
          avatar_url: string | null
          interests: string[]
          location: string | null
          profile_type: string
          is_verified: boolean
          is_premium: boolean
          distance_km: number | null
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
