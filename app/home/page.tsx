"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Moon,
  Sun,
  Users,
  Calendar,
  Search,
  Plus,
  Home,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  TrendingUp,
  Star,
  Globe,
  MapPin,
  ImageIcon,
  Video,
  MessageCircle,
  Lock,
  UserPlus,
  BadgeCheck,
  Wallet,
  Store,
  ShoppingBag,
  Clapperboard,
  Flag,
  HelpCircle,
  ArrowLeft,
  Filter,
  X,
  Check,
  AlertCircle,
  Shield,
  BarChart3,
  FileText,
  Camera,
  Mic,
  Smile,
  Send,
  MoreHorizontal,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

import PostCard from "@/app/components/timeline/PostCard";

import { SavedContent } from "@/app/components/timeline/SavedContent";
import ProfileSearch from "@/app/components/timeline/ProfileSearch";
import { Separator } from "@/components/ui/separator";
import { MobileNav } from "@/app/components/timeline/layout/MobileNav";
import { TimelineRightSidebar } from "@/app/components/timeline/TimelineRightSidebar";
import Advertisement from "@/app/components/ads/Advertisement";

import { TimelineSidebar } from "@/app/components/timeline/TimelineSidebar";
import { NotificationsContent } from "@/app/components/timeline/NotificationsContent";
import { MessagesContent } from "@/app/components/timeline/MessagesContent";
import { EventsContent } from "@/app/components/timeline/EventsContent";
import { CommunitiesContent } from "@/app/components/timeline/CommunitiesContent";
import { useRecommendationAlgorithm } from "@/app/hooks/useRecommendationAlgorithm";
import RecommendedPostCard from "@/app/components/timeline/RecommendedPostCard";
import { OpenDatesStack } from "@/app/components/timeline/OpenDatesStack";
import UserProfile from "@/app/components/profile/UserProfile";

import { useRouter } from "next/navigation";

import CreatePost from "../components/timeline/CreatePost";

// Novos imports dos componentes avançados
// Componentes serão implementados conforme necessário

// Novos hooks
import { useNotifications } from "@/app/hooks/useNotifications";
import { useConversations } from "@/app/hooks/useConversations";
import { usePostToast } from "@/app/hooks/usePostToast";
import { useAppState } from "@/app/hooks/useAppState";
import { useIsMobile } from "@/hooks/use-mobile"

// --- Tipos e Dados para a Sidebar ---
type NavigationItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  count?: number;
  action?: () => void;
};

const NavLink = ({
  item,
  isActive,
  onClick,
}: {
  item: NavigationItem;
  isActive: boolean;
  onClick: (item: NavigationItem) => void;
}) => (
  <li>
    <a
      href={item.href || "#"}
      onClick={(e) => {
        e.preventDefault();
        onClick(item);
      }}
      className={cn(
        "flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out group",
        isActive
          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105"
          : "text-gray-600 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <item.icon
        className={cn(
          "w-5 h-5 mr-4 transition-transform duration-300 group-hover:scale-110",
          isActive && "text-white"
        )}
      />
      <span className="font-medium">{item.label}</span>
      {item.count && (
        <span
          className={cn(
            "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
            isActive
              ? "bg-white/20 text-white"
              : "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300"
          )}
        >
          {item.count}
        </span>
      )}
    </a>
  </li>
);

const NavHeader = ({ title }: { title: string }) => (
  <li className="px-3 py-2 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
    {title}
  </li>
);

// --- Componente ProfileView para a Home ---
const ProfileView = ({ username }: { username?: string }) => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Usuário não encontrado</p>
      </div>
    );
  }

  const profileUsername = username || profile?.username || user.email?.split('@')[0] || 'user';
  
  return <UserProfile username={profileUsername} isView={true} />;
};

