import EventsContent from "./EventsContent"
import { createServerSupabaseClient } from "@/lib/auth-helpers"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eventos - ConnectHub",
  description: "Descubra e participe de eventos incríveis no ConnectHub",
}

export default async function EventsPage() {
  const supabase = createServerSupabaseClient()

  // Buscar eventos públicos
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      description,
      start_date,
      end_date,
      location,
      is_online,
      event_type,
      image_url,
      price,
      current_participants,
      max_participants,
      is_cancelled,
      communities(name, slug)
    `,
    )
    .eq("is_private", false)
    .eq("is_cancelled", false)
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: true })

  if (error) {
    console.error("Erro ao buscar eventos:", error)
  }

  return <EventsContent initialEvents={events || []} />
}
