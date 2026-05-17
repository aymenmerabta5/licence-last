"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface RecruiterHeroProps {
  activeOffers: number
  trustData: {
    trustScore: number
  } | null
}

export function RecruiterHero({ activeOffers, trustData }: RecruiterHeroProps) {
  const t = useTranslations("dashboard.recruiter.hero")
  const now = new Date()

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">{t("badge")}</Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <p className="text-sm italic text-muted-foreground">
              {t("talentAcquisition")}
            </p>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight text-heading max-w-2xl">
              {activeOffers > 0 ? t("pipelineActive") : t("findNextIntern")}
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-xl">
              {activeOffers > 0
                ? `${activeOffers} live offer${activeOffers !== 1 ? "s" : ""} attracting candidates. Track applications, manage your pipeline, and close positions.`
                : "Post internship offers, review candidates, and manage your recruitment pipeline from one place."}
            </p>
          </div>

          {/* Date + Trust score */}
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.15)}
            className="shrink-0 border-s border-border/40 ps-6 hidden md:flex flex-col gap-4"
          >
            <div className="text-end space-y-1">
              <span className="font-serif text-3xl text-primary leading-none block">
                {now.getDate().toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block">
                {now.toLocaleString("en-US", { month: "short" })} '
                {now.getFullYear().toString().slice(-2)}
              </span>
            </div>

            {trustData && (
              <>
                <div className="h-px bg-border/40" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {t("trustScore")}
                    </span>
                    <span className="font-serif text-lg text-heading tabular-nums">
                      {trustData.trustScore}
                      <span className="text-xs text-primary">/100</span>
                    </span>
                  </div>
                  <div className="h-1 w-32 bg-border/30 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(trustData.trustScore, 100)}%`,
                      }}
                      transition={{ duration: 1.2, delay: 0.5, ease }}
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </header>
  )
}
