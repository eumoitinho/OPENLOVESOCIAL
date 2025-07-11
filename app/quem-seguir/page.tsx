"use client"
import { useEffect, useState } from "react"
import ProfileCard from "@/app/components/timeline/ProfileCard"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function QuemSeguirPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number, city?: string, uf?: string} | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lon: longitude })
      })
    }
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "/api/search/users?suggested=1"
      if (userLocation) {
        url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error("Erro ao buscar sugestões")
      const json = await res.json()
      setProfiles(json.data || [])
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [userLocation])

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: userId })
      })
      
      if (res.ok) {
        setProfiles(prev => 
          prev.map(profile => 
            profile.id === userId 
              ? { ...profile, is_following: !profile.is_following }
              : profile
          )
        )
      }
    } catch (err) {
      console.error("Erro ao seguir usuário:", err)
    }
  }

  const handleSave = async (userId: string) => {
    // Implementar lógica de salvar perfil
    console.log("Salvando perfil:", userId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 py-8 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Sugestões para você seguir</h1>
            <p className="text-muted-foreground mt-1">
              Descubra pessoas interessantes para conectar
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchProfiles}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center text-gray-400 py-8">
            Carregando sugestões...
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-8">
            {error}
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Nenhuma sugestão encontrada.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              profile={profile}
              onFollow={handleFollow}
              onSave={handleSave}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 