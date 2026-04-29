"use client"

import * as motion from "motion/react-client"
import type { Route } from "next"
import { useLocale, useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

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
  const firstName = userName?.split(" ")[0]
  const displayName = firstName ?? t("defaultName")
  const now = new Date()

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">Student</Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <p className="text-sm italic text-muted-foreground">
              {t("headlinePrefix")}
            </p>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight text-heading">
              {t("headlineAccent")}{" "}
              <span className="text-primary italic">{displayName}.</span>
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-xl">
              {profileCompleteness < 100
                ? t("profileIncomplete")
                : t("profileComplete")}
            </p>
          </div>

          {/* Profile strength + date */}
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.15)}
            className="shrink-0 border-s border-border/40 ps-6 hidden md:flex flex-col gap-4"
          >
            <div className="text-end space-y-1">
              <span className="font-serif text-3xl text-primary leading-none block">
                {now.getDate().toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block">
                {new Intl.DateTimeFormat(locale, { month: "short" })
                  .format(now)
                  .toLocaleUpperCase(locale)}{" "}
                '{now.getFullYear().toString().slice(-2)}
              </span>
            </div>

            <div className="h-px bg-border/40" />

            {/* Profile strength mini gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  {t("profileStrength")}
                </span>
                <span className="font-serif text-lg text-heading tabular-nums">
                  {profileCompleteness}
                  <span className="text-xs text-primary">%</span>
                </span>
              </div>
              <div className="h-1 w-32 bg-border/30 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompleteness}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.2)}
          className="flex flex-wrap gap-3 pt-2"
        >
          {profileCompleteness < 100 && (
            <Button
              nativeButton={false}
              render={
                <Link href={`/profile/${profileUserId}` as Route}>
                  {t("completeProfile")}
                </Link>
              }
              variant="editorial"
              size="editorial"
            />
          )}
          <Button
            nativeButton={false}
            render={
              <Link href="/dashboard/explore">{t("exploreInternships")}</Link>
            }
            variant="editorial-outline"
            size="editorial"
          />
        </motion.div>
      </div>
    </header>
  )
}
