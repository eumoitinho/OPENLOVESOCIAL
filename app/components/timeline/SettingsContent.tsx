"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/motion-tabs"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import {
  User,
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  Mail,
  Phone,
  Smartphone,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  Key,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Edit,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("account")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    mentions: true,
    likes: true,
    comments: true,
    events: true,
    communities: true
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLocation: true,
    showOnlineStatus: true,
    allowMessages: true,
    allowFollows: true
  })

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-1/4">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("account")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    activeTab === "account"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    <span>Conta</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    activeTab === "notifications"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>Notificações</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("privacy")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    activeTab === "privacy"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4" />
                    <span>Privacidade</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    activeTab === "appearance"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4" />
                    <span>Aparência</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    activeTab === "security"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4" />
                    <span>Segurança</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("data")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    activeTab === "data"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4" />
                    <span>Dados</span>
                  </div>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          {activeTab === "account" && (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e preferências da conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png" />
                    <AvatarFallback className="text-lg">JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">João Silva</h3>
                    <p className="text-sm text-muted-foreground">@joaosilva</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar Foto
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" defaultValue="João Silva" />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="@joaosilva" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="joao@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="+55 11 99999-9999" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Apaixonado por liberdade, respeito e conexões autênticas."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Escolha como e quando receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Canais de Notificação</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <Label htmlFor="email-notifications">Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações importantes por email</p>
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
                      <Smartphone className="w-5 h-5 text-green-500" />
                      <div>
                        <Label htmlFor="push-notifications">Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
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
                      <Phone className="w-5 h-5 text-purple-500" />
                      <div>
                        <Label htmlFor="sms-notifications">Notificações SMS</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações por SMS</p>
                      </div>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Tipos de Notificação</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mentions">Menções</Label>
                      <Switch
                        id="mentions"
                        checked={notifications.mentions}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, mentions: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="likes">Curtidas</Label>
                      <Switch
                        id="likes"
                        checked={notifications.likes}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, likes: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments">Comentários</Label>
                      <Switch
                        id="comments"
                        checked={notifications.comments}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, comments: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="events">Eventos</Label>
                      <Switch
                        id="events"
                        checked={notifications.events}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, events: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Privacidade</CardTitle>
                <CardDescription>
                  Controle quem pode ver seu perfil e conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-public">Perfil Público</Label>
                      <p className="text-sm text-muted-foreground">Qualquer pessoa pode ver seu perfil</p>
                    </div>
                    <Switch
                      id="profile-public"
                      checked={privacy.profilePublic}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profilePublic: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-location">Mostrar Localização</Label>
                      <p className="text-sm text-muted-foreground">Permitir que outros vejam sua localização</p>
                    </div>
                    <Switch
                      id="show-location"
                      checked={privacy.showLocation}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showLocation: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-online">Status Online</Label>
                      <p className="text-sm text-muted-foreground">Mostrar quando você está online</p>
                    </div>
                    <Switch
                      id="show-online"
                      checked={privacy.showOnlineStatus}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-messages">Permitir Mensagens</Label>
                      <p className="text-sm text-muted-foreground">Permitir que outros enviem mensagens</p>
                    </div>
                    <Switch
                      id="allow-messages"
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-follows">Permitir Seguidores</Label>
                      <p className="text-sm text-muted-foreground">Permitir que outros sigam você</p>
                    </div>
                    <Switch
                      id="allow-follows"
                      checked={privacy.allowFollows}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowFollows: checked }))}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Bloqueios</h3>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Usuários Bloqueados
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência da interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                </div>

                <div>
                  <Label htmlFor="font-size">Tamanho da Fonte</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Senha</h3>
                      <p className="text-sm text-muted-foreground">Última alteração: há 30 dias</p>
                    </div>
                    <Button variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Autenticação de Dois Fatores</h3>
                      <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                    </div>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Configurar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Sessões Ativas</h3>
                      <p className="text-sm text-muted-foreground">Gerencie dispositivos conectados</p>
                    </div>
                    <Button variant="outline">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Ver Dispositivos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "data" && (
            <Card>
              <CardHeader>
                <CardTitle>Dados e Privacidade</CardTitle>
                <CardDescription>
                  Gerencie seus dados e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Exportar Dados</h3>
                      <p className="text-sm text-muted-foreground">Baixe uma cópia dos seus dados</p>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Deletar Conta</h3>
                      <p className="text-sm text-muted-foreground">Excluir permanentemente sua conta</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 