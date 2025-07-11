import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"
import redis from "@/lib/redis"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const interests = searchParams.get("interests")?.split(",").filter(Boolean) || []
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const type = searchParams.get("type") || "users" // users, communities, events

    // CACHE KEY
    const cacheKey = `search:${type}:q:${query}:i:${interests.join("_")}:l:${limit}:o:${offset}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    if (type === "users") {
      const { data, error } = await supabase.rpc("search_users", {
        search_query: query,
        interest_filter: interests,
        limit_count: limit,
        offset_count: offset,
      })

      if (error) {
        console.error("Erro na busca de usuários:", error)
        return NextResponse.json({ error: "Erro na busca" }, { status: 500 })
      }

      const result = { data, type: "users" }
      await redis.set(cacheKey, JSON.stringify(result), "EX", 30)
      return NextResponse.json(result)
    }

    if (type === "communities") {
      let supabaseQuery = supabase
        .from("communities")
        .select(
          `
          id,
          name,
          slug,
          description,
          image_url,
          member_count,
          is_private,
          created_at,
          interest_categories(name, color)
        `,
        )
        .eq("is_private", false)
        .order("member_count", { ascending: false })
        .range(offset, offset + limit - 1)

      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error("Erro na busca de comunidades:", error)
        return NextResponse.json({ error: "Erro na busca" }, { status: 500 })
      }

      const result = { data, type: "communities" }
      await redis.set(cacheKey, JSON.stringify(result), "EX", 30)
      return NextResponse.json(result)
    }

    if (type === "events") {
      let supabaseQuery = supabase
        .from("events")
        .select(
          `
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          is_online,
          event_type,
          image_url,
          price,
          current_participants,
          max_participants,
          communities(name, slug)
        `,
        )
        .eq("is_private", false)
        .eq("is_cancelled", false)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .range(offset, offset + limit - 1)

      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error("Erro na busca de eventos:", error)
        return NextResponse.json({ error: "Erro na busca" }, { status: 500 })
      }

      const result = { data, type: "events" }
      await redis.set(cacheKey, JSON.stringify(result), "EX", 30)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Tipo de busca inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro na API de busca:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
