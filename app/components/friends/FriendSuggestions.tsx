"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import type { Profile } from "@/types/database"

interface Suggestion extends Profile {
  mutual_friends_count: number
}

async function fetchFriendSuggestions(): Promise<Suggestion[]> {
  const response = await fetch("/api/friends/suggestions")
  if (!response.ok) {
    throw new Error("Failed to fetch friend suggestions")
  }
  return response.json()
}

export function FriendSuggestions() {
  const { data: suggestions, isLoading, isError } = useQuery({
    queryKey: ["friendSuggestions"],
    queryFn: fetchFriendSuggestions })

  if (isLoading) return <p className="text-sm text-gray-500">Carregando sugestões...</p>
  if (isError) return <p className="text-sm text-red-500">Erro ao carregar sugestões.</p>

  return (
    <div className="space-y-4">
      {suggestions?.map(suggestion => (
        <div key={suggestion.id} className="flex items-center justify-between">
          <Link href={`/profile/${suggestion.username}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={suggestion.avatar_url || "/placeholder-user.jpg"} />
              <AvatarFallback>{suggestion.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold hover:underline">{suggestion.full_name}</p>
              <p className="text-xs text-gray-500">
                {suggestion.mutual_friends_count > 0
                  ? `${suggestion.mutual_friends_count} amigos em comum`
                  : "Sugestão para você"}
              </p>
            </div>
          </Link>
          <Button size="sm" variant="outline">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {suggestions?.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma sugestão no momento.</p>
      )}
    </div>
  )
}
