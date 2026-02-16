"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2, Zap } from "lucide-react"

import { orpc } from "@/server/orpc/client"
import { cn } from "@/lib/utils"

interface MatchPreviewProps {
  offerId: string
  studentUserId: string
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-blue-600 dark:text-blue-400"
  if (score >= 40) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

function getBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-amber-500"
  return "bg-rose-500"
}

export function MatchPreview({ offerId, studentUserId }: MatchPreviewProps) {
  const query = useQuery(
    orpc.matching.getScore.queryOptions({
      input: { offerId, studentUserId },
    }),
  )

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 py-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Scoring...
      </div>
    )
  }

  if (!query.data) return null

  const score = query.data.score

  return (
    <div className="border-t border-border/30 pt-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-primary/50" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Fit Score
          </span>
        </div>
        <span className={cn("font-serif text-sm font-bold tabular-nums", getScoreColor(score))}>
          {score}<span className="text-[9px] text-muted-foreground/40">/100</span>
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="h-1 rounded-full bg-secondary/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getBarColor(score))}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {/* Top reasons */}
      {query.data.reasons.slice(0, 2).map((reason) => (
        <p key={reason.key} className="text-[10px] text-muted-foreground/50 leading-relaxed">
          <span className="font-medium text-muted-foreground">{reason.title}:</span>{" "}
          {reason.detail}
        </p>
      ))}
    </div>
  )
}
