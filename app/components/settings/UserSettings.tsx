"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Palette, 
  Globe,
  Smartphone,
  Mail,
  Lock,
  User,
  Heart,
  MessageCircle,
  Camera,
  Save,
  X,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface UserSettings {
  profile: {
    full_name: string
    username: string
    bio: string
    location: string
    website: string
    birth_date: string
    interests: string[]
  }
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private'
    show_online_status: boolean
    show_last_seen: boolean
    allow_messages_from: 'everyone' | 'friends' | 'none'
    show_email: boolean
    show_phone: boolean
  }
  notifications: {
    new_followers: boolean
    new_likes: boolean
    new_comments: boolean
    new_messages: boolean
    mentions: boolean
    events: boolean
    email_notifications: boolean
    push_notifications: boolean
    sms_notifications: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
    date_format: string
    time_format: '12h' | '24h'
  }
  security: {
    two_factor_enabled: boolean
    login_notifications: boolean
    session_timeout: number
    password_change_required: boolean
  }
}

interface UserSettingsProps {
  className?: string
}

export function UserSettings({ className }: UserSettingsProps) {
  const { user, profile } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      birth_date: profile?.birth_date || '',
      interests: profile?.interests || []
    },
    privacy: {
      profile_visibility: 'public',
      show_online_status: true,
      show_last_seen: true,
      allow_messages_from: 'everyone',
      show_email: false,
      show_phone: false
    },
    notifications: {
      new_followers: true,
      new_likes: true,
      new_comments: true,
      new_messages: true,
      mentions: true,
      events: true,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false
    },
    appearance: {
      theme: 'auto',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      date_format: 'DD/MM/YYYY',
      time_format: '24h'
    },
    security: {
      two_factor_enabled: false,
      login_notifications: true,
      session_timeout: 5,
      password_change_required: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        
        // Buscar configurações do usuário
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setSettings(prev => ({
            ...prev,
            ...data.settings
          }))
        }

      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user?.id, supabase])

  const handleSave = async () => {
    if (!user?.id) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess('Configurações salvas com sucesso!')

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)

    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const languageOptions = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' }
  ]

  const timezoneOptions = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' }
  ]

  if (loading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Configurações
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize sua experiência no OpenLove
          </p>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-pink-500 hover:bg-pink-600 text-white"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      {/* Mensagens */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-700 dark:text-green-300">{success}</span>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-lg">
                    {profile?.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={settings.profile.full_name}
                    onChange={(e) => updateSetting('profile', 'full_name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={settings.profile.username}
                    onChange={(e) => updateSetting('profile', 'username', e.target.value)}
                    placeholder="@seuusuario"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={settings.profile.location}
                    onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                    placeholder="Sua cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.profile.website}
                    onChange={(e) => updateSetting('profile', 'website', e.target.value)}
                    placeholder="https://seusite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={settings.profile.birth_date}
                    onChange={(e) => updateSetting('profile', 'birth_date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacidade */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações de Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Visibilidade do Perfil</Label>
                    <p className="text-sm text-gray-500">Quem pode ver seu perfil</p>
                  </div>
                  <select
                    value={settings.privacy.profile_visibility}
                    onChange={(e) => updateSetting('privacy', 'profile_visibility', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="public">Público</option>
                    <option value="friends">Apenas Amigos</option>
                    <option value="private">Privado</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Status Online</Label>
                    <p className="text-sm text-gray-500">Mostrar quando você está online</p>
                  </div>
                  <Switch
                    checked={settings.privacy.show_online_status}
                    onCheckedChange={(checked) => updateSetting('privacy', 'show_online_status', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Última Vez Visto</Label>
                    <p className="text-sm text-gray-500">Mostrar quando você foi visto por último</p>
                  </div>
                  <Switch
                    checked={settings.privacy.show_last_seen}
                    onCheckedChange={(checked) => updateSetting('privacy', 'show_last_seen', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mensagens</Label>
                    <p className="text-sm text-gray-500">Quem pode enviar mensagens para você</p>
                  </div>
                  <select
                    value={settings.privacy.allow_messages_from}
                    onChange={(e) => updateSetting('privacy', 'allow_messages_from', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="everyone">Todos</option>
                    <option value="friends">Apenas Amigos</option>
                    <option value="none">Ninguém</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mostrar Email</Label>
                    <p className="text-sm text-gray-500">Tornar seu email visível para outros</p>
                  </div>
                  <Switch
                    checked={settings.privacy.show_email}
                    onCheckedChange={(checked) => updateSetting('privacy', 'show_email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mostrar Telefone</Label>
                    <p className="text-sm text-gray-500">Tornar seu telefone visível para outros</p>
                  </div>
                  <Switch
                    checked={settings.privacy.show_phone}
                    onCheckedChange={(checked) => updateSetting('privacy', 'show_phone', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Novos Seguidores</Label>
                    <p className="text-sm text-gray-500">Quando alguém te seguir</p>
                  </div>
                  <Switch
                    checked={settings.notifications.new_followers}
                    onCheckedChange={(checked) => updateSetting('notifications', 'new_followers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Novas Curtidas</Label>
                    <p className="text-sm text-gray-500">Quando alguém curtir seu post</p>
                  </div>
                  <Switch
                    checked={settings.notifications.new_likes}
                    onCheckedChange={(checked) => updateSetting('notifications', 'new_likes', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Novos Comentários</Label>
                    <p className="text-sm text-gray-500">Quando alguém comentar seu post</p>
                  </div>
                  <Switch
                    checked={settings.notifications.new_comments}
                    onCheckedChange={(checked) => updateSetting('notifications', 'new_comments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Novas Mensagens</Label>
                    <p className="text-sm text-gray-500">Quando receber uma mensagem</p>
                  </div>
                  <Switch
                    checked={settings.notifications.new_messages}
                    onCheckedChange={(checked) => updateSetting('notifications', 'new_messages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Menções</Label>
                    <p className="text-sm text-gray-500">Quando alguém te mencionar</p>
                  </div>
                  <Switch
                    checked={settings.notifications.mentions}
                    onCheckedChange={(checked) => updateSetting('notifications', 'mentions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Eventos</Label>
                    <p className="text-sm text-gray-500">Notificações sobre eventos</p>
                  </div>
                  <Switch
                    checked={settings.notifications.events}
                    onCheckedChange={(checked) => updateSetting('notifications', 'events', checked)}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Canais de Notificação</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <div>
                        <Label className="text-base font-medium">Email</Label>
                        <p className="text-sm text-gray-500">Receber notificações por email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.email_notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <div>
                        <Label className="text-base font-medium">Push</Label>
                        <p className="text-sm text-gray-500">Notificações push no navegador</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.push_notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'push_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <div>
                        <Label className="text-base font-medium">SMS</Label>
                        <p className="text-sm text-gray-500">Receber notificações por SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.sms_notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'sms_notifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Configurações de Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <select
                    id="theme"
                    value={settings.appearance.theme}
                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    value={settings.appearance.language}
                    onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <select
                    id="timezone"
                    value={settings.appearance.timezone}
                    onChange={(e) => updateSetting('appearance', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    {timezoneOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="time_format">Formato de Hora</Label>
                  <select
                    id="time_format"
                    value={settings.appearance.time_format}
                    onChange={(e) => updateSetting('appearance', 'time_format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="12h">12 horas (AM/PM)</option>
                    <option value="24h">24 horas</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-500">Adicionar uma camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={settings.security.two_factor_enabled}
                    onCheckedChange={(checked) => updateSetting('security', 'two_factor_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notificações de Login</Label>
                    <p className="text-sm text-gray-500">Receber notificação quando fizer login</p>
                  </div>
                  <Switch
                    checked={settings.security.login_notifications}
                    onCheckedChange={(checked) => updateSetting('security', 'login_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Alteração de Senha Obrigatória</Label>
                    <p className="text-sm text-gray-500">Forçar alteração de senha</p>
                  </div>
                  <Switch
                    checked={settings.security.password_change_required}
                    onCheckedChange={(checked) => updateSetting('security', 'password_change_required', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="session_timeout">Timeout de Sessão (horas)</Label>
                  <select
                    id="session_timeout"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value={1}>1 hora</option>
                    <option value={5}>5 horas</option>
                    <option value={12}>12 horas</option>
                    <option value={24}>24 horas</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Sessões Ativas</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Chrome - Windows</p>
                      <p className="text-sm text-gray-500">São Paulo, Brasil • Ativo agora</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Encerrar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Safari - iPhone</p>
                      <p className="text-sm text-gray-500">Rio de Janeiro, Brasil • Há 2 horas</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Encerrar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 