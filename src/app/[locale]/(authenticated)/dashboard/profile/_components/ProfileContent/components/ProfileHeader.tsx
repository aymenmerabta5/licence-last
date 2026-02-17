"use client"

import * as motion from "motion/react-client"
import { Calendar, Copy, Check as CheckIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

import type { ProfileUser } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { getInitials } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/utils"

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
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="relative"
    >
      {/* Editorial masthead */}
      <div className="h-0.5 bg-primary" />
      <div className="border border-t-0 border-border/50 relative overflow-hidden">
        {/* Dark mode glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 start-16 w-32 h-32 bg-primary/3 blur-[80px] rounded-full" />
        </div>

        {/* Light mode texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-0" />

        <div className="relative p-8 md:p-10">
          {/* Kicker row */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              {t("kicker")}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hidden sm:block [[dir=rtl]_&]:tracking-normal">
              {t("memberSince", { date: memberSince })}
            </span>
          </div>

          {/* Main layout: Avatar + Name + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-7">
            {/* Portrait */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease }}
              className="relative shrink-0"
            >
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-primary/20 bg-primary flex items-center justify-center text-white text-4xl sm:text-5xl font-serif shadow-xl shadow-primary/10">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || t("profileImageAlt")}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              {/* Status dot */}
              <div className="absolute bottom-1 end-1 h-4 w-4 rounded-full bg-emerald-500 border-[3px] border-background" />
            </motion.div>

            {/* Name + meta */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease }}
              >
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight text-heading">
                  {user.name || t("anonymousUser")}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                    {roleLabel}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium sm:hidden">
                    <Calendar className="h-3 w-3" />
                    {t("since", { date: memberSince })}
                  </span>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4, ease }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="sm"
                  className="h-9 px-4 border-border/40 hover:border-primary transition-colors"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckIcon className="h-3.5 w-3.5 me-2 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 me-2" />
                  )}
                  {copied ? t("copied") : t("copyProfile")}
                </Button>

                {canEdit && (
                  <Link href="/dashboard/settings">
                    <Button
                      variant="editorial"
                      size="sm"
                      className="h-9 px-5"
                    >
                      {t("edit")}
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
