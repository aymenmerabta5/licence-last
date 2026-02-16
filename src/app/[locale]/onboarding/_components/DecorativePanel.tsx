"use client"

import * as motion from "motion/react-client"
import { usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Building2, GraduationCap, Landmark, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { ease } from "@/lib/animations"

interface RoleConfig {
  namespace: "onboarding.company" | "onboarding.student" | "onboarding.university"
  icon: LucideIcon
  accentClass: string
  patternOpacity: string
}

const ROLE_MAP: Record<string, RoleConfig> = {
  company: {
    namespace: "onboarding.company",
    icon: Building2,
    accentClass: "text-primary",
    patternOpacity: "opacity-[0.03]",
  },
  student: {
    namespace: "onboarding.student",
    icon: GraduationCap,
    accentClass: "text-primary",
    patternOpacity: "opacity-[0.04]",
  },
  university: {
    namespace: "onboarding.university",
    icon: Landmark,
    accentClass: "text-primary",
    patternOpacity: "opacity-[0.03]",
  },
}

function detectRole(pathname: string): string {
  if (pathname.includes("/onboarding/company")) return "company"
  if (pathname.includes("/onboarding/student")) return "student"
  if (pathname.includes("/onboarding/university")) return "university"
  return "student"
}

export function DecorativePanel() {
  const pathname = usePathname()
  const role = detectRole(pathname)
  const config = ROLE_MAP[role]!
  const t = useTranslations(config.namespace)
  const Icon = config.icon

  return (
    <div className="relative h-full w-full bg-foreground overflow-hidden flex flex-col justify-between p-10 xl:p-14">
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Decorative grid pattern */}
      <div className={`absolute inset-0 ${config.patternOpacity} pointer-events-none`}>
        <svg width="100%" height="100%" className="text-background">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Diagonal accent line */}
      <div className="absolute -top-20 -end-20 w-80 h-80 border border-background/[0.06] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -start-32 w-96 h-96 border border-background/[0.04] rounded-full pointer-events-none" />

      {/* Top section - Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
        className="relative z-10"
      >
        <span className="font-serif text-lg tracking-tight text-background/80">
          Internex<span className="text-primary">.</span>io
        </span>
      </motion.div>

      {/* Center section - Hero content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center -mt-8">
        {/* Role icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-background/[0.08] border border-background/[0.08] flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-7 h-7 text-background/70" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="font-serif text-4xl xl:text-5xl text-background tracking-tight leading-[1.1] mb-5"
        >
          {t("panelHeadline")}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.5 }}
          className="text-sm text-background/50 font-light leading-relaxed max-w-xs mb-10"
        >
          {t("panelDescription")}
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
          className="w-12 h-px bg-background/20 mb-8 origin-start"
        />

        {/* Feature list */}
        <div className="space-y-4">
          {(["panelFeature1", "panelFeature2", "panelFeature3"] as const).map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.7 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <span className="text-xs text-background/60 tracking-wide leading-relaxed">
                {t(key)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom section - Decorative dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease, delay: 1 }}
        className="relative z-10 flex items-center gap-1.5"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <div className="w-1.5 h-1.5 rounded-full bg-background/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-background/10" />
      </motion.div>
    </div>
  )
}

/**
 * Condensed mobile variant shown as a hero banner above the form.
 */
export function MobileHeroBanner() {
  const pathname = usePathname()
  const role = detectRole(pathname)
  const config = ROLE_MAP[role]!
  const t = useTranslations(config.namespace)
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative overflow-hidden bg-foreground rounded-2xl p-6 mb-8"
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative z-10 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-background/[0.08] border border-background/[0.06] flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-background/70" />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-xl text-background tracking-tight leading-tight mb-1">
            {t("panelHeadline")}
          </h2>
          <p className="text-xs text-background/40 font-light leading-relaxed line-clamp-2">
            {t("panelDescription")}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
