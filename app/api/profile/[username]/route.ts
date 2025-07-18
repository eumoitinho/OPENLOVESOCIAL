import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase-server'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const supabase = await createRouteHandlerClient()
    
    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        name,
        bio,
        avatar_url,
        is_verified,
        is_premium,
        is_active,
        last_seen,
        created_at,
        plano
      `)
      .eq('username', username)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário atual está seguindo este perfil
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    let isFollowing = false
    let isOwnProfile = false
    let canViewPrivateContent = false

    if (currentUser) {
      isOwnProfile = currentUser.id === user.id
      
      if (!isOwnProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', user.id)
          .eq('status', 'accepted')
          .single()

        isFollowing = !!followData
      }
    }

    // Determinar se pode ver conteúdo privado
    canViewPrivateContent = isOwnProfile || isFollowing

    // Buscar estatísticas
    const [postsCount, followersCount, followingCount, profileViewsCount] = await Promise.all([
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('visibility', canViewPrivateContent ? ['public', 'friends_only'] : ['public']),
      
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', user.id)
        .eq('status', 'accepted'),
      
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('status', 'accepted'),
      
      supabase
        .from('profile_views')
        .select('id', { count: 'exact', head: true })
        .eq('viewed_profile_id', user.id)
    ])

    // Buscar posts do usuário (respeitando privacidade)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        media_urls,
        media_types,
        hashtags,
        visibility,
        location,
        is_premium_content,
        stats,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .in('visibility', canViewPrivateContent ? ['public', 'friends_only'] : ['public'])
      .order('created_at', { ascending: false })
      .limit(20)

    // Buscar posts com mídia para galeria
    const { data: mediaPosts } = await supabase
      .from('posts')
      .select(`
        id,
        media_urls,
        media_types,
        created_at
      `)
      .eq('user_id', user.id)
      .in('visibility', canViewPrivateContent ? ['public', 'friends_only'] : ['public'])
      .not('media_urls', 'is', null)
      .order('created_at', { ascending: false })
      .limit(12)

    // Incrementar visualização do perfil
    if (currentUser && currentUser.id !== user.id) {
      await supabase
        .from('profile_views')
        .insert({
          viewer_id: currentUser.id,
          viewed_profile_id: user.id
        })
        .select()
    }

    const profileData = {
      ...user,
      stats: {
        posts: postsCount.count || 0,
        followers: followersCount.count || 0,
        following: followingCount.count || 0,
        profile_views: profileViewsCount.count || 0
      },
      privacy: {
        is_own_profile: isOwnProfile,
        can_view_private_content: canViewPrivateContent
      }
    }

    return NextResponse.json({
      profile: profileData,
      posts: posts || [],
      media_posts: mediaPosts || [],
      is_following: isFollowing,
      is_own_profile: isOwnProfile,
      can_view_private_content: canViewPrivateContent
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}