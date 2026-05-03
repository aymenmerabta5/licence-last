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
import { ease, reveal } from "@/lib/animations"

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
      {...reveal}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="space-y-5 sm:space-y-8"
    >
      <div className="flex flex-col justify-between gap-3 border-b-4 border-foreground pb-3 sm:flex-row sm:items-end sm:gap-4 sm:pb-4">
        <div>
          <span className="mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-primary/70">
            University Snapshot
          </span>
          <h2 className="font-serif text-[clamp(1.8rem,8vw,3rem)] font-normal tracking-tighter text-foreground">
            Your Institution At A Glance
            <span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
        <p className="max-w-xs text-[10px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.1em] text-foreground/50 sm:text-end">
          Key indicators for student activity, structure, and validation
          progress
        </p>
      </div>

      <div
        data-testid="university-kpi-grid"
        className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
      >
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
            compact
            className={
              index === cards.length - 1 && cards.length % 2 !== 0
                ? "col-span-2 lg:col-span-1"
                : undefined
            }
          />
        ))}
      </div>
    </motion.section>
  )
}
