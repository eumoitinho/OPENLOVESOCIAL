import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"
import { verifyAuth } from "@/app/lib/auth-helpers"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // Verificar autenticação e timeout de sessão
  const { user, error: authError } = await verifyAuth()
  if (authError || !user) {
    // Don't return an error, just fail silently
    return NextResponse.json({ success: false })
  }

  const { profile_id } = await request.json()

  if (!profile_id) {
    return NextResponse.json({ success: false })
  }

  // Don't register a view for the user's own profile
  if (user.id === profile_id) {
    return NextResponse.json({ success: false })
  }

  const { error } = await supabase.rpc("register_profile_view", {
    target_profile_id: profile_id,
  })

  if (error) {
    console.error("Error registering profile view:", error)
    return NextResponse.json({ success: false })
  }

  return NextResponse.json({ success: true })
}
