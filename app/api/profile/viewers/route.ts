import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single()

  if (!profile || !profile.is_premium) {
    return new NextResponse(JSON.stringify({ error: "Only premium users can view profile viewers" }), {
      status: 403,
    })
  }

  const { data, error } = await supabase
    .from("profile_views")
    .select(
      `
      viewer:profiles!viewer_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("viewed_profile_id", user.id)
    .order("viewed_at", { ascending: false })
    .limit(20)

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const viewers = data.map(item => item.viewer)

  return NextResponse.json(viewers)
}
