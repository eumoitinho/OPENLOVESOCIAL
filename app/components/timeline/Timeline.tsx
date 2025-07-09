"use client"

import { useState, useEffect } from "react"
import { TimelineSidebar } from "./TimelineSidebar"
import { TimelineMain } from "./TimelineMain"
import { TimelineRightSidebar } from "./TimelineRightSidebar"
import { CreatePostDialog } from "./CreatePostDialog"
import { ChatDialog } from "./ChatDialog"
import { ProfileView } from "./ProfileView"
import { UserProfileView } from "./UserProfileView"
import { CommentsDialog } from "./CommentsDialog"
import { toast } from "@/hooks/use-toast"
import {
  samplePosts,
  sampleUsers,
  sampleEvents,
  sampleConversations,
  sampleMessages,
  currentUser,
} from "./timelineData"

export default function Timeline() {
  const [activeView, setActiveView] = useState("home")
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light")
  const [posts, setPosts] = useState(samplePosts)
  const [users, setUsers] = useState(sampleUsers)
  const [events, setEvents] = useState(sampleEvents)
  const [conversations, setConversations] = useState(sampleConversations)
  const [messages, setMessages] = useState(sampleMessages)
  const [comments, setComments] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [newComment, setNewComment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState({
    location: "Todas",
    ageRange: "Todas",
    interests: "",
    isPremium: false,
  })
  const [profile, setProfile] = useState(currentUser)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    content: "",
    images: [] as File[],
    video: null as File | null,
    isEvent: false,
    visibility: "public" as "public" | "friends",
    eventDetails: {
      date: "",
      time: "",
      location: "",
      maxParticipants: 10,
    },
  })

  // Auto theme detection
  useEffect(() => {
    const applyTheme = () => {
      if (theme === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        document.documentElement.classList.toggle("dark", prefersDark)
        document.documentElement.removeAttribute("data-theme")
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark")
        document.documentElement.setAttribute("data-theme", theme)
      }
    }

    applyTheme()

    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", applyTheme)
      return () => mediaQuery.removeEventListener("change", applyTheme)
    }
  }, [theme])

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats,
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post,
      ),
    )

    toast({
      title: "Post curtido!",
      description: "Sua curtida foi registrada.",
      duration: 2000,
      className: "notification-info",
    })
  }

  const handleComment = (postId: string) => {
    setActiveCommentsPost(postId)
    setIsCommentsOpen(true)

    // Simular carregamento de comentários
    const postComments = [
      {
        id: "1",
        author: {
          name: "Maria Silva",
          username: "maria_silva",
          avatar: "/placeholder.svg?height=32&width=32",
          isPremium: false,
        },
        content: "Que foto incrível! Adorei o local!",
        timestamp: "2h",
        likes: 3,
        isLiked: false,
      },
      {
        id: "2",
        author: {
          name: "João Santos",
          username: "joao_santos",
          avatar: "/placeholder.svg?height=32&width=32",
          isPremium: true,
        },
        content: "Perfeito! Onde foi tirada essa foto?",
        timestamp: "1h",
        likes: 1,
        isLiked: true,
      },
    ]
    setComments(postComments)
  }

  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator
        .share({
          title: "OpenLove Post",
          text: "Confira este post no OpenLove!",
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href)
          toast({
            title: "Link copiado!",
            description: "O link foi copiado para a área de transferência.",
            duration: 2000,
            className: "notification-success",
          })
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
        duration: 2000,
        className: "notification-success",
      })
    }
  }

  const toggleFollow = (username: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.author.username === username
          ? {
              ...post,
              author: {
                ...post.author,
                isFollowing: !post.author.isFollowing,
              },
            }
          : post,
      ),
    )

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.username === username
          ? {
              ...user,
              isFollowing: !user.isFollowing,
            }
          : user,
      ),
    )

    toast({
      title: "Seguindo!",
      description: `Agora você está seguindo @${username}`,
      duration: 2000,
      className: "notification-success",
    })
  }

  const handleJoinEvent = (eventId: string) => {
    if (!profile.isPremium) {
      toast({
        title: "Recurso Premium",
        description: "Apenas usuários Premium podem participar de eventos.",
        variant: "destructive",
        duration: 3000,
        className: "notification-error",
      })
      return
    }

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isJoined: !event.isJoined,
              participants: event.isJoined ? event.participants - 1 : event.participants + 1,
            }
          : event,
      ),
    )

    toast({
      title: "Evento confirmado!",
      description: "Você confirmou presença no evento.",
      duration: 2000,
      className: "notification-success",
    })
  }

  const handleCreatePost = () => {
    // Validações Premium
    if (!profile.isPremium) {
      if (newPost.video) {
        toast({
          title: "Recurso Premium",
          description: "Apenas usuários Premium podem postar vídeos!",
          variant: "destructive",
          duration: 3000,
          className: "notification-error",
        })
        return
      }
      if (newPost.isEvent) {
        toast({
          title: "Recurso Premium",
          description: "Apenas usuários Premium podem criar eventos!",
          variant: "destructive",
          duration: 3000,
          className: "notification-error",
        })
        return
      }
      if (newPost.images.length > 3) {
        toast({
          title: "Limite atingido",
          description: "Usuários gratuitos podem postar no máximo 3 fotos!",
          variant: "destructive",
          duration: 3000,
          className: "notification-error",
        })
        return
      }
    }

    const post = {
      id: Date.now().toString(),
      author: {
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        isPremium: profile.isPremium,
        isFollowing: false,
        location: profile.location,
        bio: profile.bio,
      },
      content: newPost.content,
      images: newPost.images.map((img) => URL.createObjectURL(img)),
      video: newPost.video ? URL.createObjectURL(newPost.video) : null,
      hashtags: newPost.content.match(/#\w+/g) || [],
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      isLiked: false,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isEvent: newPost.isEvent,
      visibility: newPost.visibility,
      eventDetails: newPost.isEvent ? newPost.eventDetails : undefined,
    }

    setPosts([post, ...posts])
    setNewPost({
      content: "",
      images: [],
      video: null,
      isEvent: false,
      visibility: "public",
      eventDetails: {
        date: "",
        time: "",
        location: "",
        maxParticipants: 10,
      },
    })
    setIsCreatePostOpen(false)

    toast({
      title: "Post criado!",
      description: "Seu post foi publicado com sucesso.",
      duration: 2000,
      className: "notification-success",
    })
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && activeChat) {
      const message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        senderId: profile.id,
        senderName: profile.name,
        senderAvatar: profile.avatar,
        type: "text" as const,
        isOwn: true,
        isRead: false,
      }
      setMessages([...messages, message])
      setNewMessage("")

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada.",
        duration: 1000,
        className: "notification-success",
      })
    }
  }

  const handleSendComment = () => {
    if (newComment.trim() && activeCommentsPost) {
      const comment = {
        id: Date.now().toString(),
        author: {
          name: profile.name,
          username: profile.username,
          avatar: profile.avatar,
          isPremium: profile.isPremium,
        },
        content: newComment.trim(),
        timestamp: "agora",
        likes: 0,
        isLiked: false,
      }
      setComments([...comments, comment])
      setNewComment("")

      // Atualizar contador de comentários do post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === activeCommentsPost
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  comments: post.stats.comments + 1,
                },
              }
            : post,
        ),
      )

      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado.",
        duration: 2000,
        className: "notification-success",
      })
    }
  }

  const handleViewProfile = (user: any) => {
    setSelectedUser(user)
    setActiveView("user-profile")
  }

  const filteredUsers = users.filter((user) => {
    const matchesQuery =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation =
      searchFilters.location === "Todas" || user.location.toLowerCase().includes(searchFilters.location.toLowerCase())
    const matchesAge =
      searchFilters.ageRange === "Todas" ||
      (searchFilters.ageRange === "18-25"
        ? user.age >= 18 && user.age <= 25
        : searchFilters.ageRange === "26-35"
          ? user.age >= 26 && user.age <= 35
          : searchFilters.ageRange === "36+"
            ? user.age >= 36
            : true)
    const matchesInterests =
      !searchFilters.interests ||
      user.interests.some((interest: string) => interest.toLowerCase().includes(searchFilters.interests.toLowerCase()))
    const matchesPremium = !searchFilters.isPremium || user.isPremium

    return matchesQuery && matchesLocation && matchesAge && matchesInterests && matchesPremium
  })

  return (
    <div className="min-h-screen timeline-bg flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Left Sidebar */}
      <TimelineSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        profile={profile}
        setIsChatOpen={setIsChatOpen}
        theme={theme}
        setTheme={setTheme}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      {activeView === "profile" ? (
        <ProfileView profile={profile} setProfile={setProfile} />
      ) : activeView === "user-profile" && selectedUser ? (
        <UserProfileView user={selectedUser} onBack={() => setActiveView("home")} />
      ) : (
        <TimelineMain
          activeView={activeView}
          posts={posts}
          users={filteredUsers}
          events={events}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          handleLike={handleLike}
          handleComment={handleComment}
          handleShare={handleShare}
          toggleFollow={toggleFollow}
          handleJoinEvent={handleJoinEvent}
          handleViewProfile={handleViewProfile}
          newPost={newPost}
          setNewPost={setNewPost}
          handleCreatePost={handleCreatePost}
          setIsCreatePostOpen={setIsCreatePostOpen}
          profile={profile}
        />
      )}

      {/* Right Sidebar */}
      <TimelineRightSidebar users={users} events={events} profile={profile} toggleFollow={toggleFollow} />

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={isCreatePostOpen}
        setIsOpen={setIsCreatePostOpen}
        newPost={newPost}
        setNewPost={setNewPost}
        handleCreatePost={handleCreatePost}
        profile={profile}
      />

      {/* Chat Dialog */}
      <ChatDialog
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        conversations={conversations}
        messages={messages}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />

      {/* Comments Dialog */}
      <CommentsDialog
        isOpen={isCommentsOpen}
        setIsOpen={setIsCommentsOpen}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        handleSendComment={handleSendComment}
        post={posts.find((p) => p.id === activeCommentsPost)}
      />
    </div>
  )
}
