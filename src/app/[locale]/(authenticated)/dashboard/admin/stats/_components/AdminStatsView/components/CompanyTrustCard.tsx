"use client"

import { Loader2, Shield } from "lucide-react"
import * as motion from "motion/react-client"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

const TIER_STYLES: Record<string, { bg: string; text: string }> = {
  excellent: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  good: { bg: "bg-blue-500/10", text: "text-blue-600" },
  watch: { bg: "bg-amber-500/10", text: "text-amber-600" },
  low: { bg: "bg-rose-500/10", text: "text-rose-600" },
}

const TIER_BAR: Record<string, string> = {
  excellent: "bg-emerald-500",
  good: "bg-blue-500",
  watch: "bg-amber-500",
  low: "bg-rose-500",
}

interface TrustRow {
  companyId: string
  companyName: string
  trustScore: number
  tier: string
  companyStatus: string
}

interface CompanyTrustCardProps {
  trustIndices: TrustRow[]
  isLoading: boolean
}

export function CompanyTrustCard({
  trustIndices,
  isLoading,
}: CompanyTrustCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <h2 className="font-serif text-xl font-bold text-heading tracking-tight">
            Trust Leaderboard
          </h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
          Top {trustIndices.length} companies
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading trust metrics...
          </span>
        </div>
      )}

      {!isLoading && trustIndices.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground/60">
            No trust data available.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        {trustIndices.slice(0, 8).map((row, i) => {
          const tierStyle = TIER_STYLES[row.tier] ?? TIER_STYLES.watch
          const barColor = TIER_BAR[row.tier] ?? TIER_BAR.watch

          return (
            <motion.div
              key={row.companyId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease }}
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-secondary/30 transition-colors group"
            >
              {/* Rank */}
              <span className="text-[11px] font-bold text-muted-foreground/30 w-5 text-end tabular-nums shrink-0">
                {i + 1}
              </span>

              {/* Company info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-heading truncate">
                    {row.companyName}
                  </p>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                      tierStyle.bg,
                      tierStyle.text,
                    )}
                  >
                    {row.tier}
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", barColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(row.trustScore, 100)}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.6 + i * 0.06,
                      ease,
                    }}
                  />
                </div>
              </div>

              {/* Score */}
              <span className="font-serif text-sm font-bold text-heading tabular-nums w-8 text-end shrink-0">
                {row.trustScore}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
