"use client"

import {
  Calendar,
  Check as CheckIcon,
  Copy,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import type { ProfileUser } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { getInitials } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import Image from "next/image"

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
    <header className="relative">
      <motion.div
        {...reveal}
        transition={{ duration: 0.8, ease }}
        className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
      >
        {/* Subtle Background Accent */}
        <div className="absolute top-0 end-0 w-1/2 h-full bg-primary/[0.02] -skew-x-12 translate-x-1/4" />

        <div className="relative px-8 pb-14 pt-14 sm:px-16 sm:pb-20 sm:pt-24">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-14">
            {/* Avatar with Circular Editorial Frame */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative shrink-0"
            >
              <div className="h-48 w-48 sm:h-60 sm:w-60 rounded-full p-2 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 shadow-inner relative">
                <div className="h-full w-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-4 border-white shadow-2xl">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || t("profileImageAlt")}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-slate-800 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tighter">
                      {initials}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-2 end-6 h-14 w-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 text-center lg:text-start space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles className="h-3 w-3 me-2" />
                    {roleLabel}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("memberSince", { date: memberSince })}
                  </span>
                </div>

                <h1 className="font-serif text-[clamp(2.8rem,8vw,5rem)] font-bold tracking-tight text-slate-900 leading-[0.9] drop-shadow-sm">
                  {user.name || t("anonymousUser")}
                </h1>
              </div>

              {/* Action Suite */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 rounded-full h-14 px-10 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-sm"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4 me-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 me-3 text-slate-400" />
                  )}
                  {copied ? t("copied") : t("copyProfile")}
                </Button>

                {canEdit && (
                  <Link href="/dashboard/settings">
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 px-12 text-xs font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(var(--primary-rgb),0.25)] transition-all hover:-translate-y-1 active:translate-y-0">
                      <Settings className="h-4 w-4 me-3" />
                      {t("edit")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  )
}
