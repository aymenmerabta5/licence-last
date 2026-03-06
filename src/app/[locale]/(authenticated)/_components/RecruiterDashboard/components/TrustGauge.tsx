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
    color: "text-emerald-400 bg-emerald-900 border-emerald-800",
    bar: "bg-emerald-500",
  },
  good: {
    label: "Good",
    color: "text-blue-400 bg-blue-900 border-blue-800",
    bar: "bg-blue-500",
  },
  watch: {
    label: "Needs Improvement",
    color: "text-amber-400 bg-amber-900 border-amber-800",
    bar: "bg-amber-500",
  },
  low: {
    label: "At Risk",
    color: "text-rose-400 bg-rose-900 border-rose-800",
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
      className="space-y-6 flex flex-col h-full bg-foreground border-2 border-foreground p-6 md:p-8 relative group"
    >
      <div className="absolute inset-0 bg-[linear-gradient(oklch(var(--border)_/_0.2)_1px,transparent_1px),linear-gradient(90deg,oklch(var(--border)_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-end justify-between border-b-4 border-background/20 pb-4 relative z-10 w-full shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Performance
          </span>
          <h2 className="font-serif text-3xl font-normal text-background tracking-tighter line-clamp-1 break-words pb-1">
            Trust Gauge
          </h2>
        </div>
      </div>

      <div className="relative z-10 mt-4 mb-2">
        {/* Score + tier */}
        <div className="flex items-end gap-4 mb-6">
          <span className="font-serif text-[4.5rem] font-normal text-background leading-[0.8] tracking-tighter tabular-nums">
            {trustData.trustScore}
          </span>
          <div className="pb-1">
            <span
              className={cn(
                "text-[8px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border",
                config.color,
              )}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-1.5 bg-background/20 overflow-hidden relative border border-background/10">
          <motion.div
            className={cn("h-full absolute start-0 top-0", config.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(trustData.trustScore, 100)}%` }}
            transition={{ duration: 1, delay: 0.5, ease }}
          />
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="border border-background/20 bg-background/5 relative z-10 mt-auto">
        <div className="grid grid-cols-3 divide-x divide-background/20">
          {factors.map((factor) => (
            <div key={factor.label} className="text-center p-4">
              <p className="font-serif text-2xl font-normal text-background leading-none tabular-nums mb-2">
                {Math.round(factor.value)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-background/50 [[dir=rtl]_&]:tracking-normal">
                {factor.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {trustData.factors.reportPenalty > 0 && (
        <p className="text-[10px] text-rose-400 font-medium border-t border-background/20 pt-3 relative z-10 mt-2">
          -{Math.round(trustData.factors.reportPenalty)} penalty from open
          reports
        </p>
      )}
    </motion.div>
  )
}
