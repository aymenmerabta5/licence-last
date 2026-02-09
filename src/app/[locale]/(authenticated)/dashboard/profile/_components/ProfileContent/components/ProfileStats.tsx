import type { LucideIcon } from "lucide-react"

import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <StatsCard key={i} index={i} {...stat} />
      ))}
    </div>
  )
}
