import { createRouteHandlerClient } from "@/app/lib/supabase-server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/app/lib/database.types"

export async function GET() {
const supabase = await createRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  // Buscar ou criar perfil do usuário
  let { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error && error.code === 'PGRST116') {
    // Usuário não existe na tabela users, criar automaticamente
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "user_" + user.id.substring(0, 8),
        name: user.user_metadata?.full_name || "Usuário",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        premium_type: 'free'
      })
      .select()
      .single()

    if (insertError) {
      console.error("Erro ao criar perfil na tabela users:", insertError)
      return new NextResponse(JSON.stringify({ error: "Erro ao criar perfil de usuário", details: insertError }), { status: 500 })
    }
    
    data = newUser
  } else if (error) {
    console.error("Erro ao buscar perfil:", error)
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
 const supabase = await createRouteHandlerClient()
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
