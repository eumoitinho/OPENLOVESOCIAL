import { getCurrentUser } from "@/app/lib/auth-helpers"
import AdminContent from "./AdminContent"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/app/lib/database.types"



export const metadata: Metadata = {
  title: "Painel Admin - Openlove",
  description: "Painel de administração do Openlove",
}

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const supabase = createServerComponentClient<Database>({ cookies })
  // Buscar perfil do usuário na tabela profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Verificar se usuário é admin
  if (!profile || !["admin", "moderator"].includes(profile.role ?? "")) {
    redirect("/dashboard")
  }

  // Buscar estatísticas básicas
  const [
    { count: totalUsers },
    { count: totalCommunities },
    { count: totalEvents },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("communities").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("id, username, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  return (
    <AdminContent
      user={user}
      profile={profile}
      stats={{
        totalUsers: totalUsers || 0,
        totalCommunities: totalCommunities || 0,
        totalEvents: totalEvents || 0,
        pendingReports: 0,
      }}
      recentReports={[]}
      recentUsers={recentUsers || []}
    />
  )
}