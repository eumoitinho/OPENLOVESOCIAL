import { cn } from "@/lib/utils"
import { ArrowUpRight, MapPin, Users, Star, BadgeCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Card08Props {
  title?: string
  subtitle?: string
  image?: string
  badge?: {
    text: string
    variant: "pink" | "indigo" | "orange" | "green"
  }
  href?: string
  location?: string
  followers?: number
  rating?: number
  verified?: boolean
  premium?: boolean
  tags?: string[]
}

export default function Card08({
  title = "Perfil do Usuário",
  subtitle = "Descrição do perfil do usuário",
  image = "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
  badge = { text: "Novo", variant: "orange" },
  href = "#",
  location = "São Paulo, SP",
  followers = 0,
  rating = 4.5,
  verified = false,
  premium = false,
  tags = [],
}: Card08Props) {
  const getBadgeColor = (variant: string) => {
    switch (variant) {
      case "pink":
        return "bg-pink-500/90 text-white"
      case "indigo":
        return "bg-indigo-500/90 text-white"
      case "orange":
        return "bg-orange-500/90 text-white"
      case "green":
        return "bg-green-500/90 text-white"
      default:
        return "bg-white/90 text-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200"
    }
  }

  return (
    <Link href={href} className="block w-full max-w-[280px] group">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-white/80 dark:bg-zinc-900/80",
          "backdrop-blur-xl",
          "border border-zinc-200/50 dark:border-zinc-800/50",
          "shadow-xs",
          "transition-all duration-300",
          "hover:shadow-md",
          "hover:border-zinc-300/50 dark:hover:border-zinc-700/50",
        )}
      >
        <div className="relative h-[320px] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        <div className={cn("absolute inset-0", "bg-linear-to-t from-black/90 via-black/40 to-transparent")} />

        {/* Badge superior */}
        <div className="absolute top-3 right-3 flex gap-2">
          {verified && (
            <div className="p-1.5 rounded-full bg-blue-500/90 backdrop-blur-md shadow-xs">
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
          )}
          {premium && (
            <div className="p-1.5 rounded-full bg-yellow-500/90 backdrop-blur-md shadow-xs">
              <Star className="w-4 h-4 text-white" />
            </div>
          )}
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium",
              getBadgeColor(badge.variant),
              "backdrop-blur-md",
              "shadow-xs",
              "border border-white/20 dark:border-zinc-800/50",
            )}
          >
            {badge.text}
          </span>
        </div>

        {/* Tags */}
        {(tags || []).length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {(tags || []).slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white border border-white/30"
              >
                {tag}
              </span>
            ))}
            {(tags || []).length > 2 && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white border border-white/30">
                +{(tags || []).length - 2}
              </span>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="space-y-3">
            {/* Informações principais */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-semibold text-white dark:text-zinc-100 leading-snug line-clamp-1">
                  {title}
                </h3>
                <p className="text-sm text-zinc-200 dark:text-zinc-300 line-clamp-2">{subtitle}</p>
              </div>
              <div
                className={cn(
                  "p-2 rounded-full",
                  "bg-white/10 dark:bg-zinc-800/50",
                  "backdrop-blur-md",
                  "group-hover:bg-white/20 dark:group-hover:bg-zinc-700/50",
                  "transition-colors duration-300 group",
                  "flex-shrink-0",
                )}
              >
                <ArrowUpRight className="w-4 h-4 text-white group-hover:-rotate-12 transition-transform duration-300" />
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="flex items-center justify-between text-xs text-zinc-200 dark:text-zinc-300">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-20">{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{followers}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 