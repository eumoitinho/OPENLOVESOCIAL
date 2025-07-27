"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Search, UserPlus, MessageCircle, UserMinus, Check, X, Users, UserCheck } from "lucide-react"

interface User {
  id: string
  full_name: string
  username: string
  avatar_url?: string
  location?: string
  mutual_friends?: number
  is_friend?: boolean
  request_sent?: boolean
}

interface FriendRequest {
  id: string
  sender: User
  created_at: string
}

export default function FriendsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  useEffect(() => {
    if (user) {
      loadFriends()
      loadFriendRequests()
    }
  }, [user])

  const loadFriends = async () => {
    try {
      const response = await fetch("/api/friends")
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      }
    } catch (error) {
      console.error("Erro ao carregar amigos:", error)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests")
      if (response.ok) {
        const data = await response.json()
        setFriendRequests(data)
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Erro na busca:", error)
      toast({
        title: "Erro",
        description: "Não foi possível realizar a busca.",
        variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }) })

      if (response.ok) {
        toast({
          title: "Solicitação enviada!",
          description: "Sua solicitação de amizade foi enviada." })
        // Update search results
        setSearchResults((prev) => prev.map((user) => (user.id === userId ? { ...user, request_sent: true } : user)))
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação.",
        variant: "destructive" })
    }
  }

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const response = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, accept }) })

      if (response.ok) {
        toast({
          title: accept ? "Solicitação aceita!" : "Solicitação recusada",
          description: accept ? "Vocês agora são amigos!" : "A solicitação foi recusada." })
        loadFriendRequests()
        if (accept) loadFriends()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive" })
    }
  }

  const removeFriend = async (userId: string) => {
    try {
      const response = await fetch("/api/friends/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }) })

      if (response.ok) {
        toast({
          title: "Amigo removido",
          description: "A pessoa foi removida da sua lista de amigos." })
        loadFriends()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o amigo.",
        variant: "destructive" })
    }
  }

  const UserCard = ({ user: userData, showActions = true }: { user: User; showActions?: boolean }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={userData.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{userData.full_name?.charAt(0) || userData.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{userData.full_name}</h3>
            <p className="text-sm text-gray-600">@{userData.username}</p>
            {userData.location && <p className="text-xs text-gray-500">{userData.location}</p>}
            {userData.mutual_friends && userData.mutual_friends > 0 && (
              <p className="text-xs text-blue-600">{userData.mutual_friends} amigos em comum</p>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {userData.is_friend ? (
              <>
                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                  <MessageCircle className="w-4 h-4" />
                  Mensagem
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFriend(userData.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <UserMinus className="w-4 h-4" />
                  Remover
                </Button>
              </>
            ) : userData.request_sent ? (
              <Badge variant="secondary">Solicitação enviada</Badge>
            ) : (
              <Button size="sm" onClick={() => sendFriendRequest(userData.id)} className="flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                Adicionar
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Amigos</h1>
          <p className="text-gray-600">Encontre e conecte-se com pessoas incríveis</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar Pessoas
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Solicitações ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Meus Amigos ({friends.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Pessoas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o nome ou @username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                  />
                  <Button onClick={searchUsers} disabled={loading}>
                    {loading ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {searchResults.map((userData) => (
                <UserCard key={userData.id} user={userData} />
              ))}
              {searchResults.length === 0 && searchQuery && !loading && (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">Nenhum usuário encontrado para "{searchQuery}"</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {friendRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma solicitação de amizade pendente</p>
              </Card>
            ) : (
              friendRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={request.sender.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {request.sender.full_name?.charAt(0) || request.sender.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.sender.full_name}</h3>
                        <p className="text-sm text-gray-600">@{request.sender.username}</p>
                        <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => respondToRequest(request.id, true)}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToRequest(request.id, false)}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Você ainda não tem amigos adicionados</p>
                <Button className="mt-4" onClick={() => setActiveTab("search")}>
                  Buscar Pessoas
                </Button>
              </Card>
            ) : (
              friends.map((friend) => <UserCard key={friend.id} user={friend} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
