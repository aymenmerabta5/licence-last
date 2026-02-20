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
  excellent: "bg-emerald-600 border-emerald-700 text-white",
  good: "bg-blue-600 border-blue-700 text-white",
  watch: "bg-amber-500 border-amber-600 text-black",
  low: "bg-rose-600 border-rose-700 text-white",
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
      className="space-y-6 flex flex-col h-full bg-foreground border-2 border-foreground p-6 md:p-8 relative group"
    >
      <div className="absolute inset-0 bg-[linear-gradient(oklch(var(--border)_/_0.2)_1px,transparent_1px),linear-gradient(90deg,oklch(var(--border)_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-end justify-between border-b-4 border-background/20 pb-4 relative z-10 w-full shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-background/50 mb-2 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Security Rating
          </span>
          <h2 className="font-serif text-3xl font-normal text-background tracking-tighter line-clamp-1 break-words pb-1">
            Trust Index
          </h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-start relative z-10">
        {indices.slice(0, 5).map((entry, i) => (
          <div
            key={entry.companyId}
            className="flex items-center gap-4 py-4 px-2 border-b border-background/10 hover:bg-background/5 last:border-b-0 transition-colors group/item"
          >
            <span className="font-serif italic text-2xl text-background/30 w-6 group-hover/item:text-primary transition-colors">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2">
              <p className="font-serif text-lg font-normal text-background truncate">
                {entry.companyName ?? "Unknown"}
              </p>
              <span
                className={cn(
                  "text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 border w-fit",
                  TIER_STYLES[entry.tier] ?? TIER_STYLES.watch,
                )}
              >
                {entry.tier}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-[0.2em] text-background/50 font-bold mb-0.5">
                Score
              </span>
              <span className="font-serif text-3xl font-normal text-background tracking-tighter leading-none group-hover/item:text-primary transition-colors">
                {entry.trustScore}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full mt-4 border-t border-background/20 pt-4 group/btn shrink-0">
        <Link
          href="/dashboard/admin/stats"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-background w-full flex items-center justify-between"
        >
          <span>View All Analytics</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-2" />
        </Link>
      </div>
    </motion.div>
  )
}
