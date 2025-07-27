"use client"

import { Button } from "../../../components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/motion-tabs"
import { Sun, Moon } from "lucide-react"

interface TimelineHeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
}

export function TimelineHeader({ isDarkMode, onToggleTheme }: TimelineHeaderProps) {
  return (
    <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-white/10 p-4 z-40">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Timeline</h1>
        <Button variant="ghost" onClick={onToggleTheme} className="lg:hidden" aria-label="Toggle theme">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-4">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">Para Você</TabsTrigger>
            <TabsTrigger value="following">Seguindo</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}