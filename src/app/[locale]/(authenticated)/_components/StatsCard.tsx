"use client"

import type { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { cn } from "@/lib/utils"

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  index,
  className,
  compact = false,
}: {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: string
  index: number
  className?: string
  compact?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("h-full", className)}
    >
      <div
        className={cn(
          "h-full border border-border/80 bg-background hover:bg-foreground hover:text-background transition-all duration-500 shadow-[4px_4px_0_0_oklch(var(--border)_/_0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] relative overflow-hidden group",
          compact ? "p-4 sm:p-5 lg:p-6" : "p-6",
        )}
      >
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxwYXRoIGQ9Ik0wLDRMMSw0TDEsM0wwLDNaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-[0.03] mix-blend-overlay pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div
            className={cn(
              "flex items-start justify-between",
              compact ? "mb-5 sm:mb-6" : "mb-8",
            )}
          >
            <span
              className={cn(
                "font-bold text-foreground/50 group-hover:text-background/70 uppercase w-3/4 [[dir=rtl]_&]:tracking-normal",
                compact
                  ? "text-[9px] sm:text-[10px] tracking-[0.12em]"
                  : "text-[10px] tracking-[0.15em]",
              )}
            >
              {title}
            </span>
            <Icon
              className={cn(
                "text-primary group-hover:text-background/90 shrink-0",
                compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5",
              )}
            />
          </div>

          <div
            className={cn(
              "flex-grow flex flex-col justify-end",
              compact ? "space-y-3 sm:space-y-4" : "space-y-4",
            )}
          >
            <div className="flex flex-col">
              <h3
                className={cn(
                  "font-serif font-normal text-foreground group-hover:text-background tracking-tighter leading-none line-clamp-1",
                  compact
                    ? "text-3xl sm:text-4xl lg:text-5xl mb-2"
                    : "text-4xl lg:text-5xl mb-3",
                )}
              >
                {value}
              </h3>
              <p
                className={cn(
                  "text-foreground/60 group-hover:text-background/70 font-medium leading-tight",
                  compact
                    ? "text-[10px] sm:text-[11px] min-h-8 line-clamp-2"
                    : "text-[11px] h-8",
                )}
              >
                {description}
              </p>
            </div>

            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1.5 font-bold text-primary bg-primary/10 group-hover:bg-background/20 group-hover:text-background w-fit uppercase border border-primary/20 group-hover:border-background/30 rounded-none",
                  compact
                    ? "text-[8px] sm:text-[9px] px-2 py-1 tracking-[0.15em]"
                    : "text-[9px] px-2.5 py-1 tracking-widest mt-2",
                )}
              >
                <span className="animate-pulse">●</span>
                <span>{trend}</span>
              </div>
            )}

            {/* Visual bottom divider matching the theme */}
            <div
              className={cn(
                "h-px w-full bg-border group-hover:bg-background/20 transition-colors",
                compact ? "mt-2 sm:mt-3" : "mt-4",
              )}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
