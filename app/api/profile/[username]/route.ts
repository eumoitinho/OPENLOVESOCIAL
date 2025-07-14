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
        first_name,
        last_name,
        bio,
        avatar_url,
        cover_url,
        location,
        birth_date,
        interests,
        created_at,
        is_premium,
        is_verified
      `)
      .eq('username', username)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar estatísticas
    const { data: stats, error: statsError } = await supabase
      .from('users')
      .select(`
        posts:posts(count),
        followers:follows!follows_followed_id_fkey(count),
        following:follows!follows_follower_id_fkey(count),
        profile_views:profile_views(count)
      `)
      .eq('username', username)
      .single()

    // Buscar posts do usuário
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        media_urls,
        media_types,
        created_at,
        likes_count,
        comments_count
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Verificar se o usuário atual está seguindo este perfil
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    let isFollowing = false

    if (currentUser && currentUser.id !== user.id) {
      const { data: followData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('followed_id', user.id)
        .single()

      isFollowing = !!followData
    }

    // Incrementar visualização do perfil
    if (currentUser && currentUser.id !== user.id) {
      await supabase
        .from('profile_views')
        .insert({
          viewer_id: currentUser.id,
          viewed_user_id: user.id
        })
        .select()
    }

    const profileData = {
      ...user,
      stats: {
        posts: stats?.posts?.[0]?.count || 0,
        followers: stats?.followers?.[0]?.count || 0,
        following: stats?.following?.[0]?.count || 0,
        profile_views: stats?.profile_views?.[0]?.count || 0
      }
    }

    return NextResponse.json({
      profile: profileData,
      posts: posts || [],
      is_following: isFollowing
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}