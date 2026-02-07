"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/* ── Shared reveal transition ── */
const reveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

/* ── Decorative Dot Separator ── */
function DotSeparator({
  lineWidth = 14,
  delay = 0,
}: {
  lineWidth?: number
  delay?: number
}) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.7, ease, delay }}
      className="flex items-center gap-4"
      aria-hidden="true"
    >
      <span
        className="h-px bg-current opacity-15"
        style={{ width: lineWidth }}
      />
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span
        className="h-px bg-current opacity-15"
        style={{ width: lineWidth }}
      />
    </motion.div>
  )
}

/* ── Auth Panel ── */
export function AuthPanel() {
  const t = useTranslations("auth.panel")

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-accent via-accent to-muted text-accent-foreground transition-colors duration-500 dark:from-accent dark:via-accent dark:to-card">
      {/* Ambient print-glow + vignette (dark mode only) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100" aria-hidden="true">
        <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 start-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
      </div>

      {/* Panel edge definition (helps against bg-background in dark mode) */}
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-border/30 dark:ring-border/60"
        aria-hidden="true"
      />

      <Link
        href="/"
        aria-label={t("backHomeAria")}
        className="absolute top-5 start-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/50 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-background/20 dark:hover:bg-background/30"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 sm:px-12">
        {/* Volume marker */}
          <motion.span
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="mb-14 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/30 px-4 py-2 text-[10px] font-light uppercase tracking-[0.35em] text-muted-foreground backdrop-blur-sm [[dir=rtl]_&]:tracking-normal"
          >
          {t("volume")}
        </motion.span>

        {/* Top separator */}
        <DotSeparator lineWidth={56} delay={0.2} />

        {/* Brand wordmark */}
        <motion.h1
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="mt-12 mb-6 font-serif text-5xl tracking-tight text-heading xl:text-6xl"
        >
          Internex<span className="text-primary">.</span>io
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="mb-12 max-w-[260px] font-serif text-lg leading-relaxed text-muted-foreground xl:text-xl"
        >
          {t("tagline")}
        </motion.p>

        {/* Middle separator */}
        <DotSeparator lineWidth={40} delay={0.5} />

        {/* Description */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
          className="mt-12 max-w-[240px] text-[11px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground/70 [[dir=rtl]_&]:tracking-normal"
        >
          {t("description")}
        </motion.p>

        {/* Established */}
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.65 }}
          className="mt-20 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal"
        >
          {t("established")}
        </motion.span>
      </div>
    </div>
  )
}
