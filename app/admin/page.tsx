import { createServerSupabaseClient, getAuthenticatedUser, getUserProfile } from "@/lib/auth-helpers"
import AdminContent from "./AdminContent"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Painel Admin - ConnectHub",
  description: "Painel de administração do ConnectHub",
}

export default async function AdminPage() {
  const user = await getAuthenticatedUser()
  const profile = await getUserProfile(user.id)

  // Verificar se usuário é admin
  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    redirect("/dashboard")
  }

  const supabase = createServerSupabaseClient()

  // Buscar estatísticas e dados para o admin
  const [
    { count: totalUsers },
    { count: totalCommunities },
    { count: totalEvents },
    { count: pendingReports },
    { data: recentReports },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("communities").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("reports")
      .select(
        `
        id,
        report_type,
        description,
        status,
        created_at,
        reporter:profiles!reports_reporter_id_fkey(username, full_name),
        reported_user:profiles!reports_reported_user_id_fkey(username, full_name),
        reported_post:posts(title),
        reported_comment:comments(content)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
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
        pendingReports: pendingReports || 0,
      }}
      recentReports={recentReports || []}
      recentUsers={recentUsers || []}
    />
  )
}
