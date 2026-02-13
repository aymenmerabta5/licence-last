"use client"

import { Loader2 } from "lucide-react"
import type { UseQueryResult } from "@tanstack/react-query"

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
  return (
    <div className="border border-border p-5 space-y-4">
      <h3 className="font-serif text-base text-heading">Why this match?</h3>
      {matchScoreQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Computing fit score...
        </div>
      ) : matchScoreQuery.data ? (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="font-serif text-3xl text-heading tabular-nums">
              {matchScoreQuery.data.score}
              <span className="text-base text-muted-foreground">/100</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {matchScoreQuery.data.version}
            </p>
          </div>

          <div className="space-y-2">
            {matchScoreQuery.data.reasons.slice(0, 3).map((reason) => (
              <div key={reason.key} className="text-xs">
                <p className="font-medium text-foreground">{reason.title}</p>
                <p className="text-muted-foreground">{reason.detail}</p>
              </div>
            ))}
          </div>

          {skillGapQuery.data &&
            skillGapQuery.data.missingSkills.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Missing skills roadmap
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skillGapQuery.data.missingSkills
                    .slice(0, 5)
                    .map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300"
                      >
                        {skill.name}
                      </span>
                    ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Estimated improvement: +{skillGapQuery.data.estimatedDelta}%
                  readiness
                </p>
              </div>
            )}

          <div className="pt-2 border-t border-border space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Readiness trend
            </p>
            <p className="text-xs text-muted-foreground">
              Latest:{" "}
              {latestReadiness ?? matchScoreQuery.data.readinessPercent}%
              {readinessDelta !== null && (
                <span
                  className={
                    readinessDelta >= 0
                      ? "text-green-600 ms-1"
                      : "text-red-600 ms-1"
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
        <p className="text-xs text-muted-foreground">
          Score unavailable right now.
        </p>
      )}
    </div>
  )
}
