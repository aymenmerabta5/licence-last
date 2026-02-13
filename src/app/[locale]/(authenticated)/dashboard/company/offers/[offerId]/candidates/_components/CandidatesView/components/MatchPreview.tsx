"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { orpc } from "@/server/orpc/client"

interface MatchPreviewProps {
  offerId: string
  studentUserId: string
}

export function MatchPreview({ offerId, studentUserId }: MatchPreviewProps) {
  const query = useQuery(
    orpc.matching.getScore.queryOptions({
      input: { offerId, studentUserId },
    }),
  )

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Scoring...
      </div>
    )
  }

  if (!query.data) return null

  return (
    <div className="space-y-1.5 border-t border-border pt-2">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
        Fit score{" "}
        <span className="text-foreground font-semibold">
          {query.data.score}/100
        </span>
      </p>
      {query.data.reasons.slice(0, 2).map((reason) => (
        <p key={reason.key} className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">{reason.title}:</span>{" "}
          {reason.detail}
        </p>
      ))}
    </div>
  )
}
