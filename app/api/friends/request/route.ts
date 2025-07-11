import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user_id: targetUserId } = await request.json()

    // Get user's profile_id
    const { data: profile } = await supabase.from("users").select("id").eq("user_id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from("friendships")
      .select("id")
      .or(
        `and(user_id.eq.${profile.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${profile.id})`,
      )
      .single()

    if (existing) {
      return NextResponse.json({ error: "Friendship already exists" }, { status: 400 })
    }

    // Create friend request
    const { error } = await supabase.from("friendships").insert({
      user_id: profile.id,
      friend_id: targetUserId,
      status: "pending",
    })

    if (error) {
      console.error("Error creating friend request:", error)
      return NextResponse.json({ error: "Failed to send request" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in friend request API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
