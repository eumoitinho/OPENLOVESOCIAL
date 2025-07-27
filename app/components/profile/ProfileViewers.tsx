"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/app/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

async function fetchProfileViewers(): Promise<Profile[]> {
  const response = await fetch("/api/profile/viewers")
  if (!response.ok) {
    throw new Error("Failed to fetch profile viewers")
  }
  return response.json()
}

export function ProfileViewers() {
  const { data: viewers, isLoading, isError } = useQuery({
    queryKey: ["profileViewers"],
    queryFn: fetchProfileViewers })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users /> Quem viu seu perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users /> Quem viu seu perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users /> Quem viu seu perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewers?.map(viewer => (
          <Link
            key={viewer.id}
            href={`/profile/${viewer.username}`}
            className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg"
          >
            <Avatar>
              <AvatarImage src={viewer.avatar_url || "/placeholder-user.jpg"} />
              <AvatarFallback>{viewer.username?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{viewer.full_name}</p>
              <p className="text-sm text-gray-500">@{viewer.username}</p>
            </div>
          </Link>
        ))}
        {(viewers || []).length === 0 && <p className="text-gray-500">Ninguém viu seu perfil ainda.</p>}
      </CardContent>
    </Card>
  )
}
