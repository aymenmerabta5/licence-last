"use client"

import { useTranslations } from "next-intl"
import { Mail, Calendar, Shield, Ban } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface UserInfoCardProps {
  user: {
    id: string
    name: string | null
    email: string
    role?: string
    banned?: boolean | null
    banReason?: string | null
    createdAt: string | Date
    image?: string | null
  }
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  super_admin: "destructive",
  admin: "default",
  company_admin: "secondary",
  student: "outline",
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const t = useTranslations("dashboard.superAdmin.userDetail")

  return (
    <div className="border border-border/60 bg-white dark:bg-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-serif text-muted-foreground shrink-0">
          {(user.name?.[0] ?? user.email[0]).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl text-heading truncate">
            {user.name || t("unnamed")}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={roleBadgeVariant[user.role ?? ""] ?? "outline"} className="text-[10px]">
              {t(`roles.${user.role ?? "student"}`)}
            </Badge>
            {user.banned ? (
              <Badge variant="destructive" className="text-[10px]">
                {t("status.banned")}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                {t("status.active")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4 shrink-0" />
          <span>{user.id}</span>
        </div>
        {user.banned && user.banReason && (
          <div className="flex items-center gap-2 text-destructive">
            <Ban className="h-4 w-4 shrink-0" />
            <span>{user.banReason}</span>
          </div>
        )}
      </div>
    </div>
  )
}
