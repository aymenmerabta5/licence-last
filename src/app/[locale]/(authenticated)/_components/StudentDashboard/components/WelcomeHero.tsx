"use client"

import * as motion from "motion/react-client"
import { useReducedMotion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Route } from "next"
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
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now)

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={getTransition(
        { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        prefersReducedMotion,
      )}
      className="relative"
    >
      {/* Primary accent top border */}
      <div className="h-0.5 bg-primary" />

      <div className="border border-t-0 border-border/50 p-8 md:p-10 relative overflow-hidden">
        {/* Dark mode subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative">
          {/* Top row: section label + date */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              {t("brief")}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hidden sm:block [[dir=rtl]_&]:tracking-normal">
              {dateStr}
            </span>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            {/* Left: headline + CTAs */}
            <div className="lg:col-span-8 space-y-5">
              <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] tracking-tight text-heading">
                {t("headlinePrefix")}{" "}
                <span className="text-primary italic">{t("headlineAccent")}</span>,{" "}
                {displayName}?
              </h2>
              <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xl">
                {profileCompleteness < 100
                  ? t("profileIncomplete")
                  : t("profileComplete")}
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                {profileCompleteness < 100 && (
                  <Link href={`/profile/${profileUserId}` as Route}>
                    <Button
                      variant="editorial"
                      size="editorial"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {t("completeProfile")}
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/explore">
                  <Button variant="editorial-outline" size="editorial">
                    {t("exploreInternships")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: profile strength meter */}
            <div className="lg:col-span-4">
              <div className="border-s-2 border-primary/20 ps-6 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
                    {t("profileStrength")}
                  </span>
                  <span className="font-serif text-2xl font-bold text-heading leading-none">
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="h-0.5 w-full bg-border/30 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={
                      prefersReducedMotion
                        ? { width: `${profileCompleteness}%` }
                        : { width: 0 }
                    }
                    animate={{ width: `${profileCompleteness}%` }}
                    transition={getTransition(
                      {
                        duration: 1,
                        delay: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                      },
                      prefersReducedMotion,
                    )}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/50 font-medium">
                  {profileCompleteness >= 100
                    ? t("profileReady")
                    : t("profileRemaining", { remaining: 100 - profileCompleteness })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
