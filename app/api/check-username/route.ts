import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let username = searchParams.get("username")
  
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false })
  }
  
  username = username.trim().toLowerCase()
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle()
    
    if (error) {
      console.error("Erro ao verificar username:", error)
      return NextResponse.json({ available: false })
    }
    
    return NextResponse.json({ available: !data })
  } catch (error) {
    console.error("Erro na verificação de username:", error)
    return NextResponse.json({ available: false })
  }
} 