import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarData {
  src: string
  fallback: string
  name: string
}

interface AvatarGroupProps {
  avatars: AvatarData[]
  count?: number
  label?: string
  className?: string
}

export default function AvatarGroup({
  avatars,
  count = 10000,
  label = "desenvolvedores",
  className = "",
}: AvatarGroupProps) {
  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K+"
    }
    return num.toString()
  }

  return (
    <div
      className={`bg-background flex flex-wrap items-center justify-center rounded-full border p-1 shadow-sm ${className}`}
    >
      <div className="flex -space-x-1">
        {avatars.map((avatar, index) => (
          <Avatar key={index} className="ring-background size-6 ring-2">
            <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.name} />
            <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="text-muted-foreground px-2 text-xs">
        Amado por <strong className="text-foreground font-medium">{formatCount(count)}</strong> {label}.
      </p>
    </div>
  )
}
