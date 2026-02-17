"use client"

import * as motion from "motion/react-client"
import {
  CheckCircle2,
  Clock,
  FileStack,
  FolderTree,
  GraduationCap,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
      className="space-y-5"
    >
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          University Snapshot
        </p>
        <h3 className="font-serif text-2xl text-heading tracking-tight">
          Your Institution At A Glance
        </h3>
        <p className="text-sm text-muted-foreground font-light">
          Key indicators for student activity, structure, and validation progress.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
