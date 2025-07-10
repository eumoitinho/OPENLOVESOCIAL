"use client"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Heart,
  Moon,
  Sun,
  Users,
  Calendar,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
} from "lucide-react"
import Logo from "../Logo"

interface TimelineSidebarProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onOpenSettings: () => void
  onOpenProfileSearch: () => void
}

export function TimelineSidebar({ isDarkMode, onToggleTheme, onOpenSettings, onOpenProfileSearch }: TimelineSidebarProps) {
  const AdCard2 = () => (
    <Card className="max-w-md pt-0">
      <CardContent className="px-0">
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-2.png?height=280&format=auto"
          alt="Banner"
          className="aspect-video h-32 rounded-t-xl object-cover"
        />
      </CardContent>
      <CardHeader>
        <CardTitle className="text-sm">Premium OpenLove</CardTitle>
        <CardDescription className="text-xs">Desbloqueie recursos exclusivos e conecte-se sem limites.</CardDescription>
      </CardHeader>
      <CardFooter className="gap-3 max-sm:flex-col max-sm:items-stretch">
        <Button size="sm" className="text-xs">
          Assinar Premium
        </Button>
        <Button variant="outline" size="sm" className="text-xs bg-transparent">
          Saiba Mais
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <aside className="hidden lg:block w-64 xl:w-80 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Logo */}
        <Logo/>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-left">
            <User className="w-5 h-5" />
            Início
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={onOpenProfileSearch}>
            <Search className="w-5 h-5" />
            Explorar
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-left">
            <Bell className="w-5 h-5" />
            Notificações
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-left">
            <Mail className="w-5 h-5" />
            Mensagens
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-left"
            onClick={() => window.location.href = '/events'}
          >
            <Calendar className="w-5 h-5" />
            Eventos
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-left"
            onClick={() => window.location.href = '/communities'}
          >
            <Users className="w-5 h-5" />
            Comunidades
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-left">
            <Bookmark className="w-5 h-5" />
            Salvos
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-left">
            <User className="w-5 h-5" />
            Perfil
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-left"
            onClick={onOpenSettings}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Button>
        </nav>

        {/* Theme Toggle */}
        <Button variant="ghost" onClick={onToggleTheme} className="w-full justify-start gap-3 text-left">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDarkMode ? "Modo Claro" : "Modo Escuro"}
        </Button>

        {/* Ad Card */}
        <div className="mt-8">
          <AdCard2 />
        </div>
      </div>
    </aside>
  )
}
