"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Slider } from "../../../components/ui/slider"
import { Input } from "../../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { useRouter } from "next/navigation"

const PROFILE_TYPES = [
  "Não importa / Todos",
  "Casais",
  "Casais (2 mulheres)",
  "Casais (2 homens)",
  "Homens",
  "Homens Trans",
  "Mulheres",
  "Mulheres Trans",
  "Travestis",
  "Cross-dressing (CD)",
]

const ACCESS_OPTIONS = [
  "Nos últimos 30 dias",
  "Nos últimos 7 dias",
  "Hoje",
  "Online agora",
]

const ORDER_OPTIONS = [
  "Recomendados",
  "Mais próximos",
  "Mais recentes",
]

interface ProfileSearchProps {
  onProfileClick?: () => void
}

export default function ProfileSearch({ onProfileClick }: ProfileSearchProps) {
  const router = useRouter()
  // Filtros de busca
  const [profileType, setProfileType] = useState("Não importa / Todos")
  const [distance, setDistance] = useState(50)
  const [city, setCity] = useState("Curitiba")
  const [uf, setUf] = useState("PR")
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(80)
  const [access, setAccess] = useState(ACCESS_OPTIONS[0])
  const [order, setOrder] = useState(ORDER_OPTIONS[0])
  const [showCityEdit, setShowCityEdit] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number, city?: string, uf?: string} | null>(null)

  // Perfis reais
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detectar localização ao carregar
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village || ""
          const uf = data.address.state || data.address.region || ""
          setUserLocation({ lat: latitude, lon: longitude, city, uf })
          setCity(city)
          setUf(uf)
        } catch (e) {
          setUserLocation({ lat: latitude, lon: longitude })
        }
      })
    }
  }, [])

  // Ao buscar perfis, enviar lat/lon se disponível
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/api/search/users?city=${city}&uf=${uf}&type=${profileType}&ageMin=${ageMin}&ageMax=${ageMax}`
        if (userLocation) {
          url += `&lat=${userLocation.lat}&lon=${userLocation.lon}&distance=${distance}`
        }
        const res = await fetch(url)
        if (!res.ok) throw new Error("Erro ao buscar perfis")
        const json = await res.json()
        setProfiles(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchProfiles()
  }, [profileType, city, uf, ageMin, ageMax, userLocation, distance])

  // Filtro dos perfis (aplicação local de filtros adicionais)
  const filteredProfiles = profiles.filter((p) => {
    const typeOk = profileType === "Não importa / Todos" || p.type === profileType
    const distOk = p.distance <= distance
    const ageOk = p.age >= ageMin && p.age <= ageMax
    // access e city já são filtrados na API
    return typeOk && distOk && ageOk
  })

  return (
    <div className="w-full max-w-3xl mx-auto p-1 sm:p-4 space-y-3 min-w-[0]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Buscar por</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-nowrap gap-2 mb-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 min-w-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            {PROFILE_TYPES.map((type) => (
              <Button
                key={type}
                variant={profileType === type ? "default" : "outline"}
                onClick={() => setProfileType(type)}
                className="rounded-full px-3 py-1 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 min-w-[90px]"
                style={{ minWidth: 90 }}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end min-w-0">
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm mb-1">Com distância de até</label>
              <div className="flex items-center gap-2 min-w-0">
                <Select value={distance.toString()} onValueChange={v => setDistance(Number(v))}>
                  <SelectTrigger className="w-full sm:w-40 min-w-0 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100, 200, 500].map((km) => (
                      <SelectItem key={km} value={km.toString()}>{`até ${km}km`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  de {city}/{uf} <button className="underline ml-1" onClick={() => setShowCityEdit(true)}>alterar</button>
                </span>
              </div>
              <span className="text-xs text-gray-400 sm:hidden block mt-1">
                de {city}/{uf} <button className="underline ml-1" onClick={() => setShowCityEdit(true)}>alterar</button>
              </span>
              {showCityEdit && (
                <div className="flex gap-2 mt-2 min-w-0">
                  <Input value={city} onChange={e => setCity(e.target.value)} className="w-1/2 min-w-0 text-xs" placeholder="Cidade" />
                  <Input value={uf} onChange={e => setUf(e.target.value)} className="w-1/4 min-w-0 text-xs" placeholder="UF" maxLength={2} />
                  <Button size="sm" className="text-xs px-2" onClick={() => setShowCityEdit(false)}>OK</Button>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm mb-1">Com idade entre</label>
              <div className="flex gap-2 items-center min-w-0">
                <Input
                  type="number"
                  min={18}
                  max={ageMax}
                  value={ageMin}
                  onChange={e => setAgeMin(Number(e.target.value))}
                  className="w-14 min-w-0 text-xs"
                />
                <span className="text-xs">e</span>
                <Input
                  type="number"
                  min={ageMin}
                  max={80}
                  value={ageMax}
                  onChange={e => setAgeMax(Number(e.target.value))}
                  className="w-14 min-w-0 text-xs"
                />
                <span className="text-xs">anos</span>
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end min-w-0">
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm mb-1">Com acesso feito</label>
              <Select value={access} onValueChange={setAccess}>
                <SelectTrigger className="w-full sm:w-40 min-w-0 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs sm:text-sm mb-1">Ordenar por</label>
              <Select value={order} onValueChange={setOrder}>
                <SelectTrigger className="w-full sm:w-40 min-w-0 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 min-w-0">
        {loading && <div className="text-center text-gray-400 py-8">Carregando perfis...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {!loading && !error && (filteredProfiles || []).length === 0 && (
          <div className="text-center text-gray-400 py-8">Nenhum perfil encontrado.</div>
        )}
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="flex items-center gap-2 p-2 sm:p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full min-w-0">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap min-w-0">
                <span className="font-semibold text-sm sm:text-lg truncate">{profile.name}</span>
                <Badge variant="secondary" className="text-xs">{profile.type}</Badge>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                {profile.city}{profile.uf ? `/${profile.uf}` : ""} • {profile.distance}km de distância
              </div>
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">Acesso: {profile.lastAccess}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
import { CardContent } from "@/components/ui/card"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"