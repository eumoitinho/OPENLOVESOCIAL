"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { useCanAccess, usePlanUsage } from '@/lib/plans/hooks'
import { usePaywall } from '@/lib/plans/paywall'
import PaywallModal from '@/components/plan-limits/PaywallModal'
import PlanIndicator from '@/components/plan-limits/PlanIndicator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export default function CreateEventPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  })
  
  const canAccess = useCanAccess()
  const usage = usePlanUsage()
  const { paywall, requireFeature, closePaywall } = usePaywall()

  if (!profile) {
    // Redirect to signin if not authenticated, or show a message
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Você precisa estar logado para criar eventos.</p>
        <Button onClick={() => router.push("/auth/signin")} className="mt-4">
          Fazer Login
        </Button>
      </div>
    )
  }

  // Verificar se pode criar eventos usando o sistema de planos
  if (!canAccess.canCreateEvents) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Funcionalidade Premium</h1>
        <p className="mt-2">Apenas assinantes podem criar eventos.</p>
        <div className="mt-4 space-y-4">
          <PlanIndicator variant="detailed" />
          <Button onClick={() => router.push("/pricing")}>
            Ver Planos Premium
          </Button>
        </div>
      </div>
    )
  }
  
  // Verificar se ainda pode criar mais eventos este mês
  if (!usage.canCreateMoreEvents) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Limite de Eventos Atingido</h1>
        <p className="mt-2">
          Você já criou {usage.eventsCreatedThisMonth} de {usage.maxEventsPerMonth} eventos este mês.
        </p>
        <div className="mt-4 space-y-4">
          <PlanIndicator variant="detailed" />
          <Button onClick={() => router.push("/pricing")}>
            Fazer Upgrade
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        toast({ title: "Evento criado com sucesso!" })
        router.push("/events")
      } else {
        throw new Error("Erro ao criar evento")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({ ...eventData, [e.target.id]: e.target.value })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {usage.eventsCreatedThisMonth} / {usage.maxEventsPerMonth === -1 ? '∞' : usage.maxEventsPerMonth} eventos este mês
          </div>
          <PlanIndicator variant="compact" />
        </div>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Detalhes do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Eventos criados não são verificados automaticamente. Após criar seu evento, você pode solicitar verificação 
              para aumentar a confiança e visibilidade. {canAccess.currentPlan === 'free' && 'Usuários gratuitos só podem ver eventos verificados.'}
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Título do Evento</Label>
              <Input id="title" value={eventData.title} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={eventData.description} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Data e Hora</Label>
                <Input id="event_date" type="datetime-local" value={eventData.event_date} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input id="location" value={eventData.location} onChange={handleChange} required />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Evento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Paywall Modal */}
      {paywall.config && (
        <PaywallModal
          isOpen={paywall.isOpen}
          onClose={closePaywall}
          feature={paywall.config.feature}
          title={paywall.config.title}
          description={paywall.config.description}
          requiredPlan={paywall.config.requiredPlan}
        />
      )}
    </div>
  )
}
