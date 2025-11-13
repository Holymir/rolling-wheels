import type { UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

const roleStyles: Record<UserRole, string> = {
  admin: "bg-primary text-primary-foreground",
  member: "bg-secondary text-secondary-foreground",
  prospect: "bg-muted text-muted-foreground",
  hangaround: "bg-card text-card-foreground border border-border",
  guest: "bg-background text-foreground border border-border",
}

const roleLabels: Record<UserRole, string> = {
  admin: "ADMIN",
  member: "MEMBER",
  prospect: "PROSPECT",
  hangaround: "HANGAROUND",
  guest: "GUEST",
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase",
        roleStyles[role],
        className,
      )}
    >
      {roleLabels[role]}
    </span>
  )
}
