"use client"

import { ArrowLeft } from "lucide-react"
import * as motion from "motion/react-client"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { ease, reveal } from "@/lib/animations"

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
      <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
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
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-sidebar text-sidebar-foreground border-e border-border/50 transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Subtle texture base without glowing spheres */}
        <div className="absolute inset-0 bg-primary/[0.02]" />
      </div>

      <Link
        href="/"
        aria-label={t("backHomeAria")}
        className="absolute top-6 start-6 z-20 inline-flex h-10 w-10 items-center justify-center border border-border/60 bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="h-4 w-4 in-[[dir=rtl]]:rotate-180" />
      </Link>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 sm:px-12">
        {/* Volume marker */}
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="mb-14 inline-flex items-center gap-2 border border-border/60 bg-background px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground in-[[dir=rtl]]:tracking-normal"
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
          Stag<span className="text-primary">.</span>io
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
