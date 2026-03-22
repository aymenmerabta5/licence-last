"use client"

import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  Clock,
  FileStack,
  FolderTree,
  GraduationCap,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import * as motion from "motion/react-client"

import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"
import { ease } from "@/lib/animations"

interface UniversityKpiGridProps {
  stats: {
    totalStudents: number
    totalDepartments: number
    totalDeptHeads: number
    totalApplications: number
    pendingValidations: number
    validatedPlacements: number
    placementRate: number
  }
}

export function UniversityKpiGrid({ stats }: UniversityKpiGridProps) {
  const cards: Array<{
    title: string
    value: string
    description: string
    icon: LucideIcon
    trend?: string
  }> = [
    {
      title: "Students",
      value: String(stats.totalStudents),
      description: "Registered in your university",
      icon: GraduationCap,
    },
    {
      title: "Departments",
      value: String(stats.totalDepartments),
      description: "Active departments",
      icon: FolderTree,
    },
    {
      title: "Department Heads",
      value: String(stats.totalDeptHeads),
      description: "Assigned leaders",
      icon: UsersRound,
    },
    {
      title: "Applications",
      value: String(stats.totalApplications),
      description: "Submitted by your students",
      icon: FileStack,
    },
    {
      title: "Pending Validations",
      value: String(stats.pendingValidations),
      description: "Awaiting admin review",
      icon: Clock,
      trend: stats.pendingValidations > 0 ? "Needs review" : "Up to date",
    },
    {
      title: "Validated Placements",
      value: String(stats.validatedPlacements),
      description: "Approved placements",
      icon: CheckCircle2,
    },
    {
      title: "Placement Rate",
      value: `${stats.placementRate}%`,
      description: "Validated vs total students",
      icon: TrendingUp,
      trend: stats.placementRate >= 50 ? "Healthy" : undefined,
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-4 border-foreground pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            University Snapshot
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tighter text-foreground">
            Your Institution At A Glance
            <span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground/50 max-w-xs sm:text-end mt-4 sm:mt-0">
          Key indicators for student activity, structure, and validation
          progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
        <div className="absolute inset-x-0 -inset-y-6 -z-10 bg-[url('data:image/svg+xml;base64,...')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

        {cards.map((card, index) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            trend={card.trend}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  )
}