export default function HomePage() {
  const { user, profile, loading: authLoading, session } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const {
    recommendations,
    loading: loadingRecommendations,
    error: errorRecommendations,
  } = useRecommendationAlgorithm();

  // Novos hooks avançados
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { conversations, sendMessage, markAsRead: markMessageAsRead } = useConversations();
  const { showToast, hideToast } = usePostToast();
  const { 
    theme, 
    setTheme, 
    notifications: appNotifications, 
    setNotifications: setAppNotifications,
    searchFilters,
    setSearchFilters,
    userSettings,
    updateUserSettings
  } = useAppState();

  console.log("HomePage: Auth Loading:", authLoading);
  console.log("HomePage: User:", user ? user.id : "Não logado");
  console.log("HomePage: User Email:", user?.email);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<
    "public" | "friends_only"
  >("public");
  const [postLoading, setPostLoading] = useState(false);
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postVideo, setPostVideo] = useState<File | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("home");
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);

  // Novos estados para funcionalidades avançadas
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Atualiza timeline
  const fetchPosts = async () => {
    console.log("HomePage: Iniciando fetchPosts...");
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      console.log("HomePage: Fazendo requisição para /api/timeline");
      const res = await fetch("/api/timeline", {
        headers: {
          // Cookie-based auth, não precisa enviar Authorization
        },
      });
      console.log("HomePage: Status da resposta:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.log("HomePage: Erro na resposta:", errorData);
        if (errorData.error === "Session expired" || res.status === 401) {
          await useAuth().signOut();
          router.push("/?session=expired");
          return;
        }
        throw new Error(errorData.error || "Erro ao buscar timeline");
      }
      const json = await res.json();
      console.log(
        "HomePage: Timeline carregada com sucesso, posts:",
        json.data?.length || 0
      );
      setPosts(json.data || []);
    } catch (err: any) {
      console.error("HomePage: Erro ao buscar posts:", err);
      setErrorPosts(err.message || "Erro desconhecido");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // Se o contexto já garante usuário autenticado, não é necessário redirecionar aqui
    if (user && !user.email_confirmed_at) {
      router.push("/auth/signin?email=unconfirmed");
      return;
    }

    if (user) {
      fetchPosts();
    }
  }, [authLoading, user, router, session]);

  // Ad tracking
  const handleAdClick = (adId: string) => {
    console.log("Ad clicked:", adId);
  };

  const handleAdImpression = (adId: string) => {
    console.log("Ad impression:", adId);
  };

  // Current user data - definido após profile estar disponível
  const currentUser = useMemo(
    () => ({
      name: user?.user_metadata?.full_name || "Você",
      username: user?.user_metadata?.username || "@voce",
      avatar:
        // Corrigido: user?.avatar_url não existe, buscar em user_metadata ou usar padrão
        user?.user_metadata?.avatar_url ||
        "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
      plano: user?.user_metadata?.plano || "free",
      id: user?.id,
    }),
    [user, profile]
  );

  // Check system preference on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleSave = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              saved: !post.saved,
            }
          : post
      )
    );
  };

  const handleFollow = (postId: number, isPrivate: boolean) => {
    // Lógica de seguir (mantida, mas não depende de followStates)
  };

  const handleComment = (postId: number) => {
    console.log("Abrir comentários do post:", postId);
  };

  const handleShare = (postId: number) => {
    console.log("Compartilhar post:", postId);
  };

  const handleViewMedia = (postId: number, mediaIndex: number) => {
    console.log("Visualizar mídia do post:", postId, "índice:", mediaIndex);
  };

  const navigateToSettings = () => {
    window.location.href = "/settings";
  };

  const navigateToProfiles = () => {
    window.location.href = "/profiles";
  };

  const navigateToProfile = (username: string) => {
    setViewingProfile(username);
    setActiveView("profile");
  };

  // Novas funções para funcionalidades avançadas
  const handleFilterChange = (filters: any) => {
    setSearchFilters(filters);
    console.log("Filtros aplicados:", filters);
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    console.log("Notificação clicada:", notificationId);
  };

  const handleChatMessage = (conversationId: string, message: string) => {
    sendMessage(conversationId, message);
    console.log("Mensagem enviada para:", conversationId);
  };

  const handlePostReport = (postId: string, reason: string) => {
    console.log("Post reportado:", postId, "Motivo:", reason);
    setShowReportModal(false);
  };

  const handleSettingsUpdate = (settings: any) => {
    updateUserSettings(settings);
    console.log("Configurações atualizadas:", settings);
  };

  const handleProfileUpdate = (profileData: any) => {
    console.log("Perfil atualizado:", profileData);
    setShowProfileEditor(false);
  };

  const handleAnalyticsView = () => {
    setShowAnalytics(true);
  };

  const handleModerationAction = (action: string, targetId: string) => {
    console.log("Ação de moderação:", action, "Target:", targetId);
  };

  const ProfileCard = ({ profile }: { profile: any }) => (
    <Card
      className="relative w-full max-w-[280px] overflow-hidden shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={navigateToProfiles}
    >
      <div className="relative h-16 sm:h-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      <CardContent className="relative px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="flex justify-center -mt-4 sm:-mt-6 mb-2 sm:mb-3">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-white shadow-lg">
            <AvatarImage
              src={profile.profileImage || "/placeholder.svg"}
              alt={profile.name}
            />
            <AvatarFallback className="text-xs sm:text-sm font-semibold">
              {profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
              {profile.name}
            </h3>
            {profile.verified && (
              <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 fill-blue-500 text-white flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium truncate">
            {profile.username}
          </p>
          {profile.tags && (
            <div className="flex flex-wrap justify-center gap-1 mt-1 sm:mt-1.5">
              {profile.tags.slice(0, 1).map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-1 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
              {(profile.tags || []).length > 1 && (
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  +{(profile.tags || []).length - 1}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-1 sm:mt-1.5">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-16 sm:max-w-20">
                  {profile.location}
                </span>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed mb-2 sm:mb-3 line-clamp-2">
          {profile.description}
        </p>
        <Separator className="my-2 sm:my-3" />
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {profile.rating}
            </div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              {profile.followers}
            </div>
            <div className="text-xs text-muted-foreground">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              {profile.following}
            </div>
            <div className="text-xs text-muted-foreground">Seguindo</div>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleFollow(profile.id, false);
            }}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            <span className="text-xs">Seguir</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSave(profile.id);
            }}
          >
            <Bookmark className="w-3 h-3 mr-1" />
            <span className="text-xs">Salvar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Usuário não autenticado: não renderiza nada, pois o middleware e AuthProvider já protegem
    return null;
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDarkMode
          ? "dark bg-gray-900 text-gray-50"
          : "bg-gray-50 text-gray-900"
      )}
    >
      {/* Custom CSS */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode
            ? "rgba(219, 39, 119, 0.3)"
            : "rgba(190, 24, 93, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        ::-webkit-scrollbar {
          display: none;
        }
        body,
        .sidebar-box {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Layout Grid Principal - Similar ao Twitter/X */}
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] max-w-7xl mx-auto min-h-screen">
        {/* Sidebar Esquerda - APENAS DESKTOP */}
        <aside className="hidden 2xl:block w-[275px] sticky top-0 h-screen overflow-y-auto scrollbar-hide">
          <TimelineSidebar
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            activeView={activeView}
            setActiveView={setActiveView}
            onNavigateToSettings={navigateToSettings}
            onNavigateToProfiles={navigateToProfiles}
            onCreatePost={() => setPostModalOpen(true)}
            onShowFilters={() => setShowFilters(!showFilters)}
            onShowChat={() => setShowChat(true)}
            onShowAnalytics={() => setShowAnalytics(true)}
            onShowModeration={() => setShowModerationPanel(true)}
            onShowProfileEditor={() => setShowProfileEditor(true)}
          />
        </aside>

        {/* Timeline Principal */}
        <main className="w-full border-x border-gray-200 dark:border-gray-800 2xl:pl-0">
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="p-4">
              {activeView === "profile" && viewingProfile && (
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveView("home");
                      setViewingProfile(null);
                    }}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {activeView === "home" && "Início"}
                {activeView === "explore" && "Explorar"}
                {activeView === "notifications" && "Notificações"}
                {activeView === "messages" && "Mensagens"}
                {activeView === "events" && "Eventos"}
                {activeView === "communities" && "Comunidades"}
                {activeView === "open-dates" && "Open Dates"}
                {activeView === "saved" && "Salvos"}
                {activeView === "settings" && "Configurações"}
                {activeView === "my-profile" && "Meu Perfil"}
                {activeView === "profile" && viewingProfile && `@${viewingProfile}`}
              </h1>
            </div>
          </div>

          <div className="p-4">
            {/* Componentes avançados integrados - Agora apenas os modais */}
            {/* Filtros expandidos */}
            {showFilters && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Filtros Avançados</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="single">Solteiros</SelectItem>
                        <SelectItem value="couple">Casais</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Idade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="26-35">26-35</SelectItem>
                        <SelectItem value="36-45">36-45</SelectItem>
                        <SelectItem value="46+">46+</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Localização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nearby">Próximo</SelectItem>
                        <SelectItem value="city">Cidade</SelectItem>
                        <SelectItem value="state">Estado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setShowFilters(false)}>
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Busca avançada */}
            {showSearch && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Busca Avançada</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Buscar usuários, posts, eventos..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <Button onClick={() => setShowSearch(false)}>
                      Buscar
                    </Button>
                    <Button variant="outline" onClick={() => setShowSearch(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeView === "home" && (
              <Tabs defaultValue="seguindo" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 mb-6">
                  <TabsTrigger
                    value="seguindo"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
                  >
                    Seguindo
                  </TabsTrigger>
                  <TabsTrigger
                    value="para-voce"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
                  >
                    Para Você
                  </TabsTrigger>
                  <TabsTrigger
                    value="explorar"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
                  >
                    Explorar
                  </TabsTrigger>
                </TabsList>
                <CreatePost
                  onPostCreated={fetchPosts}
                  currentUser={currentUser}
                  profile={profile}
                  loading={authLoading}
                />

                <TabsContent value="seguindo" className="space-y-6">
                  {loadingPosts ? (
                    <div className="text-center py-8">
                      <p>Carregando posts de amigos...</p>
                    </div>
                  ) : errorPosts ? (
                    <div className="text-center py-8 text-red-500">
                      Erro ao carregar posts: {errorPosts}
                    </div>
                  ) : (posts || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p>
                        Nenhum post de amigos encontrado. Comece a seguir
                        pessoas para ver seus posts!
                      </p>
                    </div>
                  ) : (
                    posts.map((post, index) => (
                      <div key={post.id}>
                        <PostCard
                          post={post}
                          onLike={handleLike}
                          onSave={handleSave}
                          onFollow={handleFollow}
                          onComment={handleComment}
                          onShare={handleShare}
                          onViewMedia={handleViewMedia}
                          onViewProfile={navigateToProfile}
                          currentUser={currentUser}
                        />
                        {(index + 1) % 3 === 0 && (
                          <div className="my-6">
                            <Advertisement
                              type="timeline"
                              onAdClick={handleAdClick}
                              onAdImpression={handleAdImpression}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="para-voce" className="space-y-6">
                  {loadingRecommendations ? (
                    <div className="text-center py-8">
                      <p>Analisando suas preferências...</p>
                    </div>
                  ) : errorRecommendations ? (
                    <div className="text-center py-8 text-red-500">
                      Erro ao carregar recomendações: {errorRecommendations}
                    </div>
                  ) : (
                    <>
                      {/* Header da seção Para Você */}
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Para Você
                          </h2>
                        </div>
                      </div>

                      {/* Timeline de Posts Recomendados */}
                      <div className="space-y-6">
                        {recommendations.map((post) => (
                          <div key={post.id} className="relative">
                            <RecommendedPostCard
                              post={post}
                              onLike={handleLike}
                              onSave={handleSave}
                              onFollow={handleFollow}
                              onComment={handleComment}
                              onShare={handleShare}
                              onViewMedia={handleViewMedia}
                              onViewProfile={navigateToProfile}
                              currentUser={currentUser}
                            />

                            {/* Badge de Recomendação */}
                            <div className="absolute top-4 right-4 z-10">
                              <Badge
                                variant={
                                  post.engagement === "high"
                                    ? "default"
                                    : "secondary"
                                }
                                className={cn(
                                  "text-xs",
                                  post.engagement === "high" &&
                                    "bg-gradient-to-r from-pink-500 to-purple-500 text-white",
                                  post.engagement === "medium" &&
                                    "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                                )}
                              >
                                {post.engagement === "high" ? (
                                  <>
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Alta Recomendação
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-3 h-3 mr-1" />
                                    Recomendado
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="explorar" className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Explorar Perfis
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Encontre pessoas baseado em suas preferências
                      </p>
                    </div>
                    <Card className="p-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Buscar por nome, tags, localização..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casal">Casal</SelectItem>
                            <SelectItem value="solteiro">Solteiro</SelectItem>
                            <SelectItem value="todos">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Distância" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5km">Até 5km</SelectItem>
                            <SelectItem value="10km">Até 10km</SelectItem>
                            <SelectItem value="20km">Até 20km</SelectItem>
                            <SelectItem value="50km">Até 50km</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Interesses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fotografia">
                              Fotografia
                            </SelectItem>
                            <SelectItem value="musica">Música</SelectItem>
                            <SelectItem value="gastronomia">
                              Gastronomia
                            </SelectItem>
                            <SelectItem value="esportes">Esportes</SelectItem>
                            <SelectItem value="arte">Arte</SelectItem>
                            <SelectItem value="viagens">Viagens</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="bg-pink-600 hover:bg-pink-700">
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </Button>
                      </div>
                    </Card>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {user?.user_metadata?.profiles?.map((profile: any) => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            {activeView === "explore" && (
              <ProfileSearch onProfileClick={() => {}} />
            )}
            {activeView === "notifications" && <NotificationsContent />}
            {activeView === "messages" && <MessagesContent />}
            {activeView === "events" && <EventsContent />}
            {activeView === "communities" && <CommunitiesContent />}
            {activeView === "open-dates" && <OpenDatesStack />}
            {activeView === "saved" && (
              <SavedContent
                savedPosts={posts
                  .filter((p) => p.saved)
                  .map((p) => ({
                    id: p.id.toString(),
                    user: p.user,
                    content: p.content,
                    images: p.images || undefined,
                    video: p.video || undefined,
                    event: p.event || undefined,
                    likes: p.likes,
                    comments: p.comments,
                    shares: p.shares,
                    timestamp: p.timestamp,
                    savedAt: p.timestamp,
                    category: p.event
                      ? "events"
                      : p.images || p.video
                      ? "media"
                      : "posts",
                  }))}
                onRemoveFromSaved={(postId) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id.toString() === postId ? { ...p, saved: false } : p
                    )
                  );
                }}
                onLike={(postId) => handleLike(parseInt(postId))}
                onComment={(postId) => handleComment(parseInt(postId))}
                onShare={(postId) => handleShare(parseInt(postId))}
                onViewMedia={(postId, mediaIndex) =>
                  handleViewMedia(parseInt(postId), mediaIndex)
                }
              />
            )}
            {activeView === "my-profile" && <ProfileView />}
            {activeView === "profile" && viewingProfile && <ProfileView username={viewingProfile} />}
            {activeView === "settings" && (
              <div className="p-4 bg-blue-100 rounded">
                <h2 className="text-2xl font-bold mb-4">Configurações</h2>
                <p>Redirecionando para a página de configurações...</p>
                <Button onClick={() => (window.location.href = "/settings")}>
                  Ir para Configurações
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar Direita */}
        <aside className="hidden 2xl:block w-[350px] sticky top-0 h-screen overflow-y-auto scrollbar-hide">
          <TimelineRightSidebar
            userLocation="São Paulo, SP"
            onFollowUser={(userId: string) => {
              console.log("Seguindo usuário:", userId);
            }}
            onUnfollowUser={(userId: string) => {
              console.log("Deixando de seguir usuário:", userId);
            }}
            onViewEvent={(eventId: string) => {
              console.log("Visualizando evento:", eventId);
              window.location.href = `/events?id=${eventId}`;
            }}
            onSearch={(query: string) => {
              console.log("Buscando:", query);
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }}
          />
        </aside>
      </div>

      {/* Mobile Navigation - APENAS DESKTOP */}
      {isMobile && (
        <MobileNav
          onProfileClick={() => setActiveView("profile")}
          onSettingsClick={() => setActiveView("settings")}
          onMessagesClick={() => setActiveView("messages")}
          onNotificationsClick={() => setActiveView("notifications")}
          onEventsClick={() => setActiveView("events")}
          onCommunitiesClick={() => setActiveView("communities")}
          onSavedContentClick={() => setActiveView("saved")}
          onProfileSearchClick={() => setActiveView("explore")}
          onCreatePostClick={() => setPostModalOpen(true)}
          onNavigateToSettings={navigateToSettings}
          onNavigateToProfiles={navigateToProfiles}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}

      {/* Modais e componentes flutuantes avançados */}
      
      {/* Notificações Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Notificações</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma notificação
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500">Nova notificação</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Mensagens</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MessagesContent />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualizações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">1,234</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Seguidores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">567</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">89</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sistema de Reports */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Reportar Post</h3>
            <div className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Motivo do report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Conteúdo inadequado</SelectItem>
                  <SelectItem value="harassment">Assédio</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <textarea
                placeholder="Descrição adicional..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowReportModal(false)}>
                  Enviar Report
                </Button>
                <Button variant="outline" onClick={() => setShowReportModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Moderação */}
      {showModerationPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Painel de Moderação</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModerationPanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Painel de Moderação</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reports Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500">
                        Nenhum report pendente
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-500">
                        Nenhuma ação recente
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configurações do Usuário */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Configurações</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Configurações</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notificações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Notificações push</span>
                        <Button variant="outline" size="sm">Ativado</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email</span>
                        <Button variant="outline" size="sm">Desativado</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacidade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Perfil público</span>
                        <Button variant="outline" size="sm">Ativado</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mostrar localização</span>
                        <Button variant="outline" size="sm">Desativado</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor de Perfil */}
      {showProfileEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Editar Perfil</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileEditor(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Editar Perfil</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome</label>
                        <input
                          type="text"
                          defaultValue={profile?.full_name || ""}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <textarea
                          defaultValue={profile?.bio || ""}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex gap-2">
                    <Button>Salvar Alterações</Button>
                    <Button variant="outline">Cancelar</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast para novos posts */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Toast notifications aparecerão aqui */}
      </div>

      {/* Navegação Mobile Melhorada */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 xl:hidden">
        <div className="flex justify-around py-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveView("home")}>
            <Home className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)} className="relative">
            <div className="relative">
              <Bell className="w-5 h-5" />
              {/* Badge de notificações mobile */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </div>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowChat(true)} className="relative">
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {/* Badge de mensagens mobile */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">2</span>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
