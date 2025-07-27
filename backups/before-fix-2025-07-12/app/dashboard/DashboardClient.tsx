"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Users, Calendar, TrendingUp, DollarSign } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/app/lib/database.types"
import Timeline from "@/app/components/timeline/Timeline"
import Advertisement from "@/app/components/ads/Advertisement"

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  subscription_plan?: string | null
  can_sell_content?: boolean | null
  offers_programs?: boolean | null
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const [stats, setStats] = useState({
    friends: 0,
    posts: 0,
    likes: 0,
    views: 0,
    earnings: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  // Verificação de segurança
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user?.id) {
      fetchStats()
    }
  }, [user?.id])

  const fetchStats = async () => {
    if (!user?.id) return

    try {
      // Buscar estatísticas do usuário
      const [friendsRes, postsRes, likesRes, viewsRes, earningsRes] = await Promise.all([
        supabase.from("friends").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "accepted"),
        supabase.from("posts").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("likes").select("id", { count: "exact" }).eq("user_id", user.id).eq("type", "like"),
        supabase.from("profile_views").select("id", { count: "exact" }).eq("viewed_user_id", user.id),
        supabase.from("user_earnings").select("total_earnings").eq("user_id", user.id).single(),
      ])

      setStats({
        friends: friendsRes.count || 0,
        posts: postsRes.count || 0,
        likes: likesRes.count || 0,
        views: viewsRes.count || 0,
        earnings: earningsRes.data?.total_earnings || 0 })
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const isPremium = profile?.subscription_plan === "premium" || profile?.subscription_plan === "pro"

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header do Dashboard */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>
                {profile?.full_name && profile.full_name.length > 0
                  ? profile.full_name[0].toUpperCase()
                  : user?.email && user.email.length > 0
                  ? user.email[0].toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Olá, {profile?.full_name || user?.email?.split('@')[0] || "Usuário"}!</h1>
              <p className="text-gray-600">Bem-vindo ao seu dashboard</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isPremium ? "default" : "secondary"}>{profile?.subscription_plan || "free"}</Badge>
                {profile?.can_sell_content && <Badge variant="outline">Criador de Conteúdo</Badge>}
                {profile?.offers_programs && <Badge variant="outline">Mentor</Badge>}
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Amigos</p>
                    <p className="text-2xl font-bold">{loading ? "..." : stats.friends}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Posts</p>
                    <p className="text-2xl font-bold">{loading ? "..." : stats.posts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Curtidas</p>
                    <p className="text-2xl font-bold">{loading ? "..." : stats.likes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Visualizações</p>
                    <p className="text-2xl font-bold">{loading ? "..." : stats.views}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Ganhos</p>
                    <p className="text-2xl font-bold">R$ {loading ? "..." : stats.earnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Timeline Principal */}
          <div className="lg:col-span-3">
            <Timeline />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Anúncios */}
            <Advertisement />

            {/* Sugestões de Amigos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pessoas que você pode conhecer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Usuário {i}</p>
                          <p className="text-xs text-gray-500">2 amigos em comum</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eventos Próximos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">Workshop de Fotografia</p>
                    <p className="text-xs text-gray-600">Amanhã às 19h</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Encontro de Casais</p>
                    <p className="text-xs text-gray-600">Sábado às 20h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade para Premium */}
            {!isPremium && (
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Upgrade para Premium</CardTitle>
                  <CardDescription className="text-purple-100">Desbloqueie recursos exclusivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• Mensagens ilimitadas</li>
                    <li>• Ver quem visitou seu perfil</li>
                    <li>• Filtros avançados</li>
                    <li>• Sem anúncios</li>
                  </ul>
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">Fazer Upgrade</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
