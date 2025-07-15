// Função para calcular distância entre duas coordenadas (fórmula de Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Função para formatar distância
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

// Função para verificar se duas localizações estão próximas
export function isNearby(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxDistance: number = 50 // 50km por padrão
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2)
  return distance <= maxDistance
}

// Função para obter faixa de distância
export function getDistanceRange(distance: number): string {
  if (distance < 5) return "Muito próximo"
  if (distance < 20) return "Próximo"
  if (distance < 50) return "Perto"
  if (distance < 100) return "Distante"
  return "Muito distante"
}

// Função para validar coordenadas
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

// Função para obter coordenadas aproximadas por UF
export function getUFCoordinates(uf: string): { latitude: number; longitude: number } {
  const coordinatesMap: { [key: string]: { latitude: number; longitude: number } } = {
    'AC': { latitude: -8.77, longitude: -70.55 },
    'AL': { latitude: -9.71, longitude: -35.73 },
    'AM': { latitude: -3.12, longitude: -60.02 },
    'AP': { latitude: 0.03, longitude: -51.07 },
    'BA': { latitude: -12.97, longitude: -38.50 },
    'CE': { latitude: -3.72, longitude: -38.54 },
    'DF': { latitude: -15.78, longitude: -47.92 },
    'ES': { latitude: -20.31, longitude: -40.31 },
    'GO': { latitude: -16.64, longitude: -49.31 },
    'MA': { latitude: -2.53, longitude: -44.30 },
    'MG': { latitude: -19.92, longitude: -43.93 },
    'MS': { latitude: -20.44, longitude: -54.64 },
    'MT': { latitude: -15.60, longitude: -56.10 },
    'PA': { latitude: -1.45, longitude: -48.50 },
    'PB': { latitude: -7.12, longitude: -34.88 },
    'PE': { latitude: -8.05, longitude: -34.88 },
    'PI': { latitude: -5.09, longitude: -42.80 },
    'PR': { latitude: -25.42, longitude: -49.27 },
    'RJ': { latitude: -22.91, longitude: -43.20 },
    'RN': { latitude: -5.79, longitude: -35.21 },
    'RO': { latitude: -8.76, longitude: -63.90 },
    'RR': { latitude: 2.82, longitude: -60.67 },
    'RS': { latitude: -30.03, longitude: -51.23 },
    'SC': { latitude: -27.59, longitude: -48.55 },
    'SE': { latitude: -10.90, longitude: -37.07 },
    'SP': { latitude: -23.55, longitude: -46.63 },
    'TO': { latitude: -10.17, longitude: -48.33 }
  }

  return coordinatesMap[uf] || { latitude: -15.7801, longitude: -47.9292 }
} 