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
  activeView: string
  setActiveView: (view: string) => void
}

export function TimelineSidebar({ isDarkMode, onToggleTheme, activeView, setActiveView }: TimelineSidebarProps) {
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

  // Card para comprar plano
  const PlanoCard = () => (
    <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Assine o Premium</CardTitle>
        <CardDescription className="text-pink-100">Desbloqueie recursos exclusivos e benefícios!</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1 mb-2">
          <li>✔ Mensagens ilimitadas</li>
          <li>✔ Ver quem visitou seu perfil</li>
          <li>✔ Filtros avançados</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-white text-pink-600 hover:bg-pink-100 font-bold">Quero ser Premium</Button>
      </CardFooter>
    </Card>
  )

  // Card de comunidade sugerida
  const ComunidadeSugeridaCard = () => (
    <Card className="border-0 shadow bg-gradient-to-r from-white to-openlove-100 dark:from-gray-900 dark:to-gray-800">
      <CardHeader>
        <CardTitle className="text-base font-bold text-pink-700 dark:text-pink-300 flex items-center gap-2">
          <Users className="w-5 h-5" /> Comunidade Sugerida
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <img src="/placeholder-user.jpg" alt="Comunidade" className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">OpenLove Brasil</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">+2.300 membros</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full bg-pink-500 hover:bg-pink-600 text-white">Entrar</Button>
      </CardFooter>
    </Card>
  )

  // Card de notificações
  const NotificacoesCard = () => (
    <Card className="border-0 shadow bg-gradient-to-r from-white to-openlove-100 dark:from-gray-900 dark:to-gray-800">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2 text-pink-700 dark:text-pink-300">
          <Bell className="w-5 h-5" /> Notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
          <li>Você recebeu 2 novas curtidas</li>
          <li>1 nova solicitação de amizade</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" className="w-full">Ver todas</Button>
      </CardFooter>
    </Card>
  )

  // Card de mensagens
  const MensagensCard = () => (
    <Card className="border-0 shadow bg-gradient-to-r from-white to-openlove-100 dark:from-gray-900 dark:to-gray-800">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2 text-pink-700 dark:text-pink-300">
          <Mail className="w-5 h-5" /> Mensagens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
          <li>Nova mensagem de Ana</li>
          <li>Grupo OpenLove: 3 novas mensagens</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" className="w-full">Abrir mensagens</Button>
      </CardFooter>
    </Card>
  )

  return (
    <aside className={
      `hidden lg:block w-64 xl:w-80 p-6 sticky top-0 h-screen overflow-y-auto
      bg-gradient-to-b from-white via-openlove-50 to-openlove-100
      dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 z-20`
    }>
      <div className="space-y-6">
        {/* Logo */}
        <h1 className="text-3xl justify-center items-center sm:text-4xl font-bold tracking-tight">
            <span className="text-gray-900 dark:text-white">open</span>
            <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
              love
            </span>
          </h1>
        {/* Navigation */}
        <nav className="space-y-2">
          <Button variant={activeView === "home" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("home")}> <User className="w-5 h-5" /> Início </Button>
          <Button variant={activeView === "explore" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("explore")}> <Search className="w-5 h-5" /> Explorar </Button>
          <Button variant={activeView === "notifications" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("notifications")}> <Bell className="w-5 h-5" /> Notificações </Button>
          <Button variant={activeView === "messages" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("messages")}> <Mail className="w-5 h-5" /> Mensagens </Button>
          <Button variant={activeView === "events" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("events")}> <Calendar className="w-5 h-5" /> Eventos </Button>
          <Button variant={activeView === "communities" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("communities")}> <Users className="w-5 h-5" /> Comunidades </Button>
          <Button variant={activeView === "saved" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("saved")}> <Bookmark className="w-5 h-5" /> Salvos </Button>
          <Button variant={activeView === "settings" ? "default" : "ghost"} className="w-full justify-start gap-3 text-left" onClick={() => setActiveView("settings")}> <Settings className="w-5 h-5" /> Configurações </Button>
        </nav>

        {/* Cards extras */}
        <div className="space-y-4">
          <PlanoCard />
          <ComunidadeSugeridaCard />
          <NotificacoesCard />
          <MensagensCard />
        </div>

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
