"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, UserX, Clock } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import type { Profile } from "@/types/database"

interface FriendshipButtonProps {
  profile: Profile
}

type FriendStatus = "not_friends" | "pending_sent" | "pending_received" | "friends"

export function FriendshipButton({ profile }: FriendshipButtonProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<FriendStatus>("not_friends")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // In a real app, you'd fetch the friendship status from the server
    // For now, we'll just simulate it
    // setStatus(getFriendshipStatus(user.id, profile.id))
  }, [user, profile])

  const handleSendRequest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: profile.id }),
      })
      if (response.ok) {
        setStatus("pending_sent")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRespondRequest = async (response: "accepted" | "declined") => {
    setLoading(true)
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: profile.id, response }),
      })
      if (res.ok) {
        setStatus(response === "accepted" ? "friends" : "not_friends")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/friends/${profile.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setStatus("not_friends")
      }
    } finally {
      setLoading(false)
    }
  }

  if (user?.id === profile.id) {
    return (
      <Link href="/profile/edit">
        <Button variant="outline">Editar Perfil</Button>
      </Link>
    )
  }

  switch (status) {
    case "not_friends":
      return (
        <Button onClick={handleSendRequest} disabled={loading}>
          <UserPlus className="mr-2 h-4 w-4" /> Adicionar Amigo
        </Button>
      )
    case "pending_sent":
      return (
        <Button variant="outline" disabled>
          <Clock className="mr-2 h-4 w-4" /> Solicitação Enviada
        </Button>
      )
    case "pending_received":
      return (
        <div className="flex gap-2">
          <Button onClick={() => handleRespondRequest("accepted")} disabled={loading}>
            <UserCheck className="mr-2 h-4 w-4" /> Aceitar
          </Button>
          <Button variant="destructive" onClick={() => handleRespondRequest("declined")} disabled={loading}>
            <UserX className="mr-2 h-4 w-4" /> Recusar
          </Button>
        </div>
      )
    case "friends":
      return (
        <Button variant="secondary" onClick={handleRemoveFriend} disabled={loading}>
          <UserCheck className="mr-2 h-4 w-4" /> Amigos
        </Button>
      )
    default:
      return null
  }
}
