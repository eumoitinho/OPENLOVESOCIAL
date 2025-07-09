"use client"

import Link from "next/link"
import { ArrowRight, Users, MapPin, Heart } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"

export default function Hero() {
  const { user, loading } = useAuth()

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Conecte-se com pessoas
            <span className="block text-yellow-300">incríveis próximas a você</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Uma rede social segura para encontrar pessoas com interesses compartilhados, fazer novos amigos e participar
            de eventos em sua cidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {loading ? (
              <div className="animate-pulse bg-white/20 rounded-lg px-8 py-4 w-48 h-14"></div>
            ) : user ? (
              <Link
                href="/dashboard"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Ir para Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="border-2 border-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg transition-all duration-300"
                >
                  Já tenho conta
                </Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conexões Reais</h3>
              <p className="text-blue-100">Encontre pessoas com interesses similares em sua região</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Busca por Localização</h3>
              <p className="text-blue-100">Filtre por cidade e distância para encontrar pessoas próximas</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-white/10 p-4 rounded-full mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ambiente Seguro</h3>
              <p className="text-blue-100">Plataforma moderada com foco na segurança dos usuários</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
