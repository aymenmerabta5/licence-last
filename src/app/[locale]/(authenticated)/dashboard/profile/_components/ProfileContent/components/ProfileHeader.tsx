"use client"

import { Calendar, Check as CheckIcon, Copy } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import type { ProfileUser } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { getInitials } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface ProfileHeaderProps {
  user: ProfileUser
  canEdit: boolean
  profileText: string
  roleLabel: string
}

export function ProfileHeader({
  user,
  canEdit,
  profileText,
  roleLabel,
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
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        {/* Kicker row */}
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.05)}
          className="flex items-center justify-between"
        >
          <Badge variant="editorial-muted">{t("kicker")}</Badge>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground hidden sm:block">
            {t("memberSince", { date: memberSince })}
          </span>
        </motion.div>

        {/* Main layout: Avatar + Name */}
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col sm:flex-row sm:items-end gap-6"
        >
          {/* Portrait — square editorial */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-primary/20 bg-primary flex items-center justify-center text-white text-3xl sm:text-4xl font-serif overflow-hidden">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || t("profileImageAlt")}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>

          {/* Name + meta */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.05] tracking-tight text-heading">
                {user.name || t("anonymousUser")}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="editorial">{roleLabel}</Badge>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium sm:hidden">
                  <Calendar className="h-3 w-3" />
                  {t("since", { date: memberSince })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="editorial-outline"
                size="editorial-sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckIcon className="h-3.5 w-3.5 me-1.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 me-1.5" />
                )}
                {copied ? t("copied") : t("copyProfile")}
              </Button>

              {canEdit && (
                <Link href="/dashboard/settings">
                  <Button variant="editorial" size="editorial-sm">
                    {t("edit")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
