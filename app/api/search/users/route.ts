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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json([])
    }

    // Get user's profile_id
    const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Search for users
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, location")
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
      .neq("id", profile.id)
      .limit(20)

    if (error) {
      console.error("Error searching users:", error)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    // Check friendship status for each user
    const userIds = users?.map((u) => u.id) || []
    const { data: friendships } = await supabase
      .from("friendships")
      .select("friend_id, status")
      .eq("user_id", profile.id)
      .in("friend_id", userIds)

    const friendshipMap = new Map()
    friendships?.forEach((f) => {
      friendshipMap.set(f.friend_id, f.status)
    })

    const results =
      users?.map((u) => ({
        ...u,
        is_friend: friendshipMap.get(u.id) === "accepted",
        request_sent: friendshipMap.get(u.id) === "pending",
      })) || []

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in user search API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
