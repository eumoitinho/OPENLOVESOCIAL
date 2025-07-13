import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  const supabase = await createRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const friendId = params.userId

  if (!friendId) {
    return new NextResponse(JSON.stringify({ error: "Friend ID is required" }), { status: 400 })
  }

  const { error } = await supabase
    .from("friends")
    .delete()
    .or(`(user_id.eq.${user.id},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${user.id})`)

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return NextResponse.json({ success: true })
}
