import { getCurrentUser } from "@/app/lib/auth-helpers"
import { createServerComponentClient } from "@/app/lib/supabase-server"
import ProfileContent from "./ProfileContent"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Perfil - OpenLove",
  description: "Gerencie seu perfil no OpenLove",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  const supabase = await createServerComponentClient()
  // Buscar perfil do usuário na tabela profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Buscar mídia do usuário (se a tabela media existir)
  let media = []
  try {
    const { data: mediaData, error: mediaError } = await supabase
      .from("media")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!mediaError && mediaData) {
      media = mediaData
    } else {
      console.log("Tabela media não encontrada ou erro ao buscar mídia:", mediaError)
    }
  } catch (error) {
    console.log("Erro ao buscar mídia:", error)
  }

  return <ProfileContent user={user} profile={profile} initialMedia={media || []} />
}
