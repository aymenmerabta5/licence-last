import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { isSavedOffersEnabledOnClient } from "@/lib/feature-flags-client"

export function ExploreHeader() {
  const t = useTranslations("dashboard.explore")
  const locale = useLocale()
  const savedOffersEnabled = isSavedOffersEnabledOnClient()

  const now = new Date()
  const dateStr = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
    .format(now)
    .toLocaleUpperCase(locale)

  return (
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      {/* Primary accent top rule */}
      <div className="h-0.5 bg-primary" />

      <div className="border border-t-0 border-border/50 p-6 md:p-8 relative overflow-hidden">
        {/* Dark mode subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative">
          {/* Top row: section label + date */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              {t("title")}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hidden sm:block [[dir=rtl]_&]:tracking-normal">
              {dateStr}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.1] tracking-tight text-heading">
            {t("subtitle")}
          </h1>

          {savedOffersEnabled && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t("savedOffersDescription")}
              </p>
              <Button
                variant="editorial-outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/student/saved-offers" />}
              >
                {t("savedOffersAction")}
              </Button>
            </div>
          )}

          {/* Decorative bottom rule */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 [[dir=rtl]_&]:tracking-normal">
              --
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
