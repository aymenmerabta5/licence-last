"use client"

import type { UseQueryResult } from "@tanstack/react-query"
import { Loader2, Target, TrendingUp } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease, reveal } from "@/lib/animations"

interface MatchScoreData {
  score: number
  version: string
  readinessPercent: number
  reasons: { key: string; title: string; detail: string }[]
}

interface SkillGapData {
  missingSkills: { id: string; name: string }[]
  estimatedDelta: number
}

interface MatchingPanelProps {
  matchScoreQuery: UseQueryResult<MatchScoreData, Error>
  skillGapQuery: UseQueryResult<SkillGapData, Error>
  latestReadiness: number | undefined
  readinessDelta: number | null
}

export function MatchingPanel({
  matchScoreQuery,
  skillGapQuery,
  latestReadiness,
  readinessDelta,
}: MatchingPanelProps) {
  const t = useTranslations("dashboard.offerDetail.matching")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.2 }}
      className="border border-border p-5 space-y-4"
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("title")}
        </span>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {matchScoreQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("computing")}
        </div>
      ) : matchScoreQuery.data ? (
        <div className="space-y-4">
          {/* Score display */}
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className="font-serif text-4xl text-heading tabular-nums leading-none">
                {matchScoreQuery.data.score}
                <span className="text-lg text-muted-foreground font-sans">
                  /100
                </span>
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                {matchScoreQuery.data.version}
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${matchScoreQuery.data.score}%` }}
                transition={{ duration: 0.8, ease }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          {/* Reasons */}
          <div className="space-y-2.5">
            {matchScoreQuery.data.reasons.slice(0, 3).map((reason) => (
              <div
                key={reason.key}
                className="text-xs border-s-2 border-primary/20 ps-3 py-0.5"
              >
                <p className="font-medium text-foreground">{reason.title}</p>
                <p className="text-muted-foreground">{reason.detail}</p>
              </div>
            ))}
          </div>

          {/* Missing skills */}
          {skillGapQuery.data &&
            skillGapQuery.data.missingSkills.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border/30">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                  {t("missingSkills")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skillGapQuery.data.missingSkills.slice(0, 5).map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("estimatedImprovement", {
                    delta: skillGapQuery.data.estimatedDelta,
                  })}
                </p>
              </div>
            )}

          {/* Readiness trend */}
          <div className="pt-3 border-t border-border/30 space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground/60" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                {t("readinessTrend")}
              </p>
            </div>
            <p className="text-sm font-medium text-foreground tabular-nums">
              {latestReadiness ?? matchScoreQuery.data.readinessPercent}%
              {readinessDelta !== null && (
                <span
                  className={
                    readinessDelta >= 0
                      ? "text-green-600 dark:text-green-400 ms-1.5 text-xs"
                      : "text-red-600 dark:text-red-400 ms-1.5 text-xs"
                  }
                >
                  ({readinessDelta >= 0 ? "+" : ""}
                  {readinessDelta}%)
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("unavailable")}</p>
      )}
    </motion.div>
  )
}
