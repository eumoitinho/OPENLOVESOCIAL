import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's profile_id
    const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get friends
    const { data: friendships, error } = await supabase
      .from("friends")
      .select(`
        friend_id,
        profiles!friendships_friend_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          location
        )
      `)
      .eq("user_id", profile.id)
      .eq("status", "accepted")

    if (error) {
      console.error("Error fetching friends:", error)
      return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
    }

    const friends =
      friendships?.map((f) => ({
        id: f.profiles.id,
        full_name: f.profiles.full_name,
        username: f.profiles.username,
        avatar_url: f.profiles.avatar_url,
        location: f.profiles.location,
        is_friend: true,
      })) || []

    return NextResponse.json(friends)
  } catch (error) {
    console.error("Error in friends API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
