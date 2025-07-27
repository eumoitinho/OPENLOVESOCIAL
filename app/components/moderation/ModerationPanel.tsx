"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  MessageCircle,
  FileText,
  Flag,
  Ban,
  Eye,
  MoreVertical,
  Filter,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface Report {
  id: string
  reporter_id: string
  target_id: string
  target_type: 'user' | 'post' | 'message' | 'comment'
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  created_at: string
  reporter?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  target_data?: {
    id: string
    title?: string
    content?: string
    user?: {
      id: string
      name: string
      username: string
      avatar_url?: string
    }
  }
}

interface ModerationStats {
  totalReports: number
  pendingReports: number
  resolvedReports: number
  dismissedReports: number
  bannedUsers: number
  warningsIssued: number
}

interface ModerationPanelProps {
  className?: string
}

export function ModerationPanel({ className }: ModerationPanelProps) {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all')
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simular dados de denúncias (em produção, isso viria de APIs reais)
        const mockReports: Report[] = [
          {
            id: "1",
            reporter_id: "user1",
            target_id: "post1",
            target_type: "post",
            reason: "inappropriate",
            description: "Conteúdo ofensivo e inadequado",
            status: "pending",
            created_at: "2024-01-15T10:30:00Z",
            reporter: {
              id: "user1",
              name: "João Silva",
              username: "joaosilva",
              avatar_url: undefined
            },
            target_data: {
              id: "post1",
              content: "Conteúdo do post denunciado...",
              user: {
                id: "user2",
                name: "Maria Santos",
                username: "mariasantos",
                avatar_url: undefined
              }
            }
          },
          {
            id: "2",
            reporter_id: "user3",
            target_id: "user4",
            target_type: "user",
            reason: "fake",
            description: "Perfil falso com fotos de outras pessoas",
            status: "reviewed",
            created_at: "2024-01-14T15:45:00Z",
            reporter: {
              id: "user3",
              name: "Pedro Costa",
              username: "pedrocosta",
              avatar_url: undefined
            },
            target_data: {
              id: "user4",
              user: {
                id: "user4",
                name: "Ana Oliveira",
                username: "anaoliveira",
                avatar_url: undefined
              }
            }
          },
          {
            id: "3",
            reporter_id: "user5",
            target_id: "message1",
            target_type: "message",
            reason: "harassment",
            description: "Mensagem com assédio e ameaças",
            status: "resolved",
            created_at: "2024-01-13T09:20:00Z",
            reporter: {
              id: "user5",
              name: "Carlos Lima",
              username: "carloslima",
              avatar_url: undefined
            },
            target_data: {
              id: "message1",
              content: "Mensagem denunciada...",
              user: {
                id: "user6",
                name: "Roberto Alves",
                username: "robertoalves",
                avatar_url: undefined
              }
            }
          }
        ]

        const mockStats: ModerationStats = {
          totalReports: 156,
          pendingReports: 23,
          resolvedReports: 98,
          dismissedReports: 35,
          bannedUsers: 12,
          warningsIssued: 45
        }

        setReports(mockReports)
        setStats(mockStats)

      } catch (err) {
        console.error('Erro ao buscar denúncias:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReports()
    }
  }, [user, supabase])

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter
    const matchesSearch = searchTerm === "" || 
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleAction = async (reportId: string, action: 'approve' | 'dismiss' | 'ban' | 'warn') => {
    try {
      // Aqui você implementaria as ações de moderação
      console.log(`Ação ${action} aplicada ao report ${reportId}`)
      
      // Atualizar status local
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
            : report
        )
      )

      // Fechar modal de detalhes
      setSelectedReport(null)

    } catch (err) {
      console.error('Erro ao executar ação:', err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'dismissed': return <XCircle className="w-4 h-4 text-gray-500" />
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pendente</Badge>
      case 'reviewed': return <Badge variant="outline">Revisado</Badge>
      case 'resolved': return <Badge variant="default">Resolvido</Badge>
      case 'dismissed': return <Badge variant="destructive">Descartado</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />
      case 'post': return <FileText className="w-4 h-4" />
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'comment': return <MessageCircle className="w-4 h-4" />
      default: return <Flag className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className || ''}`}>
        <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Erro ao carregar painel de moderação
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Painel de Moderação
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie denúncias e mantenha a comunidade segura
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar denúncias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Denúncias
              </CardTitle>
              <Flag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalReports}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Denúncias recebidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingReports}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Aguardando revisão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolvidas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolvedReports}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ações tomadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Usuários Banidos
              </CardTitle>
              <Ban className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.bannedUsers}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contas suspensas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Denúncias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Denúncias</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="reviewed">Revisadas</TabsTrigger>
                  <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
                  <TabsTrigger value="dismissed">Descartadas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma denúncia encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "Tente ajustar sua busca" : "Não há denúncias para revisar"}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Ícone de status */}
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(report.status)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {getTargetIcon(report.target_type)}
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {report.target_type === 'user' ? 'Usuário' : 
                               report.target_type === 'post' ? 'Post' : 
                               report.target_type === 'message' ? 'Mensagem' : 'Comentário'}
                            </span>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={report.reporter?.avatar_url} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                                {report.reporter?.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Denunciado por <strong>{report.reporter?.name}</strong>
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Motivo: {report.reason}
                            </p>
                            {report.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {report.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatDate(report.created_at)}</span>
                            {report.target_data?.user && (
                              <span>
                                Alvo: <strong>{report.target_data.user.name}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        Ver Detalhes
                      </Button>
                      
                      {report.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(report.id, 'approve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(report.id, 'dismiss')}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            Descartar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedReport(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Detalhes da Denúncia
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedReport(null)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Informações da Denúncia */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedReport.status)}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Status: {selectedReport.status}
                      </span>
                      {getStatusBadge(selectedReport.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Denunciante
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedReport.reporter?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                              {selectedReport.reporter?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {selectedReport.reporter?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{selectedReport.reporter?.username}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Data da Denúncia
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {formatDate(selectedReport.created_at)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Motivo
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">
                        {selectedReport.reason}
                      </p>
                    </div>

                    {selectedReport.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Descrição
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-gray-100">
                          {selectedReport.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo Denunciado */}
                  {selectedReport.target_data && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Conteúdo Denunciado
                      </h4>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        {selectedReport.target_data.user && (
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedReport.target_data.user.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                                {selectedReport.target_data.user.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {selectedReport.target_data.user.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{selectedReport.target_data.user.username}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {selectedReport.target_data.content && (
                          <p className="text-gray-900 dark:text-gray-100">
                            {selectedReport.target_data.content}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  {selectedReport.status === 'pending' && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Ações de Moderação
                      </h4>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleAction(selectedReport.id, 'approve')}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar Denúncia
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleAction(selectedReport.id, 'warn')}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Advertir Usuário
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleAction(selectedReport.id, 'ban')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Banir Usuário
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleAction(selectedReport.id, 'dismiss')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Descartar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 
