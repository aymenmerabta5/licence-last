"use client"

import * as motion from "motion/react-client"
import { Shield, TrendingUp, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"

import type { TrustData } from "../types"

const TIER_COLORS: Record<string, { text: string; bar: string }> = {
  excellent: { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  good: { text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" },
  watch: { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
  low: { text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500" },
}

interface TrustBannerProps {
  data: TrustData
}

export function TrustBanner({ data }: TrustBannerProps) {
  const colors = TIER_COLORS[data.tier] ?? TIER_COLORS.good

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.08 }}
      className="border border-border/50 border-s-4 border-s-primary/30 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
        {/* Trust score */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/5">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
              Trust Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-heading leading-none tabular-nums">
                {data.trustScore}
              </span>
              <span className="text-[10px] font-bold text-primary/60">/100</span>
            </div>
          </div>
        </div>

        {/* Animated bar */}
        <div className="flex-1 min-w-[120px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", colors.text)}>
              {data.tier}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary/30 overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", colors.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(data.trustScore, 100)}%` }}
              transition={{ duration: 1, delay: 0.3, ease }}
            />
          </div>
        </div>

        {/* Factors */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[11px]">
              <span className="font-bold text-heading tabular-nums">{data.factors.responseRate}%</span>{" "}
              response
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[11px]">
              <span className="font-bold text-heading tabular-nums">{data.factors.completionRate}%</span>{" "}
              completion
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
