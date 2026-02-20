"use client"

import { useReducedMotion } from "motion/react"
import * as motion from "motion/react-client"
import { Route } from "next"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { getTransition } from "@/lib/animations"

interface WelcomeHeroProps {
  userName: string | null
  profileCompleteness: number
  profileUserId: string
}

export function WelcomeHero({
  userName,
  profileCompleteness,
  profileUserId,
}: WelcomeHeroProps) {
  const t = useTranslations("dashboard.student.welcomeHero")
  const locale = useLocale()
  const prefersReducedMotion = useReducedMotion() ?? false
  const firstName = userName?.split(" ")[0]
  const displayName = firstName ?? t("defaultName")
  const now = new Date()
  const dateStr = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(now)

  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, filter: "blur(10px)", y: 20 }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 1, filter: "blur(0px)", y: 0 }
      }
      transition={getTransition(
        { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        prefersReducedMotion,
      )}
      className="relative w-full"
    >
      <div className="relative border-y-4 border-foreground dark:border-foreground/80 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-4 group">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Date Area - Newspaper Date Column */}
        <div className="md:col-span-2 flex flex-col justify-start items-start md:border-r border-border md:pr-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/50 mb-4 [[dir=rtl]_&]:tracking-normal">
            Vol. 1
          </div>
          <motion.div
            className="font-serif text-3xl md:text-5xl font-normal leading-none text-primary"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {now.getDate().toString().padStart(2, "0")}
          </motion.div>
          <div className="text-xs uppercase font-medium tracking-[0.2em] mt-2 text-foreground/80 [[dir=rtl]_&]:tracking-normal">
            {now.toLocaleString(locale, { month: "short" })} '
            {now.getFullYear().toString().slice(-2)}
          </div>
          <div className="w-full h-[1px] bg-border my-6 hidden md:block" />
          <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/50 mt-auto hidden md:block">
            {t("brief")}
          </div>
        </div>

        {/* Main Headings */}
        <div className="md:col-span-6 flex flex-col justify-center px-0 md:px-6">
          <h2 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tighter text-foreground mb-6">
            <span className="block text-foreground/50 text-xl md:text-2xl font-sans tracking-tight mb-2 italic">
              {t("headlinePrefix")}
            </span>
            <span className="hover:text-primary transition-colors duration-500 selection:bg-primary selection:text-white">
              {t("headlineAccent")}
            </span>
            <span className="text-primary italic block md:inline-block md:ml-2">
              {displayName}.
            </span>
          </h2>
          <p className="text-foreground/70 text-sm md:text-base font-light leading-relaxed max-w-lg mb-8 md:mb-0">
            {profileCompleteness < 100
              ? t("profileIncomplete")
              : "Your portfolio represents your highest professional standards. Continue curating your edge."}
          </p>
        </div>

        {/* Profile Strength & CTAs */}
        <div className="md:col-span-4 flex flex-col justify-between md:pl-6 md:border-l border-border group/meter">
          <div className="space-y-4 flex-grow mb-8 md:mb-0">
            <div className="flex items-end justify-between border-b-2 border-foreground/20 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 [[dir=rtl]_&]:tracking-normal">
                {t("profileStrength")}
              </span>
              <span className="font-serif text-3xl md:text-4xl leading-none text-foreground tracking-tighter">
                {profileCompleteness}
                <span className="text-xl text-primary">%</span>
              </span>
            </div>

            <div className="relative h-1.5 w-full bg-border overflow-hidden rounded-none">
              <motion.div
                className="absolute top-0 left-0 h-full bg-primary"
                initial={
                  prefersReducedMotion
                    ? { width: `${profileCompleteness}%` }
                    : { width: 0 }
                }
                animate={{ width: `${profileCompleteness}%` }}
                transition={getTransition(
                  { duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
                  prefersReducedMotion,
                )}
              />
              {/* Texture overlay on progress bar */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxwYXRoIGQ9Ik0wLDRMMSw0TDEsM0wwLDNaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
            </div>

            <p className="text-[11px] text-foreground/50 font-medium leading-snug">
              {profileCompleteness >= 100
                ? t("profileReady")
                : t("profileRemaining", {
                    remaining: 100 - profileCompleteness,
                  })}
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-3">
            {profileCompleteness < 100 && (
              <Link
                href={`/profile/${profileUserId}` as Route}
                className="w-full"
              >
                <Button className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-[0.15em] text-[10px] h-12 rounded-none transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_oklch(var(--primary))]">
                  {t("completeProfile")}
                </Button>
              </Link>
            )}
            <Link href="/dashboard/explore" className="w-full">
              <Button
                variant="outline"
                className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-[0.15em] text-[10px] h-12 rounded-none transition-all duration-300"
              >
                {t("exploreInternships")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
