import { createServerSupabaseClient, getAuthenticatedUser, getUserProfile } from "@/app/lib/auth-helpers"
import ProfileContent from "./ProfileContent"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Perfil - ConnectHub",
  description: "Gerencie seu perfil e mídia no ConnectHub",
}

export default async function ProfilePage() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/auth/signin")
  }
  const profile = await getUserProfile(user.id)
  const supabase = await createServerSupabaseClient()

  // Buscar mídia do usuário
  const { data: media, error: mediaError } = await supabase
    .from("media")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (mediaError) {
    console.error("Erro ao buscar mídia:", mediaError)
  }

  return <ProfileContent user={user} profile={profile} initialMedia={media || []} />
}
