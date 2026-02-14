"use client"

import * as motion from "motion/react-client"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgClass: string }
> = {
  applied: {
    label: "Applied",
    color: "bg-blue-500",
    bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  company_accepted: {
    label: "Accepted",
    color: "bg-emerald-500",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  admin_validated: {
    label: "Validated",
    color: "bg-primary",
    bgClass: "bg-primary/10 text-primary",
  },
  company_refused: {
    label: "Refused",
    color: "bg-rose-400",
    bgClass: "bg-rose-500/10 text-rose-500",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "bg-zinc-400",
    bgClass: "bg-zinc-400/10 text-zinc-500",
  },
  admin_rejected: {
    label: "Rejected",
    color: "bg-orange-400",
    bgClass: "bg-orange-400/10 text-orange-500",
  },
}

interface StatusBreakdownProps {
  applicationsByStatus: Record<string, number>
  totalApplications: number
}

export function StatusBreakdown({
  applicationsByStatus,
  totalApplications,
}: StatusBreakdownProps) {
  if (totalApplications === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground/40 text-sm">
        No applications recorded yet.
      </div>
    )
  }

  // Sort by count descending
  const entries = Object.entries(applicationsByStatus)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-heading tracking-tight">
          Application Flow
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
          {totalApplications.toLocaleString()} total
        </span>
      </div>

      {/* Proportional bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-secondary/30">
        {entries.map(([status, count], i) => {
          const config = STATUS_CONFIG[status]
          const pct = (count / totalApplications) * 100
          return (
            <motion.div
              key={status}
              className={cn(
                "h-full",
                config?.color ?? "bg-zinc-300",
                i === 0 && "rounded-s-full",
                i === entries.length - 1 && "rounded-e-full",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease }}
              title={`${config?.label ?? status}: ${count}`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {entries.map(([status, count]) => {
          const config = STATUS_CONFIG[status]
          return (
            <div key={status} className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  config?.color ?? "bg-zinc-300",
                )}
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {config?.label ?? status}
              </span>
              <span className="text-[11px] font-bold text-heading">
                {count.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
