"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Users, TrendingUp, Heart, Sparkles, Filter, BarChart3 } from "lucide-react"
import { AdvancedSearch } from "@/app/components/search/AdvancedSearch"
import ProfileRecommendations from "@/app/components/profile/ProfileRecommendations"
import ProfileAnalytics from "@/app/components/analytics/ProfileAnalytics"
import { useAuth } from "@/app/components/auth/AuthProvider"

export default function ExplorePage() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState("search")

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="text-center p-6 sm:p-8">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Faça login para explorar
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                Descubra pessoas incríveis perto de você
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <a href="/auth/signin">Entrar</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/auth/signup">Criar conta</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Explorar
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Descubra pessoas compatíveis com você
              </p>
            </div>
          </div>
          
          {/* Quick Stats - Responsivo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Usuários ativos</div>
                  <div className="text-lg sm:text-xl font-bold">2.5K+</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Matches hoje</div>
                  <div className="text-lg sm:text-xl font-bold">847</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Taxa de sucesso</div>
                  <div className="text-lg sm:text-xl font-bold">73%</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Seu score</div>
                  <div className="text-lg sm:text-xl font-bold">
                    {profile?.stats?.compatibility_score || 0}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Buscar</span>
              <span className="sm:hidden">Busca</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Recomendações</span>
              <span className="sm:hidden">Recs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Filter className="w-5 h-5" />
                  Busca Avançada
                </CardTitle>
                <CardDescription className="text-sm">
                  Use filtros inteligentes para encontrar pessoas compatíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedSearch />
              </CardContent>
            </Card>
            
            {/* Search Tips - Melhor responsividade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dicas de Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Para melhores resultados:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Complete seu perfil com interesses e bio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Use filtros de localização para encontrar pessoas próximas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Experimente diferentes combinações de filtros</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Algoritmo inteligente:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Prioriza pessoas com interesses em comum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Considera proximidade geográfica</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Leva em conta atividade e compatibilidade</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6">
            {/* Layout responsivo melhorado */}
            <div className="space-y-6 xl:grid xl:grid-cols-4 xl:gap-6 xl:space-y-0">
              <div className="xl:col-span-3">
                <ProfileRecommendations />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Como funciona</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-pink-600">1</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Análise de perfil</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Analisamos seus interesses e preferências
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Algoritmo IA</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Calculamos compatibilidade com outros usuários
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">3</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Recomendações</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Sugerimos os melhores matches para você
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Algoritmos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-start text-xs">
                        🔮 Híbrido (Recomendado)
                      </Badge>
                      <Badge variant="outline" className="w-full justify-start text-xs">
                        👥 Colaborativo
                      </Badge>
                      <Badge variant="outline" className="w-full justify-start text-xs">
                        🎯 Baseado em conteúdo
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Experimente diferentes algoritmos para encontrar o que funciona melhor para você.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <ProfileAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
