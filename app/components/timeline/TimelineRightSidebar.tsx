"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AdCard } from "../ads/AdCard"
import { TrendingUp, Calendar, Users, MapPin, Crown } from "lucide-react"

interface TimelineRightSidebarProps {
  users: any[]
  events: any[]
  profile: any
  toggleFollow: (username: string) => void
}

export function TimelineRightSidebar({ users, events, profile, toggleFollow }: TimelineRightSidebarProps) {
  const suggestedUsers = users.filter((user) => !user.isFollowing).slice(0, 3)
  const upcomingEvents = events.slice(0, 2)

  const trendingTopics = [
    { tag: "#OpenLove", posts: "2.1K" },
    { tag: "#Relacionamentos", posts: "1.8K" },
    { tag: "#Encontros", posts: "1.2K" },
    { tag: "#Premium", posts: "890" },
  ]

  return (
    <div className="w-80 fixed right-0 top-0 h-full border-l border-border bg-card/30 backdrop-blur-sm p-6 overflow-y-auto scrollbar-hide hidden lg:block">
      <div className="space-y-6">
        {/* Trending Topics */}
        <Card className="border-0 shadow-sm bg-card backdrop-blur-sm rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-2xl cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-primary">{topic.tag}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Suggested Users */}
        <Card className="border-0 shadow-sm bg-card backdrop-blur-sm rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              Sugestões para Você
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm text-foreground truncate">{user.name}</p>
                      {user.isPremium && <Crown className="w-3 h-3 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{user.location}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFollow(user.username)}
                  className="border-primary text-primary hover:bg-primary/10 rounded-xl text-xs"
                >
                  Seguir
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-sm bg-card backdrop-blur-sm rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 hover:bg-muted/50 rounded-2xl cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground line-clamp-2">{event.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                    <Badge variant="outline" className="text-xs mt-2 border-primary text-primary bg-primary/10">
                      Premium
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advertisement Cards */}
        <AdCard
          title="Experiência Premium"
          description="Desbloqueie recursos exclusivos e conecte-se com pessoas incríveis."
          image="/placeholder.svg?height=120&width=120"
          buttonText="Assinar Premium"
          onButtonClick={() => console.log("Premium clicked")}
        />

        <AdCard
          title="Encontros Especiais"
          description="Descubra eventos únicos e experiências inesquecíveis na sua região."
          image="/placeholder.svg?height=120&width=120"
          buttonText="Ver Eventos"
          onButtonClick={() => console.log("Events clicked")}
        />

        <AdCard
          title="Conexões Autênticas"
          description="Encontre pessoas que compartilham seus interesses e valores."
          image="/placeholder.svg?height=120&width=120"
          buttonText="Explorar"
          onButtonClick={() => console.log("Explore clicked")}
        />
      </div>
    </div>
  )
}
