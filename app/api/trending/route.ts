import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Buscar hashtags mais populares dos últimos 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: posts, error } = await supabase
      .from("posts")
      .select("hashtags, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .not("hashtags", "is", null)

    if (error) {
      console.error("Erro ao buscar posts para trending:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    // Processar hashtags e contar ocorrências
    const hashtagCount: { [key: string]: number } = {}
    
    posts?.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach((tag: string) => {
          const cleanTag = tag.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (cleanTag.length > 0) {
            hashtagCount[cleanTag] = (hashtagCount[cleanTag] || 0) + 1
          }
        })
      }
    })

    // Converter para array e ordenar por popularidade
    const trendingTopics = Object.entries(hashtagCount)
      .map(([name, count]) => ({
        id: name,
        name,
        count,
        description: `Trending topic com ${count} menções`
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20

    return NextResponse.json({ data: trendingTopics })
  } catch (error) {
    console.error("Erro na API de trending:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
} 