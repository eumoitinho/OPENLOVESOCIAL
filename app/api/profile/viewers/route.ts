import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createRouteHandlerClient()
  const {
    data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

      const { data: profile } = await supabase.from("users").select("is_premium").eq("id", user.id).single()

  if (!profile || !profile.is_premium) {
    return new NextResponse(JSON.stringify({ error: "Only premium users can view profile viewers" }), {
      status: 403 })
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
