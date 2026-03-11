"use client"

import { useReducedMotion } from "motion/react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { getTransition } from "@/lib/animations"

import { ProfileStrengthColumn } from "./ProfileStrengthColumn"

interface MetadataItemProps {
  label: string
  delay: number
  prefersReducedMotion: boolean
  children: React.ReactNode
}

function MetadataItem({
  label,
  delay,
  prefersReducedMotion,
  children,
}: MetadataItemProps) {
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8 }}
    >
      <span className="block text-foreground font-bold mb-1 opacity-60">
        {label}
      </span>
      {children}
    </motion.div>
  )
}

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
  const fadeUp = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
  const firstName = userName?.split(" ")[0]
  const displayName = firstName ?? t("defaultName")
  const now = new Date()

  // Format dates cleanly for the editorial column
  const monthDay = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
  }).format(now)

  const year = now.getFullYear().toString()

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition(
        { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        prefersReducedMotion,
      )}
      className="relative w-full"
    >
      {/* Top subtle decorative edge matching the newspaper feel */}
      <div className="absolute top-0 right-0 w-1/3 h-[1px] bg-gradient-to-l from-primary/30 to-transparent -translate-y-px" />

      <div className="relative border-t-2 md:border-t-4 border-foreground/90 pt-8 pb-10 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 group">
        {/* Column 1: Editorial Metadata (span 2) */}
        <div className="md:col-span-3 lg:col-span-2 flex flex-row md:flex-col justify-between gap-6 uppercase font-sans tracking-widest text-[10px] md:text-xs text-muted-foreground md:border-r border-border/40 md:pr-4">
          <MetadataItem
            label="Vol."
            delay={0.2}
            prefersReducedMotion={prefersReducedMotion}
          >
            <span className="font-serif text-xl md:text-2xl text-foreground font-medium tracking-normal">
              01
            </span>
          </MetadataItem>

          <MetadataItem
            label="Date"
            delay={0.3}
            prefersReducedMotion={prefersReducedMotion}
          >
            <span className="text-foreground tracking-widest">
              {monthDay}, {year}
            </span>
          </MetadataItem>

          <MetadataItem
            label="Status"
            delay={0.4}
            prefersReducedMotion={prefersReducedMotion}
          >
            <span className="text-foreground font-medium flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full block ${profileCompleteness === 100 ? "bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-primary/80 animate-pulse"}`}
              />
              {profileCompleteness === 100 ? "Ready" : "In Progress"}
            </span>
          </MetadataItem>
        </div>

        {/* Column 2: Main Editorial Headline (span 7.5 relative to grid size contextually) */}
        <div className="md:col-span-9 lg:col-span-7 flex flex-col justify-center relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <h1 className="font-serif text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[0.9] tracking-tighter text-foreground mb-8">
            <motion.span
              initial={fadeUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="block text-muted-foreground text-xl md:text-2xl lg:text-3xl font-sans tracking-tight mb-4 md:mb-6 font-light italic"
            >
              {t("headlinePrefix")}
            </motion.span>

            <div className="flex flex-wrap items-baseline gap-x-3 md:gap-x-4">
              <motion.span
                initial={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="hover:italic hover:text-primary transition-all duration-500 selection:bg-primary selection:text-white inline-block"
              >
                {t("headlineAccent")}
              </motion.span>
              <motion.span
                initial={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-primary italic inline-block"
              >
                {displayName}.
              </motion.span>
            </div>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-foreground/75 text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-xl font-sans"
          >
            {profileCompleteness < 100
              ? t("profileIncomplete")
              : "Your portfolio represents your highest professional standards. Continue curating your edge."}
          </motion.p>
        </div>

        {/* Column 3: Profile Strength & CTAs (span 3) */}
        <ProfileStrengthColumn
          profileCompleteness={profileCompleteness}
          profileUserId={profileUserId}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </motion.div>
  )
}
