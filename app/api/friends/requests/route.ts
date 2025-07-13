import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // Get pending friend requests
    const { data: requests, error } = await supabase
      .from("friends")
      .select(`
        id,
        created_at,
        user_id,
        profiles!friendships_user_id_fkey (
          id,
          full_name,
          username,
          avatar_url,
          location
        )
      `)
      .eq("friend_id", profile.id)
      .eq("status", "pending")

    if (error) {
      console.error("Error fetching friend requests:", error)
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
    }

    const friendRequests =
      requests?.map((r) => ({
        id: r.id,
        created_at: r.created_at,
        sender: {
          id: r.profiles.id,
          full_name: r.profiles.full_name,
          username: r.profiles.username,
          avatar_url: r.profiles.avatar_url,
          location: r.profiles.location,
        },
      })) || []

    return NextResponse.json(friendRequests)
  } catch (error) {
    console.error("Error in friend requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
