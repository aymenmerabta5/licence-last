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
    color: "bg-blue-600",
    bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  company_accepted: {
    label: "Accepted",
    color: "bg-emerald-600",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  admin_validated: {
    label: "Validated",
    color: "bg-primary",
    bgClass: "bg-primary/10 text-primary",
  },
  company_refused: {
    label: "Refused",
    color: "bg-rose-500",
    bgClass: "bg-rose-500/10 text-rose-500",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "bg-zinc-500",
    bgClass: "bg-zinc-400/10 text-zinc-500",
  },
  admin_rejected: {
    label: "Rejected",
    color: "bg-orange-500",
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
      <div className="text-center py-20 border-2 border-dashed border-border/80 bg-background flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxwYXRoIGQ9Ik0wLDRMMSw0TDEsM0wwLDNaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <h3 className="font-serif text-2xl text-foreground mb-3 relative z-10">
          Application Flow
        </h3>
        <p className="text-xs text-foreground/50 font-medium max-w-sm relative z-10">
          No records found yet.
        </p>
      </div>
    )
  }

  const entries = Object.entries(applicationsByStatus)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease }}
      className="space-y-8 relative z-10"
    >
      <div className="flex items-end justify-between border-b-4 border-foreground pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            System Insights
          </span>
          <h2 className="font-serif text-3xl font-normal text-foreground tracking-tighter">
            Application Flow
            <span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-1">
          {totalApplications.toLocaleString()} total
        </span>
      </div>

      {/* Chunky Proportional bar matching editorial style */}
      <div className="flex h-6 w-full border border-foreground/30 bg-background overflow-hidden relative shadow-[4px_4px_0_0_oklch(var(--border)_/_0.2)]">
        {entries.map(([status, count], i) => {
          const config = STATUS_CONFIG[status]
          const pct = (count / totalApplications) * 100
          return (
            <motion.div
              key={status}
              className={cn(
                "h-full relative overflow-hidden",
                config?.color ?? "bg-foreground",
                i !== entries.length - 1 && "border-r border-background",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease }}
              title={`${config?.label ?? status}: ${count}`}
            >
              {/* Tiny texture on each segment */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64...')] opacity-[0.1] mix-blend-overlay pointer-events-none" />
            </motion.div>
          )
        })}
      </div>

      {/* Editorial Legend List */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
        {entries.map(([status, count]) => {
          const config = STATUS_CONFIG[status]
          return (
            <div
              key={status}
              className="flex flex-col group py-2 border-t border-border/40 hover:border-foreground transition-colors duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-none",
                    config?.color ?? "bg-foreground",
                  )}
                />
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-foreground/60 transition-colors group-hover:text-foreground">
                  {config?.label ?? status}
                </span>
              </div>
              <span className="font-serif text-3xl font-normal text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors duration-300">
                {count.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
