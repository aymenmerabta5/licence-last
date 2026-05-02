"use client"

import type { UseQueryResult } from "@tanstack/react-query"
import { Loader2, Target } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ease } from "@/lib/animations"

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
    <section className="border border-border/50">
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="font-serif text-xl text-heading">{t("title")}</h2>
      </div>
      <div className="px-6 py-6">
        {matchScoreQuery.isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t("computing")}
          </div>
        ) : matchScoreQuery.data ? (
          <div className="space-y-8">
            {/* Score display */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="font-serif text-4xl text-heading tabular-nums leading-none tracking-tighter">
                  {matchScoreQuery.data.score}
                  <span className="text-xl text-muted-foreground/60 font-serif font-light hidden sm:inline-block ms-1">
                    /100
                  </span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground bg-muted px-2 py-1">
                  {matchScoreQuery.data.version}
                </p>
              </div>
              <div className="h-px w-full bg-border/40 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchScoreQuery.data.score}%` }}
                  transition={{ duration: 1, ease }}
                  className="absolute top-0 start-0 h-px bg-primary"
                />
                <motion.div
                  initial={{ insetInlineStart: 0 }}
                  animate={{
                    insetInlineStart: `${matchScoreQuery.data.score}%`,
                  }}
                  transition={{ duration: 1, ease }}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                />
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-4">
              {matchScoreQuery.data.reasons.slice(0, 3).map((reason) => (
                <div key={reason.key} className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    {reason.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Missing skills */}
            {skillGapQuery.data &&
              skillGapQuery.data.missingSkills.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-border/20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    {t("missingSkills")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillGapQuery.data.missingSkills
                      .slice(0, 5)
                      .map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-destructive/5 border border-destructive/10 text-destructive/80 [[dir=rtl]_&]:tracking-normal"
                        >
                          {skill.name}
                        </span>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground/80 italic font-serif">
                    {t("estimatedImprovement", {
                      delta: skillGapQuery.data.estimatedDelta,
                    })}
                  </p>
                </div>
              )}

            {/* Readiness trend */}
            <div className="pt-6 border-t border-border/20 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {t("readinessTrend")}
              </p>
              <p className="text-xl font-serif text-heading tabular-nums">
                {latestReadiness ?? matchScoreQuery.data.readinessPercent}%
                {readinessDelta !== null && (
                  <span
                    className={
                      readinessDelta >= 0
                        ? "text-green-600 dark:text-green-400 ms-2 text-sm font-sans"
                        : "text-destructive/80 ms-2 text-sm font-sans"
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
      </div>
    </section>
  )
}
