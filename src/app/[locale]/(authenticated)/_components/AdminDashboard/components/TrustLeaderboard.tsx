"use client"

import { ArrowRight, Shield } from "lucide-react"
import * as motion from "motion/react-client"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface TrustEntry {
  companyId: string
  companyName: string | null
  trustScore: number
  tier: "low" | "watch" | "good" | "excellent"
}

const TIER_STYLES: Record<string, string> = {
  excellent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  good: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  watch: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  low: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
}

interface TrustLeaderboardProps {
  indices: TrustEntry[]
}

export function TrustLeaderboard({ indices }: TrustLeaderboardProps) {
  if (indices.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45, ease }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
            Trust Index
          </h3>
        </div>
        <Link
          href="/dashboard/admin/stats"
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors group/link"
        >
          View All{" "}
          <ArrowRight className="inline h-3 w-3 [[dir=rtl]_&]:rotate-180" />
        </Link>
      </div>

      <div className="space-y-2">
        {indices.slice(0, 5).map((entry, i) => (
          <div
            key={entry.companyId}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <span className="text-[11px] font-bold text-muted-foreground/30 w-4 text-end tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-heading truncate">
                {entry.companyName ?? "Unknown"}
              </p>
            </div>
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                TIER_STYLES[entry.tier] ?? TIER_STYLES.watch,
              )}
            >
              {entry.tier}
            </span>
            <span className="font-serif text-sm font-bold text-heading tabular-nums w-8 text-end">
              {entry.trustScore}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
