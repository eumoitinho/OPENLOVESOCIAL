"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserPlus, UserCheck, UserX, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import type { Profile } from "@/types/database"

interface FriendRequest {
  user_id: string
  created_at: string
  profiles: Profile
}

interface FriendsContentProps {
  initialRequests: FriendRequest[]
  initialFriends: Profile[]
}

export default function FriendsContent({ initialRequests, initialFriends }: FriendsContentProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [friends, setFriends] = useState(initialFriends)
  const router = useRouter()

  const handleRespondRequest = async (requesterId: string, response: "accepted" | "declined") => {
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: requesterId, response }) })
      if (res.ok) {
        setRequests(prev => prev.filter(req => req.user_id !== requesterId))
        if (response === "accepted") {
          // Add to friends list
          const newFriend = requests.find(req => req.user_id === requesterId)?.profiles
          if (newFriend) {
            setFriends(prev => [...prev, newFriend])
          }
        }
        toast({ title: "Success", description: `Friend request ${response}.` })
      } else {
        throw new Error("Failed to respond to friend request")
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not respond to friend request.", variant: "destructive" })
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE" })
      if (response.ok) {
        setFriends(prev => prev.filter(friend => friend.id !== friendId))
        toast({ title: "Success", description: "Friend removed." })
      } else {
        throw new Error("Failed to remove friend")
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not remove friend.", variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users /> Amigos ({friends.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friend => (
                <Card key={friend.id} className="p-4 flex flex-col items-center text-center">
                  <Link href={`/profile/${friend.username}`}>
                    <Avatar className="w-20 h-20 mb-4">
                      <AvatarImage src={friend.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>{friend.username?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link href={`/profile/${friend.username}`} className="font-semibold hover:underline">
                    {friend.full_name}
                  </Link>
                  <p className="text-sm text-gray-500">@{friend.username}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Remover
                  </Button>
                </Card>
              ))}
              {friends.length === 0 && <p className="text-gray-500 col-span-full">Você ainda não tem amigos.</p>}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus /> Solicitações de Amizade ({requests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.map(req => (
                <div key={req.user_id} className="flex items-center justify-between">
                  <Link href={`/profile/${req.profiles.username}`} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={req.profiles.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>{req.profiles.username?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold hover:underline">{req.profiles.full_name}</p>
                      <p className="text-sm text-gray-500">@{req.profiles.username}</p>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRespondRequest(req.user_id, "accepted")}>
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRespondRequest(req.user_id, "declined")}>
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <p className="text-gray-500">Nenhuma solicitação pendente.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
