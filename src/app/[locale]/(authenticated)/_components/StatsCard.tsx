"use client"

import { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { Card, CardContent } from "@/components/ui/card"
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
      <Card className="p-0 border border-border/40 bg-background hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-md h-full overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  {title}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-serif font-bold text-heading tracking-tight leading-none">
                  {value}
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  {description}
                </p>
              </div>

              {trend && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 w-fit px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <span className="animate-pulse">●</span>
                  <span>{trend}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subtle decoration */}
          <div className="absolute top-0 end-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon className="h-16 w-16" />
          </div>
        </CardContent>

        {/* Border accent */}
        <div className="absolute bottom-0 start-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
      </Card>
    </motion.div>
  )
}
