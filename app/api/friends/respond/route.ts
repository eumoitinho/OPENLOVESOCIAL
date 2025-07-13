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

    const { request_id, accept } = await request.json()

    if (accept) {
      // Accept the request
      const { error } = await supabase.from("friends").update({ status: "accepted" }).eq("id", request_id)

      if (error) {
        console.error("Error accepting friend request:", error)
        return NextResponse.json({ error: "Failed to accept request" }, { status: 500 })
      }

      // Create reciprocal friendship
      const { data: request_data } = await supabase
        .from("friends")
        .select("user_id, friend_id")
        .eq("id", request_id)
        .single()

      if (request_data) {
        await supabase.from("friends").insert({
          user_id: request_data.friend_id,
          friend_id: request_data.user_id,
          status: "accepted",
        })
      }
    } else {
      // Reject the request
      const { error } = await supabase.from("friends").delete().eq("id", request_id)

      if (error) {
        console.error("Error rejecting friend request:", error)
        return NextResponse.json({ error: "Failed to reject request" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in friend respond API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
