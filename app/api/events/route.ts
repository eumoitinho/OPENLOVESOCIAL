import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"

export async function POST(request: Request) {
   const supabase = await createRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { data: profile } = await supabase.from("users").select("is_premium").eq("id", user.id).single()

  if (!profile || !profile.is_premium) {
    return new NextResponse(JSON.stringify({ error: "Only premium users can create events" }), { status: 403 })
  }

  const eventData = await request.json()

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...eventData,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return NextResponse.json(data)
}
