"use client"

import { Shield } from "lucide-react"
import * as motion from "motion/react-client"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface TrustData {
  trustScore: number
  tier: "low" | "watch" | "good" | "excellent"
  factors: {
    responseRate: number
    completionRate: number
    feedbackScore: number
    reportPenalty: number
  }
}

const TIER_CONFIG = {
  excellent: {
    label: "Excellent",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    bar: "bg-emerald-500",
  },
  good: {
    label: "Good",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    bar: "bg-blue-500",
  },
  watch: {
    label: "Needs Improvement",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    bar: "bg-amber-500",
  },
  low: {
    label: "At Risk",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    bar: "bg-rose-500",
  },
}

interface TrustGaugeProps {
  trustData: TrustData | null
  isLoading: boolean
}

export function TrustGauge({ trustData, isLoading }: TrustGaugeProps) {
  if (isLoading || !trustData) return null

  const config = TIER_CONFIG[trustData.tier]
  const factors = [
    { label: "Response", value: trustData.factors.responseRate },
    { label: "Completion", value: trustData.factors.completionRate },
    { label: "Feedback", value: trustData.factors.feedbackScore },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease }}
      className="border border-border/40 p-5 space-y-5"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
          Trust Index
        </span>
      </div>

      {/* Score + tier */}
      <div className="flex items-end gap-3">
        <span className="font-serif text-5xl font-bold text-heading leading-none tracking-tight tabular-nums">
          {trustData.trustScore}
        </span>
        <div className="pb-1.5">
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5",
              config.bg,
              config.color,
            )}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-secondary/30 overflow-hidden">
        <motion.div
          className={cn("h-full", config.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(trustData.trustScore, 100)}%` }}
          transition={{ duration: 1, delay: 0.5, ease }}
        />
      </div>

      {/* Factor breakdown */}
      <div className="border-t border-border/30 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {factors.map((factor) => (
            <div key={factor.label} className="text-center space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
                {factor.label}
              </p>
              <p className="font-serif text-lg font-bold text-heading leading-none tabular-nums">
                {Math.round(factor.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {trustData.factors.reportPenalty > 0 && (
        <p className="text-[10px] text-rose-500 font-medium border-t border-border/30 pt-3">
          -{Math.round(trustData.factors.reportPenalty)} penalty from open
          reports
        </p>
      )}
    </motion.div>
  )
}
