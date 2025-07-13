"use client"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
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
  Home,
  Feather,
  LogOut,
  Edit,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Logo from "../Logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface TimelineSidebarProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  activeView: string
  setActiveView: (view: string) => void
  onNavigateToSettings?: () => void
  onNavigateToProfiles?: () => void
  onNavigateToEvents?: () => void
  onNavigateToCommunities?: () => void
  onNavigateToMessages?: () => void
  onNavigateToNotifications?: () => void
  onNavigateToFriends?: () => void
  onNavigateToSearch?: () => void
  onCreatePost?: () => void
}

export function TimelineSidebar({ 
  isDarkMode, 
  onToggleTheme, 
  activeView, 
  setActiveView, 
  onNavigateToSettings, 
  onNavigateToProfiles, 
  onNavigateToEvents,
  onNavigateToCommunities,
  onNavigateToMessages,
  onNavigateToNotifications,
  onNavigateToFriends,
  onNavigateToSearch,
  onCreatePost 
}: TimelineSidebarProps) {
  const { user, signOut } = useAuth()
  


  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/auth/signin'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleEditProfile = () => {
    window.location.href = '/profile/edit'
  }

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
    <aside className="hidden min-[360px]:block w-[72px] xl:w-[275px] p-3 xs:p-4 sticky top-0 h-screen overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="space-y-6 xs:space-y-8 w-full">
        {/* Logo */}
        <div className="px-2 w-full">
          <h1 className="text-lg xs:text-xl font-bold tracking-tight">
            <span className="text-gray-900 dark:text-white">open</span>
            <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-400 dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
              love
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 xs:space-y-2 w-full">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "home" && "bg-transparent"
            )}
            onClick={() => setActiveView("home")}
          > 
            <Home className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "home" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "home" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Início</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "explore" && "bg-transparent"
            )}
            onClick={() => setActiveView("explore")}
          > 
            <Search className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "explore" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "explore" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Explorar</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "notifications" && "bg-transparent"
            )}
            onClick={() => setActiveView("notifications")}
          > 
            <Bell className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "notifications" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "notifications" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Notificações</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "messages" && "bg-transparent"
            )}
            onClick={() => setActiveView("messages")}
          > 
            <Mail className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "messages" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "messages" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Mensagens</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "events" && "bg-transparent"
            )}
            onClick={() => setActiveView("events")}
          > 
            <Calendar className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "events" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "events" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Eventos</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "communities" && "bg-transparent"
            )}
            onClick={() => setActiveView("communities")}
          > 
            <Users className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "communities" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "communities" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Comunidades</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "open-dates" && "bg-transparent"
            )}
            onClick={() => setActiveView("open-dates")}
          > 
            <Heart className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "open-dates" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "open-dates" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Open Dates</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "saved" && "bg-transparent"
            )}
            onClick={() => setActiveView("saved")}
          > 
            <Bookmark className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "saved" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "saved" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Salvos</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200",
              activeView === "my-profile" && "bg-transparent"
            )}
            onClick={() => {
              console.log("Clicou em Meu Perfil - Definindo view para my-profile")
              setActiveView("my-profile")
            }}
          > 
            <User className={cn(
              "w-5 h-5 xs:w-6 xs:h-6 transition-colors",
              activeView === "my-profile" ? "text-pink-600 dark:text-pink-400" : "text-gray-600 dark:text-gray-400"
            )} /> 
            <span className={cn(
              "text-base xs:text-lg transition-all hidden lg:inline",
              activeView === "my-profile" ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-400"
            )}>Meu Perfil</span> 
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full transition-all duration-200" 
            onClick={onNavigateToSettings}
          > 
            <Settings className="w-5 h-5 xs:w-6 xs:h-6 text-gray-600 dark:text-gray-400" /> 
            <span className="text-base xs:text-lg font-normal text-gray-600 dark:text-gray-400 hidden lg:inline">Configurações</span> 
          </Button>

          {/* Botão Postar */}
          <div className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 dark:from-pink-500 dark:via-rose-500 dark:to-purple-500 p-[1px] rounded-full group hover:scale-105 transition-all duration-300 hover:shadow-xl">
            <Button
              onClick={onCreatePost}
              className="w-full rounded-full bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base lg:text-lg group"
            >
              <Feather className="w-4 h-4 xs:w-5 xs:h-5 lg:w-6 lg:h-6" />
              <span className="hidden lg:inline ml-2">Postar</span>
            </Button>
          </div>
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 xs:gap-4 text-left h-12 xs:h-14 px-3 xs:px-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <Avatar className="w-8 h-8 xs:w-10 xs:h-10 border-2 border-gray-200 dark:border-gray-600">
                      <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder-user.jpg"} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback className="text-xs xs:text-sm font-semibold">
                        {user.user_metadata?.full_name 
                          ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('')
                          : user.email?.charAt(0).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                        {user.user_metadata?.full_name || 'Usuário'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        @{user.user_metadata?.username || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{user.user_metadata?.username || user.email?.split('@')[0]}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Ajustar Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="px-2 w-full">
          <Button 
            variant="ghost" 
            onClick={onToggleTheme} 
            className="w-full justify-start gap-3 xs:gap-4 text-left h-11 xs:h-12 px-3 xs:px-4 rounded-full"
          >
            {isDarkMode ? <Sun className="w-5 h-5 xs:w-6 xs:h-6" /> : <Moon className="w-5 h-5 xs:w-6 xs:h-6" />}
            <span className="text-base xs:text-lg hidden lg:inline">{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}