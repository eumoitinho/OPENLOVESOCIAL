import SearchContent from "./SearchContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buscar - Openlove",
  description: "Encontre pessoas, comunidades e eventos no Openlove",
}

interface SearchPageProps {
  searchParams: {
    q?: string
    type?: string
    interests?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <SearchContent
      initialQuery={searchParams.q || ""}
      initialType={searchParams.type || "users"}
      initialInterests={searchParams.interests?.split(",") || []}
    />
  )
}
