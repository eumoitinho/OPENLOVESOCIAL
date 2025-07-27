"use client"

import { useState } from "react"
import { Button, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react"
import { toast } from "sonner"
import {
  Bell,
  User,
  MessageCircleIcon,
  Lock,
  Settings,
  ArrowLeft,
  Moon,
  Sun,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Volume2,
  VolumeX,
  Globe,
  Users,
  Calendar,
  Bookmark,
  Heart,
  Star,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import UsernameUpdater from "@/app/components/profile/UsernameUpdater"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("notifications")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "")
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    mentions: true,
    likes: true,
    comments: true,
    follows: true,
    events: true,
  })
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowMessages: "friends",
    showLastSeen: false,
    allowProfileViews: true,
  })

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 10MB.",
        variant: "destructive",
      })
      return
    }

    setUploadingAvatar(true)

    try {
      // Converter para base64
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      // Enviar para API
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar: base64 }),
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem")
      }

      const data = await response.json()
      
      // Atualizar o estado local com a nova URL
      setAvatarUrl(data.avatar_url)
      
      toast.success("Sucesso!", {
        description: "Foto de perfil atualizada.",
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast.error("Erro", {
        description: "Não foi possível atualizar a foto. Tente novamente.",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const navigationItems = [
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "profile", label: "Perfil", icon: User },
    { id: "messages", label: "Mensagens & mídia", icon: MessageCircleIcon },
    { id: "privacy", label: "Privacidade", icon: Lock },
    { id: "advanced", label: "Avançado", icon: Settings },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações de Notificações</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notificações Push</CardTitle>
                    <CardDescription>Receba notificações em tempo real</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <div>
                          <Label htmlFor="push-notifications">Notificações Push</Label>
                          <p className="text-sm text-muted-foreground">Receba alertas no navegador</p>
                        </div>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-green-500" />
                        <div>
                          <Label htmlFor="email-notifications">Notificações por Email</Label>
                          <p className="text-sm text-muted-foreground">Receba atualizações por email</p>
                        </div>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-purple-500" />
                        <div>
                          <Label htmlFor="sms-notifications">Notificações SMS</Label>
                          <p className="text-sm text-muted-foreground">Receba mensagens no celular</p>
                        </div>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tipos de Notificação</CardTitle>
                    <CardDescription>Escolha quais atividades notificar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-pink-500" />
                        <div>
                          <Label htmlFor="mentions">Menções</Label>
                          <p className="text-sm text-muted-foreground">Quando alguém te mencionar</p>
                        </div>
                      </div>
                      <Switch
                        id="mentions"
                        checked={notifications.mentions}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, mentions: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div>
                          <Label htmlFor="likes">Curtidas</Label>
                          <p className="text-sm text-muted-foreground">Quando alguém curtir seu post</p>
                        </div>
                      </div>
                      <Switch
                        id="likes"
                        checked={notifications.likes}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, likes: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageCircleIcon className="w-5 h-5 text-blue-500" />
                        <div>
                          <Label htmlFor="comments">Comentários</Label>
                          <p className="text-sm text-muted-foreground">Quando alguém comentar</p>
                        </div>
                      </div>
                      <Switch
                        id="comments"
                        checked={notifications.comments}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, comments: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-500" />
                        <div>
                          <Label htmlFor="follows">Novos Seguidores</Label>
                          <p className="text-sm text-muted-foreground">Quando alguém te seguir</p>
                        </div>
                      </div>
                      <Switch
                        id="follows"
                        checked={notifications.follows}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, follows: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <div>
                          <Label htmlFor="events">Eventos</Label>
                          <p className="text-sm text-muted-foreground">Novos eventos próximos</p>
                        </div>
                      </div>
                      <Switch
                        id="events"
                        checked={notifications.events}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, events: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações do Perfil</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Pessoais</CardTitle>
                    <CardDescription>Gerencie suas informações básicas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">
                          {user?.user_metadata?.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{user?.user_metadata?.full_name || "Usuário"}</h4>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <div className="mt-2">
                          <input
                            type="file"
                            id="settings-avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={uploadingAvatar}
                          />
                          <label htmlFor="settings-avatar-upload">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="cursor-pointer"
                              disabled={uploadingAvatar}
                              asChild
                            >
                              <span className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                {uploadingAvatar ? "Enviando..." : "Alterar Foto"}
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preferências de Exibição</CardTitle>
                    <CardDescription>Personalize como seu perfil aparece</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-purple-500" />
                        <div>
                          <Label htmlFor="dark-mode">Modo Escuro</Label>
                          <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                        </div>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={isDarkMode}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  </CardContent>
                </Card>

                <UsernameUpdater />
              </div>
            </div>
          </div>
        )

      case "messages":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Mensagens & Mídia</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configurações de Mensagens</CardTitle>
                    <CardDescription>Gerencie suas conversas e mídia</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <MessageCircleIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Conversa {i + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações de Privacidade</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visibilidade do Perfil</CardTitle>
                    <CardDescription>Controle quem pode ver seu perfil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
                      <Select
                        value={privacy.profileVisibility}
                        onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>Público</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="friends">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>Apenas Amigos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              <span>Privado</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status Online</CardTitle>
                    <CardDescription>Controle sua presença online</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-green-500" />
                        <div>
                          <Label htmlFor="show-online">Mostrar Status Online</Label>
                          <p className="text-sm text-muted-foreground">Permitir que outros vejam quando você está online</p>
                        </div>
                      </div>
                      <Switch
                        id="show-online"
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <Label htmlFor="show-last-seen">Mostrar Última Vez Online</Label>
                          <p className="text-sm text-muted-foreground">Mostrar quando você foi visto por último</p>
                        </div>
                      </div>
                      <Switch
                        id="show-last-seen"
                        checked={privacy.showLastSeen}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showLastSeen: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mensagens</CardTitle>
                    <CardDescription>Controle quem pode te enviar mensagens</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="allow-messages">Quem pode me enviar mensagens</Label>
                      <Select
                        value={privacy.allowMessages}
                        onValueChange={(value) => setPrivacy(prev => ({ ...prev, allowMessages: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Todos</SelectItem>
                          <SelectItem value="friends">Apenas Amigos</SelectItem>
                          <SelectItem value="none">Ninguém</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case "advanced":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações Avançadas</h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dados e Backup</CardTitle>
                    <CardDescription>Gerencie seus dados e faça backup</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-green-500" />
                        <div>
                          <Label>Exportar Dados</Label>
                          <p className="text-sm text-muted-foreground">Baixar todos os seus dados</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Exportar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-blue-500" />
                        <div>
                          <Label>Importar Dados</Label>
                          <p className="text-sm text-muted-foreground">Restaurar dados de backup</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Importar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conta</CardTitle>
                    <CardDescription>Ações importantes da conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-orange-500" />
                        <div>
                          <Label>Reativar Conta</Label>
                          <p className="text-sm text-muted-foreground">Reativar uma conta desativada</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Reativar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <div>
                          <Label>Excluir Conta</Label>
                          <p className="text-sm text-muted-foreground">Excluir permanentemente sua conta</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Seção não encontrada</div>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Configurações</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 text-left",
                        activeSection === item.id && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-6">
                {renderSection()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}