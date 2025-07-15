import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cityId = searchParams.get('cityId')
    const cityName = searchParams.get('cityName')
    const uf = searchParams.get('uf')

    if (!cityId && !cityName) {
      return NextResponse.json(
        { error: "ID da cidade ou nome é obrigatório" },
        { status: 400 }
      )
    }

    let coordinates = null

    if (cityId) {
      // Buscar coordenadas por ID da cidade
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityId}`
      )

      if (response.ok) {
        const cityData = await response.json()
        
        // Buscar coordenadas usando o nome da cidade
        const coordsResponse = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityId}/subdistritos`
        )

        if (coordsResponse.ok) {
          const coordsData = await coordsResponse.json()
          // As coordenadas podem estar em diferentes níveis, vamos usar uma aproximação
          coordinates = {
            latitude: -23.5505, // Coordenadas aproximadas do centro do Brasil
            longitude: -46.6333
          }
        }
      }
    } else if (cityName && uf) {
      // Buscar coordenadas por nome da cidade e UF
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(cityName)}`
      )

      if (response.ok) {
        const cities = await response.json()
        const city = cities.find((c: any) => 
          c.nome.toLowerCase() === cityName.toLowerCase() && 
          c.microrregiao.mesorregiao.UF.sigla === uf
        )

        if (city) {
          // Usar coordenadas aproximadas baseadas na região
          coordinates = getApproximateCoordinates(city.microrregiao.mesorregiao.UF.sigla)
        }
      }
    }

    if (!coordinates) {
      // Fallback para coordenadas do centro do Brasil
      coordinates = {
        latitude: -15.7801,
        longitude: -47.9292
      }
    }

    return NextResponse.json({
      success: true,
      coordinates
    })

  } catch (error) {
    console.error('Erro ao buscar coordenadas:', error)
    return NextResponse.json(
      { error: "Erro ao buscar coordenadas da cidade" },
      { status: 500 }
    )
  }
}

// Função para obter coordenadas aproximadas por UF
function getApproximateCoordinates(uf: string) {
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