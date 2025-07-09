"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Home, Compass, Calendar, Mail, User, Settings, Verified, Menu, X, Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineSidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  profile: any
  setIsChatOpen: (open: boolean) => void
  theme: "light" | "dark" | "auto"
  setTheme: (theme: "light" | "dark" | "auto") => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function TimelineSidebar({
  activeView,
  setActiveView,
  profile,
  setIsChatOpen,
  theme,
  setTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: TimelineSidebarProps) {
  const navigationItems = [
    { id: "home", label: "Timeline", icon: Home },
    { id: "explore", label: "Explorar", icon: Compass },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "messages", label: "Mensagens", icon: Mail },
    { id: "profile", label: "Perfil", icon: User },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return Sun
      case "dark":
        return Moon
      default:
        return Monitor
    }
  }

  const ThemeIcon = getThemeIcon()

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-pink-900">open</span>
            <span className="text-pink-600">love</span>
          </h1>
          <div className="flex items-center gap-2">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-12 h-8 p-0 border-0 bg-transparent hover:bg-pink-100 rounded-lg">
                <ThemeIcon className="h-4 w-4 text-pink-600" />
              </SelectTrigger>
              <SelectContent className="openlove-card">
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Claro
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Escuro
                  </div>
                </SelectItem>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Auto
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden h-8 w-8 hover:bg-pink-100 text-pink-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 border-b border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <div className="text-center mb-4">
          <div className="relative inline-block mb-3">
            <Avatar className="w-16 h-16 ring-4 ring-pink-300 shadow-lg">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-lg font-semibold">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {profile.isPremium && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Verified className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="status-online" />
          </div>
          <h2 className="font-semibold text-base text-pink-900">{profile.name}</h2>
          <p className="text-xs text-pink-700">@{profile.username}</p>
          <Badge
            className={cn(
              "text-xs mt-2",
              profile.isPremium
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0"
                : "border-pink-400 text-pink-700 bg-pink-50",
            )}
          >
            {profile.isPremium ? "Premium" : "Gratuito"}
          </Badge>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-3 bg-white/80 rounded-xl shadow-sm border border-pink-200 hover-lift">
            <div className="font-bold text-pink-600 text-lg">{profile.stats.friends}</div>
            <div className="text-pink-700">Amigos</div>
          </div>
          <div className="p-3 bg-white/80 rounded-xl shadow-sm border border-pink-200 hover-lift">
            <div className="font-bold text-pink-600 text-lg">{profile.stats.posts}</div>
            <div className="text-pink-700">Posts</div>
          </div>
          <div className="p-3 bg-white/80 rounded-xl shadow-sm border border-pink-200 hover-lift">
            <div className="font-bold text-pink-600 text-lg">{profile.stats.likes}</div>
            <div className="text-pink-700">Curtidas</div>
          </div>
          <div className="p-3 bg-white/80 rounded-xl shadow-sm border border-pink-200 hover-lift">
            <div className="font-bold text-pink-600 text-lg">R$ {profile.stats.earnings.toFixed(2)}</div>
            <div className="text-pink-700">Ganhos</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 bg-gradient-to-b from-pink-50 to-rose-50">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left text-sm h-12 rounded-xl font-medium transition-all duration-200",
                activeView === item.id
                  ? "btn-openlove shadow-lg"
                  : "hover:bg-pink-100 text-pink-700 hover:text-pink-900 hover-lift",
              )}
              onClick={() => {
                setActiveView(item.id)
                if (item.id === "messages") setIsChatOpen(true)
                setIsMobileMenuOpen(false)
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="text-center text-xs text-pink-700">
          <p className="font-semibold">OpenLove © 2024</p>
          <p>Conectando corações</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden btn-openlove shadow-lg rounded-full"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div className="w-72 border-r border-pink-200 fixed h-full left-0 top-0 hidden md:flex flex-col openlove-sidebar z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "w-72 border-r border-pink-200 fixed h-full left-0 top-0 flex flex-col openlove-sidebar z-50 transition-transform duration-300 md:hidden shadow-2xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}
