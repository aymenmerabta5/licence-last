"use client"

import * as motion from "motion/react-client"
import type { Route } from "next"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { getTransition } from "@/lib/animations"

interface ProfileStrengthColumnProps {
  profileCompleteness: number
  profileUserId: string
  prefersReducedMotion: boolean
}

export function ProfileStrengthColumn({
  profileCompleteness,
  profileUserId,
  prefersReducedMotion,
}: ProfileStrengthColumnProps) {
  const t = useTranslations("dashboard.student.welcomeHero")

  return (
    <div className="md:col-span-12 lg:col-span-3 flex flex-col justify-between border-t md:border-t-0 md:pt-0 pt-8 lg:border-s lg:border-border/40 lg:ps-10 group/meter relative">
      <div className="flex flex-col gap-6 md:flex-row lg:flex-col md:items-center lg:items-start justify-between">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-foreground/60 font-semibold mb-1">
              {t("profileStrength")}
            </div>
            <div className="font-serif text-5xl md:text-6xl tracking-tighter text-foreground leading-none">
              {profileCompleteness}
              <span className="text-primary text-2xl md:text-3xl align-top ms-1 font-sans font-light">
                %
              </span>
            </div>
          </div>

          <div className="relative h-[2px] w-full bg-border/40 overflow-hidden mt-4 mb-4">
            <motion.div
              className="absolute top-0 start-0 bottom-0 bg-primary"
              initial={
                prefersReducedMotion
                  ? { width: `${profileCompleteness}%` }
                  : { width: 0 }
              }
              animate={{ width: `${profileCompleteness}%` }}
              transition={getTransition(
                { duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
                prefersReducedMotion,
              )}
            />
          </div>

          <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
            {profileCompleteness >= 100
              ? t("profileReady")
              : t("profileRemaining", {
                  remaining: 100 - profileCompleteness,
                })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-8 lg:mt-0">
        {profileCompleteness < 100 && (
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/profile/${profileUserId}` as Route}
                prefetch={false}
              >
                {t("completeProfile")}
              </Link>
            }
            className="w-full flex-1 rounded-none tracking-widest uppercase text-[10px] md:text-xs h-12 md:h-14 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          ></Button>
        )}
        <Button
          nativeButton={false}
          render={
            <Link href="/dashboard/explore" prefetch={false}>
              {t("exploreInternships")}
            </Link>
          }
          variant="outline"
          className="w-full flex-1 rounded-none tracking-widest uppercase text-[10px] md:text-xs h-12 md:h-14 border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 bg-transparent"
        ></Button>
      </div>
    </div>
  )
}
