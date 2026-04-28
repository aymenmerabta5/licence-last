"use client"

import type { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface StatItem {
  title: string
  value: string
  description: string
  icon: LucideIcon
}

interface ProfileStatsProps {
  stats: StatItem[]
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-8"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const isHighlight = stat.value.includes("%")
        const percentage = isHighlight ? parseInt(stat.value, 10) : 0

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease }}
            className="group relative"
          >
            <div
              className={cn(
                "relative h-full rounded-[2.5rem] border border-slate-100 bg-white p-10 transition-all duration-500",
                "hover:border-primary/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] hover:-translate-y-1",
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 group-hover:text-primary transition-colors">
                  {stat.title}
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-500">
                  {stat.value}
                </div>

                {isHighlight ? (
                  <div className="space-y-4 pt-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5,
                          ease: "circOut",
                        }}
                        className="h-full bg-primary rounded-full shadow-[0_4px_10px_rgba(var(--primary-rgb),0.2)]"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest">
                      {stat.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-400 font-medium leading-relaxed italic">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
