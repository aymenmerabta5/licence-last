import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ROLE_BADGE_STYLES: Record<string, string> = {
  student:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
  company_admin:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
  university_admin:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
  dept_head:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300",
  super_admin:
    "border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/20",
}

interface UserRoleBadgeProps {
  role?: string | null
  label: string
  className?: string
}

export function UserRoleBadge({
  role,
  label,
  className,
}: UserRoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
        ROLE_BADGE_STYLES[role ?? ""] ??
          "border-border/80 bg-muted/40 text-foreground/80",
        className,
      )}
    >
      {label}
    </Badge>
  )
}
