"use client"

import { ArrowLeft, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import {
  GrainTextureOverlay,
  GridPatternOverlay,
  useOnboardingRoleConfig,
} from "@/app/[locale]/onboarding/_components/decorativePanelShared"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { authClient } from "@/lib/auth-client"

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
      <span
        className="h-px bg-current opacity-20"
        style={{ width: lineWidth }}
      />
      <span className="h-1.5 w-1.5 rotate-45 bg-primary" />
      <span
        className="h-px bg-current opacity-20"
        style={{ width: lineWidth }}
      />
    </motion.div>
  )
}

export function DecorativePanel() {
  const { config } = useOnboardingRoleConfig()
  const tRole = useTranslations(config.namespace)
  const tAuthPanel = useTranslations("auth.panel")
  const { data: session } = authClient.useSession()
  const isImpersonated = Boolean(
    (session?.session as { impersonatedBy?: string } | null)?.impersonatedBy,
  )
  const Icon = config.icon

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground border-e border-border/50 transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Subtle texture base without glowing spheres */}
        <div className="absolute inset-0 bg-primary/[0.02]" />
      </div>

      {!isImpersonated && (
        <Link
          href="/"
          aria-label={tAuthPanel("backHomeAria")}
          className="absolute top-6 start-6 z-20 inline-flex h-10 w-10 items-center justify-center border border-border/60 bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="h-4 w-4 in-[[dir=rtl]]:rotate-180" />
        </Link>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 py-16 text-center xl:px-12">
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="mb-12 inline-flex items-center gap-2 border border-border/60 bg-background px-4 py-2 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground in-[[dir=rtl]]:tracking-normal"
        >
          {tRole("title")}
        </motion.span>

        <DotSeparator lineWidth={56} delay={0.2} />

        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="mt-10 mb-7 flex h-16 w-16 items-center justify-center border border-border bg-background shadow-sm"
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
          {(["panelFeature1", "panelFeature2", "panelFeature3"] as const).map(
            (key, i) => (
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
            ),
          )}
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
      className="relative mb-12 overflow-hidden border-y border-border/60 bg-background py-8 text-foreground transition-colors duration-500"
    >
      <GrainTextureOverlay />
      <GridPatternOverlay
        patternId={mobilePatternId}
        opacityClass={config.patternOpacity}
        size={34}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/8 via-transparent to-transparent dark:from-primary/12"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-background">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="mb-1 font-serif text-2xl leading-tight tracking-tight text-heading">
            {tRole("panelHeadline")}
          </h2>
          <p className="line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
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
