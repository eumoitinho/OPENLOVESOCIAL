"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Grid, List, Plus, Filter, Search } from "lucide-react"
import Link from "next/link"
import EventCalendar from "@/components/events/EventCalendar"
import EventCard from "@/components/events/EventCard"
import { useAuth } from "@/components/auth/AuthProvider"

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location?: string
  is_online: boolean
  event_type: string
  image_url?: string
  price: number
  current_participants: number
  max_participants?: number
  communities?: {
    name: string
    slug: string
  }
}

interface EventsContentProps {
  initialEvents: Event[]
}

const EVENT_TYPES = [
  { value: "", label: "Todos os tipos" },
  { value: "meetup", label: "Meetup" },
  { value: "workshop", label: "Workshop" },
  { value: "conference", label: "Conferência" },
  { value: "social", label: "Social" },
  { value: "other", label: "Outro" },
]

const EventsContent: React.FC<EventsContentProps> = ({ initialEvents }) => {
  const [events] = useState<Event[]>(initialEvents)
  const [viewMode, setViewMode] = useState<"calendar" | "grid" | "list">("calendar")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const { user } = useAuth()

  // Filtrar eventos
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = !selectedType || event.event_type === selectedType

    return matchesSearch && matchesType
  })

  const handleEventSelect = (event: Event) => {
    // Navegar para página do evento
    window.location.href = `/events/${event.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ConnectHub
            </Link>
            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/communities" className="text-gray-700 hover:text-blue-600">
                Comunidades
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-blue-600">
                Buscar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
                <p className="text-gray-600">
                  Descubra eventos incríveis e conecte-se com pessoas que compartilham seus interesses
                </p>
              </div>
              {user && (
                <Link
                  href="/events/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Evento
                </Link>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events Display */}
        {viewMode === "calendar" && <EventCalendar events={filteredEvents} onSelectEvent={handleEventSelect} />}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <EventCard event={event} layout="horizontal" />
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum evento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedType
                ? "Tente ajustar seus filtros de busca."
                : "Não há eventos disponíveis no momento."}
            </p>
            {user && (
              <div className="mt-6">
                <Link
                  href="/events/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Evento
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default EventsContent
