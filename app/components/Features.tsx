"use client"

import { MessageCircle, Calendar, Search, Shield, Camera, Star, Users, MapPin, Crown, Eye } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Busca Inteligente",
      description: "Encontre pessoas por interesses, localização, tipo de perfil e muito mais.",
      color: "bg-blue-500",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Chat em Tempo Real",
      description: "Converse com amigos mútuos (gratuito) ou qualquer pessoa (premium).",
      color: "bg-green-500",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Eventos Locais",
      description: "Crie e participe de eventos em sua cidade com pessoas interessantes.",
      color: "bg-purple-500",
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Compartilhamento de Mídia",
      description: "Compartilhe fotos e vídeos com marca d'água para proteção.",
      color: "bg-pink-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Timeline Social",
      description: "Veja postagens de amigos (gratuito) ou de todos os usuários (premium).",
      color: "bg-indigo-500",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Localização Precisa",
      description: "Busque por cidade e defina raio de distância em quilômetros.",
      color: "bg-red-500",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Sistema de Recomendações",
      description: "Receba e faça recomendações de outros usuários incríveis.",
      color: "bg-yellow-500",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Visualizações de Perfil",
      description: "Usuários premium podem ver quem visualizou seu perfil.",
      color: "bg-teal-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Moderação Ativa",
      description: "Ambiente seguro com sistema de denúncias e moderação.",
      color: "bg-gray-600",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Funcionalidades Incríveis</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra todas as ferramentas que o ConnectHub oferece para você fazer conexões autênticas e duradouras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`${feature.color} text-white p-3 rounded-lg inline-block mb-4`}>{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Premium Section */}
        <div className="mt-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Crown className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Desbloqueie Todo o Potencial</h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Com o plano Premium, você tem acesso completo a todas as funcionalidades, pode conversar com qualquer
              pessoa e ver quem visualizou seu perfil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">R$ 55</div>
                <div className="text-sm opacity-90">por mês</div>
              </div>
              <div className="text-white text-lg">ou</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">R$ 550</div>
                <div className="text-sm opacity-90">por ano</div>
                <div className="text-xs bg-green-500 px-2 py-1 rounded mt-1">2 meses grátis!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
