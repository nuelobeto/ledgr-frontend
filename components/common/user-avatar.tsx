import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserLike {
  firstName?: string | null
  lastName?: string | null
  email: string
  avatarUrl?: string | null
}

export function getInitials(user: UserLike): string {
  const first = user.firstName?.trim()?.[0]
  const last = user.lastName?.trim()?.[0]

  if (first && last) return `${first}${last}`.toUpperCase()
  if (first) return first.toUpperCase()

  return user.email.slice(0, 2).toUpperCase()
}

interface UserAvatarProps {
  user: UserLike
  size?: "default" | "sm" | "lg"
  className?: string
}

export function UserAvatar({ user, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={cn(className)}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.email} />}
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  )
}
