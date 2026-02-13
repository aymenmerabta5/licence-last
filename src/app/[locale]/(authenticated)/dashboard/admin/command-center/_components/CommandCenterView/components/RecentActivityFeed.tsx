"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Clock, UserPlus } from "lucide-react"

import { reveal, ease } from "@/lib/animations"
import { Badge } from "@/components/ui/badge"

interface RecentUser {
  id: string
  name: string | null
  email: string
  role?: string
  createdAt: string | Date
}

interface RecentActivityFeedProps {
  recentUsers: RecentUser[]
  isLoading: boolean
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  super_admin: "destructive",
  admin: "default",
  company_admin: "secondary",
  student: "outline",
}

export function RecentActivityFeed({ recentUsers, isLoading }: RecentActivityFeedProps) {
  const t = useTranslations("dashboard.superAdmin.commandCenter")

  if (isLoading) return null

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground/60" />
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {t("recentActivity")}
        </h2>
      </div>

      <div className="border border-border/60 bg-white dark:bg-card divide-y divide-border/40">
        {recentUsers.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t("noRecentActivity")}
          </div>
        )}
        {recentUsers.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
            <UserPlus className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-heading truncate">
                {u.name || u.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
            <Badge variant={roleBadgeVariant[u.role ?? ""] ?? "outline"} className="shrink-0 text-[10px]">
              {u.role ?? "—"}
            </Badge>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {new Date(u.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
