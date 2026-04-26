"use client"

import { Ban, Calendar, Fingerprint, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import { UserRoleBadge } from "@/components/UserRoleBadge"

interface UserInfoCardProps {
  user: {
    id: string
    name: string | null
    email: string
    role?: string
    universityMembershipRole?: string | null
    universityName?: string | null
    departmentName?: string | null
    banned?: boolean | null
    banReason?: string | null
    createdAt: string | Date
    image?: string | null
  }
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const t = useTranslations("dashboard.superAdmin.userDetail")

  const displayRole = user.universityMembershipRole ?? user.role
  const roleLabelKey =
    displayRole === "department_head" ? "dept_head" : (displayRole ?? "student")

  const affiliation = (() => {
    if (user.universityMembershipRole === "department_head") {
      if (user.departmentName && user.universityName) {
        return `${user.departmentName} @ ${user.universityName}`
      }
      return user.departmentName ?? user.universityName ?? null
    }
    if (user.role === "university_admin" && user.universityName) {
      return user.universityName
    }
    return null
  })()

  return (
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
      {/* Card header with avatar */}
      <div className="p-6 pb-0">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 bg-muted/30 border border-border/50 flex items-center justify-center text-lg font-serif text-muted-foreground shrink-0">
            {(user.name?.[0] ?? user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl text-heading truncate">
              {user.name || t("unnamed")}
            </h2>
            <div className="flex flex-col gap-1 mt-1.5">
              <div className="flex items-center gap-2">
                <UserRoleBadge
                  role={displayRole}
                  label={t(`roles.${roleLabelKey}`)}
                />
                {user.banned ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-rose-400/60 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                    {t("status.banned")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] border border-emerald-400/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    {t("status.active")}
                  </span>
                )}
              </div>
              {affiliation && (
                <span className="text-[11px] text-muted-foreground truncate max-w-[320px]">
                  {affiliation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="p-6 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetaItem icon={Mail} label="Email" value={user.email} />
          <MetaItem
            icon={Calendar}
            label="Created"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
          <MetaItem icon={Fingerprint} label="User ID" value={user.id} mono />
          {user.banned && user.banReason && (
            <MetaItem
              icon={Ban}
              label="Ban reason"
              value={user.banReason}
              destructive
            />
          )}
        </div>
      </div>
    </div>
  )
}

function MetaItem({
  icon: Icon,
  label,
  value,
  mono,
  destructive,
}: {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
  destructive?: boolean
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground inline-flex items-center gap-1">
        <Icon className={`h-3 w-3 ${destructive ? "text-destructive" : ""}`} />
        {label}
      </dt>
      <dd
        className={`text-sm truncate ${
          destructive
            ? "text-destructive"
            : mono
              ? "font-mono text-xs text-muted-foreground"
              : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
