import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const profileData = await request.json()
  console.log("Atualizando perfil do usuário:", profileData)

  // Remove id and other non-updatable fields
  delete profileData.id
  delete profileData.created_at
  delete profileData.updated_at

  const { data, error } = await supabase
          .from("users")
    .update(profileData)
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return NextResponse.json(data)
}
