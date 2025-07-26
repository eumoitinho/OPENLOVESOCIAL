"use client"

import type React from "react"
import { useState } from "react"
import { Clock, Users, Calendar, AlertTriangle, TrendingUp, Eye } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { Card, CardHeader, CardBody, Button, Badge, Tabs, Tab, Chip } from "@heroui/react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react"

type Profile = Database["public"]["Tables"]["users"]["Row"]

interface AdminStats {
  totalUsers: number
  totalCommunities: number
  totalEvents: number
  pendingReports: number
}

interface Report {
  id: string
  report_type: string
  description: string
  status: string
  created_at: string
  reporter: { username: string; full_name: string } | null
  reported_user: { username: string; full_name: string } | null
}

interface AdminContentProps {
  user: User
  profile: Profile
  stats: AdminStats
  recentReports: Report[]
  recentUsers: Profile[]
}

const getReportTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    user: "Usuário",
    content: "Conteúdo",
    spam: "Spam",
    harassment: "Assédio",
    other: "Outro",
  }
  return labels[type] || type
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "resolved":
      return <Eye className="h-4 w-4 text-green-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-red-500" />
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const AdminContent: React.FC<AdminContentProps> = ({ profile, stats, recentReports, recentUsers }) => {
  const [selectedTab, setSelectedTab] = useState("dashboard")

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-gray-500">Bem-vindo de volta, {profile.full_name || profile.username}</p>
      </div>

      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={(key) => setSelectedTab(key as string)}
        aria-label="Admin tabs"
      >
        <Tab key="dashboard" title="Dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <h4 className="text-sm font-medium">Total de Usuários</h4>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% desde o mês passado
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <h4 className="text-sm font-medium">Comunidades</h4>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{stats.totalCommunities}</div>
                <p className="text-xs text-gray-500">+5 novas esta semana</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <h4 className="text-sm font-medium">Eventos</h4>
                <Calendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-gray-500">{Math.floor(stats.totalEvents * 0.3)} ativos</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <h4 className="text-sm font-medium">Relatórios Pendentes</h4>
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{stats.pendingReports}</div>
                <p className="text-xs text-gray-500">Requer atenção</p>
              </CardBody>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Relatórios Recentes</h3>
              <p className="text-sm text-gray-500">Últimos relatórios de moderação</p>
            </CardHeader>
            <CardBody>
              <Table aria-label="Recent reports">
                <TableHeader>
                  <TableColumn>Tipo</TableColumn>
                  <TableColumn>Descrição</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Data</TableColumn>
                  <TableColumn>Ações</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentReports.slice(0, 5).map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {getReportTypeLabel(report.report_type)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="max-w-xs truncate">{report.description}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span className="capitalize">{report.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="bordered">
                          Revisar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="reports" title="Relatórios">
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Todos os Relatórios</h3>
              <p className="text-sm text-gray-500">Gerencie relatórios de moderação</p>
            </CardHeader>
            <CardBody>
              <Table aria-label="All reports">
                <TableHeader>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>Tipo</TableColumn>
                  <TableColumn>Descrição</TableColumn>
                  <TableColumn>Reportado por</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Data</TableColumn>
                  <TableColumn>Ações</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <span className="font-mono text-xs">{report.id.slice(0, 8)}...</span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {getReportTypeLabel(report.report_type)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="max-w-xs truncate">{report.description}</span>
                      </TableCell>
                      <TableCell>{report.reporter?.username || "Anônimo"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span className="capitalize">{report.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="bordered">
                            Revisar
                          </Button>
                          <Button size="sm" color="danger">
                            Resolver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="users" title="Usuários">
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Usuários Recentes</h3>
              <p className="text-sm text-gray-500">Últimos usuários registrados</p>
            </CardHeader>
            <CardBody>
              <Table aria-label="Recent users">
                <TableHeader>
                  <TableColumn>Nome de Usuário</TableColumn>
                  <TableColumn>Nome Completo</TableColumn>
                  <TableColumn>Data de Registro</TableColumn>
                  <TableColumn>Ações</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">@{user.username}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="bordered">
                            Ver Perfil
                          </Button>
                          <Button size="sm" color="danger">
                            Suspender
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}

export default AdminContent