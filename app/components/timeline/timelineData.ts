// Sample data for posts
export const samplePosts = [
  {
    id: "1",
    author: {
      name: "Amanda Silva",
      username: "amanda_love",
      avatar: "/placeholder.svg?height=40&width=40",
      isPremium: true,
      isFollowing: false,
      location: "Rio de Janeiro, RJ",
      bio: "Vivendo a vida com amor e liberdade 💕",
    },
    content:
      "Vivendo momentos incríveis com meu amor! 🌊 Praia de Copacabana hoje foi perfeita para relaxar e conectar. #OpenLove #Casal #RioDeJaneiro",
    image: "/placeholder.svg?height=300&width=500",
    hashtags: ["OpenLove", "Casal", "RioDeJaneiro"],
    stats: {
      likes: 42,
      comments: 2,
      shares: 5,
    },
    isLiked: false,
    createdAt: "09/07/2025",
    time: "14:30",
    visibility: "public",
  },
  {
    id: "2",
    author: {
      name: "Alice Santos",
      username: "alice_sp",
      avatar: "/placeholder.svg?height=40&width=40",
      isPremium: false,
      isFollowing: false,
      location: "São Paulo, SP",
      bio: "Buscando conexões autênticas ✨",
    },
    content:
      "Procurando novas amizades em SP! Alguém conhece lugares legais para conhecer pessoas? Adoro café, arte e conversas profundas ☕ #Amizades #SaoPaulo",
    hashtags: ["Amizades", "SaoPaulo"],
    stats: {
      likes: 15,
      comments: 8,
      shares: 2,
    },
    isLiked: false,
    createdAt: "09/07/2025",
    time: "12:15",
    visibility: "public",
  },
  {
    id: "3",
    author: {
      name: "Lisa Photography",
      username: "lisa_photos",
      avatar: "/placeholder.svg?height=40&width=40",
      isPremium: false,
      isFollowing: true,
      location: "Cascais, Portugal",
      bio: "Capturando momentos únicos 📸",
    },
    content:
      "Workshop de fotografia em Cascais, sábado, 12/07/2025! 🌅 Vamos capturar o nascer do sol juntos. Vagas limitadas! #Fotografia #Eventos #Cascais",
    image: "/placeholder.svg?height=300&width=500",
    hashtags: ["Fotografia", "Eventos", "Cascais"],
    stats: {
      likes: 28,
      comments: 12,
      shares: 7,
    },
    isLiked: true,
    createdAt: "08/07/2025",
    time: "18:45",
    isEvent: true,
    visibility: "public",
    eventDetails: {
      date: "12/07/2025",
      time: "06:00",
      location: "Praia de Cascais",
      participants: 15,
      maxParticipants: 20,
    },
  },
]

// Sample users for search and suggestions
export const sampleUsers = [
  {
    id: "1",
    name: "Carlos Mendes",
    username: "carlos_m",
    avatar: "/placeholder.svg?height=40&width=40",
    location: "São Paulo, SP",
    age: 28,
    interests: ["Música", "Viagem", "Fotografia"],
    isPremium: false,
    isFollowing: false,
    mutualFriends: 3,
    bio: "Músico e viajante",
  },
  {
    id: "2",
    name: "Julia & Pedro",
    username: "julia_pedro",
    avatar: "/placeholder.svg?height=40&width=40",
    location: "Rio de Janeiro, RJ",
    age: 25,
    interests: ["Praia", "Dança", "Culinária"],
    isPremium: true,
    isFollowing: false,
    mutualFriends: 7,
    bio: "Casal apaixonado por dança",
  },
  {
    id: "3",
    name: "Marina Costa",
    username: "marina_c",
    avatar: "/placeholder.svg?height=40&width=40",
    location: "Belo Horizonte, MG",
    age: 30,
    interests: ["Arte", "Literatura", "Yoga"],
    isPremium: false,
    isFollowing: true,
    mutualFriends: 2,
    bio: "Artista e escritora",
  },
]

// Sample events
export const sampleEvents = [
  {
    id: "1",
    title: "Workshop de Fotografia",
    description: "Aprenda técnicas de fotografia com profissionais",
    date: "12/07/2025",
    time: "06:00",
    location: "Praia de Cascais",
    image: "/placeholder.svg?height=200&width=300",
    participants: 15,
    maxParticipants: 20,
    price: "Gratuito",
    organizer: "Lisa Photography",
    category: "Arte",
    isJoined: false,
  },
  {
    id: "2",
    title: "Encontro de Casais",
    description: "Noite especial para casais se conhecerem",
    date: "15/07/2025",
    time: "19:00",
    location: "Café Central, São Paulo",
    image: "/placeholder.svg?height=200&width=300",
    participants: 8,
    maxParticipants: 16,
    price: "R$ 50",
    organizer: "OpenLove Community",
    category: "Social",
    isJoined: true,
  },
]

// Sample conversations for chat
export const sampleConversations = [
  {
    id: "1",
    user: {
      name: "Amanda Silva",
      username: "amanda_love",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: true,
    },
    lastMessage: "Oi! Como você está?",
    timestamp: "14:30",
    unreadCount: 2,
  },
  {
    id: "2",
    user: {
      name: "Carlos Mendes",
      username: "carlos_m",
      avatar: "/placeholder.svg?height=40&width=40",
      isOnline: false,
    },
    lastMessage: "Vamos marcar aquele café?",
    timestamp: "12:15",
    unreadCount: 0,
  },
]

// Sample messages for active chat
export const sampleMessages = [
  {
    id: "1",
    content: "Oi! Como você está?",
    timestamp: "14:30",
    isOwn: false,
  },
  {
    id: "2",
    content: "Oi Amanda! Estou bem, obrigado! E você?",
    timestamp: "14:32",
    isOwn: true,
  },
  {
    id: "3",
    content: "Também estou bem! Vi seu post sobre a praia, que lindo!",
    timestamp: "14:33",
    isOwn: false,
  },
]

// Current user profile
export const currentUser = {
  name: "João Vitor",
  username: "joao_vitor",
  email: "joao@example.com",
  avatar: "/placeholder.svg?height=80&width=80",
  bio: "Explorando conexões autênticas e momentos especiais",
  location: "São Paulo, SP",
  age: 29,
  interests: ["Música", "Viagem", "Fotografia", "Culinária"],
  isPremium: false,
  followers: 156,
  following: 89,
  posts: 23,
  privacy: {
    profileVisibility: "public",
    showAge: true,
    showLocation: true,
    allowMessages: "friends",
  },
  stats: {
    friends: 0,
    posts: 0,
    likes: 0,
    views: 0,
    earnings: 0,
  },
}
