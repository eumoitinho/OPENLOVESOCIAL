import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase-server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Buscar trending topics baseado em hashtags mais usadas
    const { data: trendingTopics, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        hashtags
      `)
      .not('hashtags', 'is', null)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 dias
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Erro ao buscar trending topics:', error)
      return NextResponse.json({ error: 'Erro ao buscar trending topics' }, { status: 500 })
    }

    // Processar hashtags e contar ocorrências
    const hashtagCounts: Record<string, { count: number, category: string, isHot: boolean }> = {}
    
    trendingTopics?.forEach(post => {
      if (post.hashtags) {
        const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [post.hashtags]
        hashtags.forEach(hashtag => {
          if (hashtag && typeof hashtag === 'string') {
            const cleanHashtag = hashtag.replace('#', '').toLowerCase()
            if (!hashtagCounts[cleanHashtag]) {
              hashtagCounts[cleanHashtag] = { count: 0, category: 'general', isHot: false }
            }
            hashtagCounts[cleanHashtag].count++
          }
        })
      }
    })

    // Converter para formato da interface
    const trending = Object.entries(hashtagCounts)
      .filter(([_, data]) => data.count > 1) // Pelo menos 2 posts
      .sort(([_, a], [__, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([hashtag, data], index) => ({
        id: `trending-${index}`,
        hashtag: hashtag.charAt(0).toUpperCase() + hashtag.slice(1),
        postCount: data.count,
        growth: Math.floor(Math.random() * 50) + 10, // Simulado por enquanto
        category: data.category,
        isHot: data.count > 5
      }))

    return NextResponse.json({ trending })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 