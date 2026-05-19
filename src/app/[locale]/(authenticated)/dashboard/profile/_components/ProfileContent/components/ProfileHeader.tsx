"use client"

import {
  Calendar,
  Check as CheckIcon,
  Copy,
  GraduationCap,
  MapPin,
  Settings,
  Sparkles,
} from "lucide-react"
import * as motion from "motion/react-client"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import type { ProfileUser } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { getInitials } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface ProfileHeaderProps {
  user: ProfileUser
  canEdit: boolean
  profileText: string
  roleLabel: string
  university?: { name: string; city: string | null } | null
  department?: string | null
  level?: string | null
}

export function ProfileHeader({
  user,
  canEdit,
  profileText,
  roleLabel,
  university,
  department,
  level,
}: ProfileHeaderProps) {
  const t = useTranslations("dashboard.student.profile")
  const locale = useLocale()
  const initials = getInitials(user.name)
  const memberSince = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt))
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileText)
      setCopied(true)
      toast.success(t("copySuccess"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("copyError"))
    }
  }

  return (
    <header>
      <motion.div
        {...reveal}
        transition={{ duration: 0.7, ease }}
        className="border border-border/50 bg-card"
      >
        {/* Top accent line */}
        <div className="h-0.5 bg-primary" />

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border border-border/50 bg-muted flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || t("profileImageAlt")}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="font-serif text-3xl text-heading">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                >
                  <Sparkles className="h-3 w-3 me-1.5 text-primary" />
                  {roleLabel}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("memberSince", { date: memberSince })}
                </span>
              </div>

              <h1 className="font-serif text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.1] tracking-tight text-heading">
                {user.name || t("anonymousUser")}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                {university && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    <GraduationCap className="h-3.5 w-3.5 me-1.5 text-primary/60" />
                    {university.name}
                  </Badge>
                )}
                {department && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {department}
                    {level && ` — ${level}`}
                  </Badge>
                )}
                {university?.city && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    <MapPin className="h-3.5 w-3.5 me-1.5 text-primary/60" />
                    {university.city}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="rounded-md text-xs font-bold uppercase tracking-[0.15em]"
            >
              {copied ? (
                <CheckIcon className="h-3.5 w-3.5 me-2 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 me-2 text-muted-foreground" />
              )}
              {copied ? t("copied") : t("copyProfile")}
            </Button>

            {canEdit && (
              <Link href="/dashboard/settings">
                <Button
                  size="sm"
                  className="rounded-md text-xs font-bold uppercase tracking-[0.15em]"
                >
                  <Settings className="h-3.5 w-3.5 me-2" />
                  {t("edit")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  )
}
