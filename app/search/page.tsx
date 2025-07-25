import SearchContent from "./SearchContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buscar - Openlove",
  description: "Encontre pessoas, comunidades e eventos no Openlove",
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    interests?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  return (
    <SearchContent
      initialQuery={params.q || ""}
      initialType={params.type || "users"}
      initialInterests={params.interests?.split(",") || []}
    />
  )
}
