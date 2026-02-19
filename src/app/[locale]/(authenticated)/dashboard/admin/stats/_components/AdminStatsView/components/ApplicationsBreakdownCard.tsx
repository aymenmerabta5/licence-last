"use client"

import { BarChart3 } from "lucide-react"
import * as motion from "motion/react-client"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-500",
  company_accepted: "bg-emerald-500",
  admin_validated: "bg-primary",
  company_refused: "bg-rose-400",
  withdrawn: "bg-zinc-400",
  admin_rejected: "bg-orange-400",
}

const STATUS_DOT_COLORS: Record<string, string> = {
  applied: "bg-blue-500",
  company_accepted: "bg-emerald-500",
  admin_validated: "bg-primary",
  company_refused: "bg-rose-400",
  withdrawn: "bg-zinc-400",
  admin_rejected: "bg-orange-400",
}

interface ApplicationsBreakdownCardProps {
  applicationsByStatus: Record<string, number>
}

export function ApplicationsBreakdownCard({
  applicationsByStatus,
}: ApplicationsBreakdownCardProps) {
  const entries = Object.entries(applicationsByStatus).sort(
    (a, b) => b[1] - a[1],
  )
  const totalApplications = entries.reduce((sum, [, count]) => sum + count, 0)

  if (totalApplications === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <h2 className="font-serif text-xl font-bold text-heading tracking-tight">
            Application Flow
          </h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
          {totalApplications.toLocaleString()} total
        </span>
      </div>

      {/* Proportional bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-secondary/30">
        {entries.map(([status, count], i) => (
          <motion.div
            key={status}
            className={cn(
              "h-full",
              STATUS_COLORS[status] ?? "bg-zinc-300",
              i === 0 && "rounded-s-full",
              i === entries.length - 1 && "rounded-e-full",
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${(count / totalApplications) * 100}%`,
            }}
            transition={{
              duration: 0.8,
              delay: 0.5 + i * 0.08,
              ease,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2.5">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                STATUS_DOT_COLORS[status] ?? "bg-zinc-300",
              )}
            />
            <span className="text-[11px] font-medium text-muted-foreground capitalize">
              {status.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] font-bold text-heading tabular-nums">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Grid breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-border/40">
        {entries.map(([status, count], i) => (
          <motion.div
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.05, duration: 0.4, ease }}
            className={cn(
              "py-5 px-4 text-center transition-colors hover:bg-primary/[0.02]",
              i < entries.length - 1 && "border-e border-border/40",
            )}
          >
            <p className="font-serif text-2xl font-bold text-heading leading-none">
              {count}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 mt-2 [[dir=rtl]_&]:tracking-normal">
              {status.replace(/_/g, " ")}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
