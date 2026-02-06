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
    <div className="ed-auth-panel h-full flex flex-col items-center justify-center relative overflow-hidden bg-accent">
      <Link href="/" className="absolute top-4 left-4">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      {/* Ambient glow — dark mode only */}
      <div
        className="ed-auth-panel-glow absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-12">
        {/* Volume marker */}
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="text-[10px] tracking-[0.35em] uppercase opacity-40 mb-16 font-light"
        >
          {t("volume")}
        </motion.span>

        {/* Top separator */}
        <DotSeparator lineWidth={56} delay={0.2} />

        {/* Brand wordmark */}
        <motion.h1
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="font-serif text-5xl xl:text-6xl tracking-tight mt-14 mb-6"
        >
          Internex<span className="text-primary">.</span>io
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="font-serif text-lg xl:text-xl opacity-60 leading-relaxed max-w-[260px] mb-14"
        >
          {t("tagline")}
        </motion.p>

        {/* Middle separator */}
        <DotSeparator lineWidth={40} delay={0.5} />

        {/* Description */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
          className="text-[11px] tracking-[0.2em] uppercase opacity-30 max-w-[240px] leading-relaxed mt-14"
        >
          {t("description")}
        </motion.p>

        {/* Established */}
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.65 }}
          className="text-[10px] tracking-[0.3em] uppercase opacity-20 mt-20"
        >
          {t("established")}
        </motion.span>
      </div>
    </div>
  )
}
