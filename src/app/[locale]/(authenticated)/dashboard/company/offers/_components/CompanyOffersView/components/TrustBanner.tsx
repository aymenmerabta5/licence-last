"use client"

import { CheckCircle2, Shield, TrendingUp } from "lucide-react"
import type { TrustData } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/types"
import { cn } from "@/lib/utils"

const TIER_COLORS: Record<string, { text: string; bar: string }> = {
  excellent: {
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
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
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
        {/* Trust score */}
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-primary" />
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
              Trust Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-heading leading-none tabular-nums">
                {data.trustScore}
              </span>
              <span className="text-[10px] font-bold text-primary/60">
                /100
              </span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="flex-1 min-w-[120px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                colors.text,
              )}
            >
              {data.tier}
            </span>
          </div>
          <div className="h-1.5 bg-secondary/30 overflow-hidden">
            <div
              className={cn("h-full", colors.bar)}
              style={{ width: `${Math.min(data.trustScore, 100)}%` }}
            />
          </div>
        </div>

        {/* Factors */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[11px]">
              <span className="font-bold text-heading tabular-nums">
                {data.factors.responseRate}%
              </span>{" "}
              response
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[11px]">
              <span className="font-bold text-heading tabular-nums">
                {data.factors.completionRate}%
              </span>{" "}
              completion
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
