"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Bell } from "lucide-react"

interface TimelineHeaderProps {
  profile: any
  setIsCreatePostOpen: (open: boolean) => void
  setIsChatOpen: (open: boolean) => void
}

export function TimelineHeader({ profile, setIsCreatePostOpen, setIsChatOpen }: TimelineHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 flex items-center justify-between h-14 shadow-sm z-50">
      <Link href="/timeline" className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-gray-900">open</span>
          <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
            love
          </span>
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-pink-50"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <Plus className="h-5 w-5 text-pink-600" />
          <span className="sr-only">Create Post</span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-50">
          <Bell className="h-5 w-5 text-pink-600" />
          <span className="sr-only">Notifications</span>
        </Button>

        <Link href="/profile" className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border border-pink-200">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm text-gray-900 hidden sm:block">{profile.name}</span>
        </Link>
      </div>
    </header>
  )
}
