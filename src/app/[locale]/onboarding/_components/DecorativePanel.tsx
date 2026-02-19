"use client"

import * as motion from "motion/react-client"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  GrainTextureOverlay,
  GridPatternOverlay,
  useOnboardingRoleConfig,
} from "@/app/[locale]/onboarding/_components/decorativePanelShared"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

function DotSeparator({
  lineWidth = 32,
  delay = 0,
}: {
  lineWidth?: number
  delay?: number
}) {
  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(delay)}
      className="flex items-center gap-4"
      aria-hidden="true"
    >
      <span className="h-px bg-current opacity-20" style={{ width: lineWidth }} />
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span className="h-px bg-current opacity-20" style={{ width: lineWidth }} />
    </motion.div>
  )
}

export function DecorativePanel() {
  const { role, config } = useOnboardingRoleConfig()
  const tRole = useTranslations(config.namespace)
  const tAuthPanel = useTranslations("auth.panel")
  const Icon = config.icon
  const patternId = `onboarding-grid-${role}`

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-linear-to-br from-accent via-accent to-muted text-accent-foreground transition-colors duration-500 dark:from-accent dark:via-accent dark:to-card">
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100" aria-hidden="true">
        <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 start-1/2 h-104 w-104 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/20" />
      </div>

      <GrainTextureOverlay />
      <GridPatternOverlay patternId={patternId} opacityClass={config.patternOpacity} size={40} />

      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-border/35 dark:ring-border/60"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-20 -end-20 h-80 w-80 rounded-full border border-border/35" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 rounded-full border border-border/25" aria-hidden="true" />

      <Link
        href="/"
        aria-label={tAuthPanel("backHomeAria")}
        className="absolute top-5 start-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/50 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-background/20 dark:hover:bg-background/30"
      >
        <ArrowLeft className="h-4 w-4 in-[[dir=rtl]]:rotate-180" />
      </Link>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 py-16 text-center xl:px-12">
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="mb-12 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/35 px-4 py-2 text-[10px] font-light uppercase tracking-[0.35em] text-muted-foreground backdrop-blur-sm in-[[dir=rtl]]:tracking-normal"
        >
          {tRole("title")}
        </motion.span>

        <DotSeparator lineWidth={56} delay={0.2} />

        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="mt-10 mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/35 bg-background/45 backdrop-blur-sm"
        >
          <Icon className="h-7 w-7 text-primary" />
        </motion.div>

        <motion.h2
          {...reveal}
          transition={{ duration: 0.8, ease, delay: 0.35 }}
          className="font-serif text-4xl tracking-tight leading-[1.1] text-heading xl:text-5xl"
        >
          {tRole("panelHeadline")}
        </motion.h2>

        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.45 }}
          className="mt-5 max-w-[300px] text-sm font-light leading-relaxed text-muted-foreground"
        >
          {tRole("panelDescription")}
        </motion.p>

        <div className="mt-10">
          <DotSeparator lineWidth={36} delay={0.55} />
        </div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.65 }}
          className="mt-10 w-full max-w-[300px] space-y-4 text-start"
        >
          {(["panelFeature1", "panelFeature2", "panelFeature3"] as const).map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.7 + i * 0.08 }}
              className="flex items-start gap-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <span className="text-xs leading-relaxed tracking-wide text-muted-foreground/85">
                {tRole(key)}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.95 }}
          className="mt-14 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60 in-[[dir=rtl]]:tracking-normal"
        >
          {tRole("subtitle")}
        </motion.span>
      </div>
    </div>
  )
}

export function MobileHeroBanner() {
  const { role, config } = useOnboardingRoleConfig()
  const tRole = useTranslations(config.namespace)
  const Icon = config.icon
  const mobilePatternId = `onboarding-mobile-grid-${role}`

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative mb-8 overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-accent via-accent to-muted p-6 text-accent-foreground shadow-sm transition-colors duration-500 dark:border-border/80 dark:from-accent dark:via-accent dark:to-card"
    >
      <GrainTextureOverlay />
      <GridPatternOverlay patternId={mobilePatternId} opacityClass={config.patternOpacity} size={34} />

      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/8 via-transparent to-transparent dark:from-primary/12"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-background/45 backdrop-blur-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="mb-1 font-serif text-xl leading-tight tracking-tight text-heading">
            {tRole("panelHeadline")}
          </h2>
          <p className="line-clamp-2 text-xs font-light leading-relaxed text-muted-foreground">
            {tRole("panelDescription")}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground in-[[dir=rtl]]:tracking-normal">
          {tRole("title")}
        </span>
        <span className="h-px flex-1 bg-border/45" />
      </div>
    </motion.div>
  )
}
