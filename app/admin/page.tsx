import { createServerSupabaseClient, getAuthenticatedUser, getUserProfile } from "@/app/lib/auth-helpers"
import AdminContent from "./AdminContent"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Painel Admin - ConnectHub",
  description: "Painel de administração do ConnectHub",
}

export default async function AdminPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const profile = await getUserProfile(user.id)

  // Verificar se usuário é admin
  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    redirect("/dashboard")
  }

  const supabase = await createServerSupabaseClient()

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
