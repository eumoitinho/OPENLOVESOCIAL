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
      requests?.map((r) => {
        const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
        return {
          id: r.id,
          created_at: r.created_at,
          sender: {
            id: profile.id,
            full_name: profile.full_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
            location: profile.location,
          },
        }
      }) || []

    return NextResponse.json(friendRequests)
  } catch (error) {
    console.error("Error in friend requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
