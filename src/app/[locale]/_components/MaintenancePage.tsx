"use client"

import { motion, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import { Wrench } from "lucide-react"
import { MaintenanceBackdrop } from "@/app/[locale]/_components/MaintenanceBackdrop"
import { reveal, ease, fadeIn } from "@/lib/animations"

export function MaintenancePage() {
  const t = useTranslations("maintenance")
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-20">
      <MaintenanceBackdrop />

      <motion.div
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
        initial="initial"
        animate="animate"
      >
        {/* Ornamental rotating badge */}
        <motion.div
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.7, ease, delay: 0 }}
          className="mb-10 inline-flex items-center justify-center"
        >
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Outer rotating ring */}
            <motion.div
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border border-dashed border-primary/25 dark:border-primary/30"
            />
            {/* Inner rotating ring (counter) */}
            <motion.div
              animate={prefersReducedMotion ? {} : { rotate: -360 }}
              transition={{
                duration: 32,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-2 rounded-full border border-dotted border-primary/15 dark:border-primary/20"
            />
            {/* Icon */}
            <Wrench
              className="relative z-10 h-7 w-7 text-primary"
              strokeWidth={1.5}
            />
          </div>
        </motion.div>

        {/* Kicker / issue label */}
        <motion.span
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.6, ease, delay: 0.12 }}
          className="mb-5 inline-block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          {t("kicker")}
        </motion.span>

        {/* Main headline */}
        <motion.h1
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
          className="font-serif text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[0.95] tracking-tight text-heading"
        >
          {t("title")}
        </motion.h1>

        {/* Decorative rule */}
        <motion.div
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.6, ease, delay: 0.35 }}
          className="my-8 flex items-center gap-3"
        >
          <span className="inline-block h-px w-10 bg-primary/40" />
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/60" />
          <span className="inline-block h-px w-10 bg-primary/40" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.6, ease, delay: 0.45 }}
          className="max-w-md font-sans text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        {/* Status pill */}
        <motion.div
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.6, ease, delay: 0.6 }}
          className="mt-10 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-5 py-2 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-sans text-xs font-medium tracking-wide text-foreground">
            {t("status")}
          </span>
        </motion.div>

        {/* Footer stamp */}
        <motion.div
          variants={prefersReducedMotion ? fadeIn : reveal}
          transition={{ duration: 0.6, ease, delay: 0.75 }}
          className="mt-16 font-serif text-6xl font-normal leading-none text-primary/[0.07] dark:text-primary/[0.09] select-none sm:text-8xl"
          aria-hidden="true"
        >
          Stag
        </motion.div>
      </motion.div>
    </div>
  )
}
