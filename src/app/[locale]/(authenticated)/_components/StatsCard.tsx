"use client"

import { LucideIcon } from "lucide-react"
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
}: {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: string
  index: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("h-full", className)}
    >
      <div className="h-full border border-border/80 bg-background hover:bg-foreground hover:text-background p-6 transition-all duration-500 shadow-[4px_4px_0_0_oklch(var(--border)_/_0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] relative overflow-hidden group">
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxwYXRoIGQ9Ik0wLDRMMSw0TDEsM0wwLDNaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-[0.03] mix-blend-overlay pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-start justify-between mb-8">
            <span className="text-[10px] font-bold text-foreground/50 group-hover:text-background/70 uppercase tracking-[0.15em] w-3/4">
              {title}
            </span>
            <Icon className="h-5 w-5 text-primary group-hover:text-background/90" />
          </div>

          <div className="space-y-4 flex-grow flex flex-col justify-end">
            <div className="flex flex-col">
              <h3 className="text-4xl lg:text-5xl font-serif font-normal text-foreground group-hover:text-background tracking-tighter leading-none mb-3 line-clamp-1">
                {value}
              </h3>
              <p className="text-[11px] text-foreground/60 group-hover:text-background/70 font-medium leading-tight h-8">
                {description}
              </p>
            </div>

            {trend && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary bg-primary/10 group-hover:bg-background/20 group-hover:text-background w-fit px-2.5 py-1 uppercase tracking-widest mt-2 border border-primary/20 group-hover:border-background/30 rounded-none">
                <span className="animate-pulse">●</span>
                <span>{trend}</span>
              </div>
            )}

            {/* Visual bottom divider matching the theme */}
            <div className="h-px w-full bg-border group-hover:bg-background/20 mt-4 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
