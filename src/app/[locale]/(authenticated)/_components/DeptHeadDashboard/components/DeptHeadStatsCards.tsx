"use client"

import type { LucideIcon } from "lucide-react"
import { Briefcase, ClipboardList, GraduationCap, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"
import type { DeptHeadStats } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadStats"
import { Link } from "@/i18n/routing"

interface DeptHeadStatsCardsProps {
  stats: DeptHeadStats
}

interface StatCardItem {
  labelKey: string
  descriptionKey: string
  value: number
  icon: LucideIcon
  href?: string
}

export function DeptHeadStatsCards({ stats }: DeptHeadStatsCardsProps) {
  const t = useTranslations("dashboard.deptHeadDashboard")

  const cards: StatCardItem[] = [
    {
      labelKey: t("stats.totalStudents"),
      descriptionKey: t("stats.totalStudentsDescription"),
      value: stats.totalStudents,
      icon: Users,
    },
    {
      labelKey: t("stats.pendingValidations"),
      descriptionKey: t("stats.pendingValidationsDescription"),
      value: stats.pendingValidations,
      icon: ClipboardList,
      href: "/dashboard/dept-validations",
    },
    {
      labelKey: t("stats.activeInternships"),
      descriptionKey: t("stats.activeInternshipsDescription"),
      value: stats.activeInternships,
      icon: Briefcase,
    },
    {
      labelKey: t("stats.studentsWithoutInternship"),
      descriptionKey: t("stats.studentsWithoutInternshipDescription"),
      value: stats.studentsWithoutInternship,
      icon: GraduationCap,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) =>
        card.href ? (
          <Link key={card.labelKey} href={card.href} className="group block h-full">
            <StatsCard
              title={card.labelKey}
              value={String(card.value)}
              description={card.descriptionKey}
              icon={card.icon}
              index={index}
              compact
            />
          </Link>
        ) : (
          <div key={card.labelKey} className="block h-full">
            <StatsCard
              title={card.labelKey}
              value={String(card.value)}
              description={card.descriptionKey}
              icon={card.icon}
              index={index}
              compact
            />
          </div>
        ),
      )}
    </div>
  )
}
