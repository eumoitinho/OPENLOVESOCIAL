import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import DashboardClient from "./DashboardClient"
import type { Database } from "@/app/lib/database.types"

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return <DashboardClient user={session.user} profile={profile} />
}
