"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TimelineFeed } from "./TimelineFeed"
import { ExploreView } from "./ExploreView"
import { EventsView } from "./EventsView"
import { OtherViews } from "./OtherViews"

interface TimelineMainProps {
  activeView: string
  posts: any[]
  users: any[]
  events: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchFilters: any
  setSearchFilters: (filters: any) => void
  handleLike: (postId: string) => void
  handleComment: (postId: string) => void
  handleShare: (postId: string) => void
  toggleFollow: (username: string) => void
  handleJoinEvent: (eventId: string) => void
  handleViewProfile: (user: any) => void
  newPost: any
  setNewPost: (post: any) => void
  handleCreatePost: () => void
  setIsCreatePostOpen: (open: boolean) => void
  profile: any
}

export function TimelineMain({
  activeView,
  posts,
  users,
  events,
  searchQuery,
  setSearchQuery,
  searchFilters,
  setSearchFilters,
  handleLike,
  handleComment,
  handleShare,
  toggleFollow,
  handleJoinEvent,
  handleViewProfile,
  newPost,
  setNewPost,
  handleCreatePost,
  setIsCreatePostOpen,
  profile,
}: TimelineMainProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("")

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return (
          <TimelineFeed
            posts={posts}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onFollow={toggleFollow}
            onViewProfile={handleViewProfile}
          />
        )
      case "explore":
        return (
          <div className="space-y-6">
            {/* Search Header */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Explorar Pessoas</h2>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou username..."
                    value={localSearchQuery}
                    onChange={(e) => {
                      setLocalSearchQuery(e.target.value)
                      setSearchQuery(e.target.value)
                    }}
                    className="pl-10 bg-muted border-border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={searchFilters.location}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, location: value })}
                  >
                    <SelectTrigger className="bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas as cidades</SelectItem>
                      <SelectItem value="São Paulo">São Paulo</SelectItem>
                      <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                      <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={searchFilters.ageRange}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, ageRange: value })}
                  >
                    <SelectTrigger className="bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Faixa etária" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas as idades</SelectItem>
                      <SelectItem value="18-25">18-25 anos</SelectItem>
                      <SelectItem value="26-35">26-35 anos</SelectItem>
                      <SelectItem value="36+">36+ anos</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2 bg-muted rounded-xl px-3 py-2">
                    <Switch
                      id="premium-filter"
                      checked={searchFilters.isPremium}
                      onCheckedChange={(checked) => setSearchFilters({ ...searchFilters, isPremium: checked })}
                    />
                    <Label htmlFor="premium-filter" className="text-sm">
                      Apenas Premium
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <ExploreView users={users} onFollow={toggleFollow} onViewProfile={handleViewProfile} />
          </div>
        )
      case "events":
        return <EventsView events={events} onJoinEvent={handleJoinEvent} />
      default:
        return <OtherViews activeView={activeView} />
    }
  }

  return (
    <div className="flex-1 ml-0 md:ml-72 mr-0 lg:mr-80 relative">
      <div className="max-w-2xl mx-auto p-4 md:p-6 pt-16 md:pt-6">{renderContent()}</div>

      {/* Floating Create Post Button */}
      <Button
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-6 right-6 lg:right-96 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 z-30"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
