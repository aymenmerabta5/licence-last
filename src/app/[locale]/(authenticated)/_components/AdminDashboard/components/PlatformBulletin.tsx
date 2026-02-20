"use client"

import {
  Briefcase,
  Building2,
  FileStack,
  GraduationCap,
  TrendingUp,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"

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
      {...reveal}
      transition={revealWithDelay(0.3)}
      className="grid grid-cols-2 lg:grid-cols-5 bg-background border border-border/80 shadow-[4px_4px_0_0_oklch(var(--border))]"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon

        return (
          <div
            key={metric.label}
            className={cn(
              "relative px-4 py-8 md:px-6 md:py-10 text-center sm:text-left flex flex-col justify-between group overflow-hidden border-border/50 transition-colors duration-500",
              "hover:bg-foreground hover:text-background",
              index < metrics.length - 1 && "border-r",
              index < metrics.length - 1 &&
                index % 2 === 1 &&
                "max-lg:border-none",
              "border-b lg:border-b-0",
              index >= metrics.length - 2 && "max-lg:border-b-0",
              index === 4 && "col-span-2 lg:col-span-1", // Make last item span 2 cols on small screens to fill grid
            )}
          >
            {/* Hover decorative element */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 translate-x-4 -translate-y-4 rounded-full group-hover:scale-[15] transition-transform duration-700 ease-in-out origin-center pointer-events-none" />

            <div className="relative z-10 mb-6 md:mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-0 justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 group-hover:text-background/70 [[dir=rtl]_&]:tracking-normal">
                {metric.label}
              </span>
              <Icon
                className={cn(
                  "h-4 w-4",
                  metric.highlight
                    ? "text-primary group-hover:text-primary-foreground group-hover:animate-pulse"
                    : "text-foreground group-hover:text-background/80",
                )}
              />
            </div>

            <div className="relative z-10 space-y-1 sm:space-y-2 mt-auto">
              <h3
                className={cn(
                  "font-serif text-[clamp(2rem,4vw,3.5rem)] font-normal leading-none tracking-tighter",
                  metric.highlight ? "text-primary" : "text-foreground",
                  "group-hover:text-background",
                )}
              >
                {metric.value}
              </h3>
              <p className="text-[10px] sm:text-xs font-medium text-foreground/40 group-hover:text-background/60 w-full line-clamp-2">
                {metric.sub}
              </p>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
