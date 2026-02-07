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

/* ── Floating Ember Particle ── */
function FloatingEmber({
  delay,
  duration,
  x,
  size
}: {
  delay: number
  duration: number
  x: number
  size: number
}) {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{
        y: "-100%",
        opacity: [0, 0.8, 0.6, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute rounded-full bg-primary/60 blur-[1px]"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        boxShadow: "0 0 8px var(--primary), 0 0 16px var(--primary)",
      }}
    />
  )
}

/* ── Decorative Dot Separator with Glow ── */
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
      <motion.span
        className="h-px bg-current opacity-20"
        style={{ width: lineWidth }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease, delay: delay + 0.2 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-primary relative"
        whileHover={{ scale: 1.3 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
      </motion.span>
      <motion.span
        className="h-px bg-current opacity-20"
        style={{ width: lineWidth }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease, delay: delay + 0.2 }}
      />
    </motion.div>
  )
}

/* ── Auth Panel ── */
export function AuthPanel() {
  const t = useTranslations("auth.panel")

  // Generate random ember particles
  const embers = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.8,
    duration: 6 + Math.random() * 4,
    x: 10 + Math.random() * 80,
    size: 2 + Math.random() * 3,
  }))

  return (
    <div className="ed-auth-panel h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button with hover effect */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 opacity-40 hover:opacity-100 transition-all duration-300 group"
      >
        <motion.div
          whileHover={{ x: -2 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:scale-110" />
        </motion.div>
      </Link>

      {/* Layered Background Effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Primary gradient mesh */}
        <div className="absolute inset-0 ed-auth-gradient" />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Multi-layer glow effects */}
        <div className="ed-auth-glow-primary absolute inset-0" />
        <div className="ed-auth-glow-secondary absolute inset-0" />
        <div className="ed-auth-glow-accent absolute inset-0" />

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Floating ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {embers.map((ember) => (
          <FloatingEmber key={ember.id} {...ember} />
        ))}
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-white/5" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-white/5" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-12">
        {/* Volume marker with enhanced styling */}
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-16 font-light ed-auth-text-glow"
        >
          {t("volume")}
        </motion.span>

        {/* Top separator */}
        <DotSeparator lineWidth={56} delay={0.2} />

        {/* Brand wordmark with enhanced typography */}
        <motion.h1
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="font-serif text-5xl xl:text-6xl tracking-tight mt-14 mb-6 ed-auth-brand relative"
        >
          <span className="relative">
            Internex
            <motion.span
              className="text-primary ed-auth-dot"
              animate={{
                textShadow: [
                  "0 0 20px var(--primary)",
                  "0 0 40px var(--primary)",
                  "0 0 20px var(--primary)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >.</motion.span>
            io
          </span>
        </motion.h1>

        {/* Tagline with refined styling */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="font-serif text-lg xl:text-xl opacity-80 leading-relaxed max-w-[260px] mb-14 ed-auth-tagline"
        >
          {t("tagline")}
        </motion.p>

        {/* Middle separator */}
        <DotSeparator lineWidth={40} delay={0.5} />

        {/* Description with letterpress effect */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
          className="text-[11px] tracking-[0.2em] uppercase opacity-60 max-w-[240px] leading-loose mt-14 ed-auth-description"
        >
          {t("description")}
        </motion.p>

        {/* Established with decorative frame */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.65 }}
          className="mt-20 relative"
        >
          <span className="text-[10px] tracking-[0.35em] uppercase opacity-50 ed-auth-established">
            {t("established")}
          </span>
          {/* Decorative underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease, delay: 1 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  )
}
