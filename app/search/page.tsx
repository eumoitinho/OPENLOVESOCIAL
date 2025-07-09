import SearchContent from "./SearchContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buscar - ConnectHub",
  description: "Encontre pessoas, comunidades e eventos no ConnectHub",
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
