import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let username = searchParams.get("username")
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false })
  }
  username = username.trim().toLowerCase()
  const supabase = createRouteHandlerClient({ cookies })
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle()
  if (error) {
    return NextResponse.json({ available: false })
  }
  return NextResponse.json({ available: !data })
} 