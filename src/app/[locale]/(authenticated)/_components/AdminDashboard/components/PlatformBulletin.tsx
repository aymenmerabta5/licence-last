"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import {
  GraduationCap,
  TrendingUp,
  Building2,
  Briefcase,
  FileStack,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"

interface PlatformBulletinProps {
  stats: {
    totalStudents: number
    placedStudents: number
    placementRate: number
    totalCompaniesApproved: number
    totalOffersPublished: number
    totalApplications: number
  }
}

export function PlatformBulletin({ stats }: PlatformBulletinProps) {
  const t = useTranslations("dashboard.admin")

  const metrics = [
    {
      label: "Students",
      value: stats.totalStudents.toLocaleString(),
      sub: `${stats.placedStudents} placed`,
      icon: GraduationCap,
    },
    {
      label: "Placement Rate",
      value: `${stats.placementRate}%`,
      sub: `${stats.totalStudents - stats.placedStudents} unplaced`,
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: "Companies",
      value: stats.totalCompaniesApproved.toLocaleString(),
      sub: "Approved",
      icon: Building2,
    },
    {
      label: "Offers",
      value: stats.totalOffersPublished.toLocaleString(),
      sub: "Published",
      icon: Briefcase,
    },
    {
      label: "Applications",
      value: stats.totalApplications.toLocaleString(),
      sub: t("stats.totalPlacements"),
      icon: FileStack,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="border-y-2 border-foreground dark:border-foreground/15"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric, i) => {
          const Icon = metric.icon
          return (
            <div
              key={i}
              className={cn(
                "py-7 px-5 text-center relative group/metric transition-colors",
                "hover:bg-primary/[0.02]",
                i < metrics.length - 1 &&
                  "border-e border-border/40",
                // Hide last item on mobile, show 3rd on sm
                i === 4 && "hidden lg:block",
                i === 2 && "hidden sm:block",
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                  {metric.label}
                </span>
              </div>
              <h3
                className={cn(
                  "font-serif text-4xl font-bold leading-none tracking-tight",
                  metric.highlight ? "text-primary" : "text-heading",
                )}
              >
                {metric.value}
              </h3>
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-2">
                {metric.sub}
              </p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
