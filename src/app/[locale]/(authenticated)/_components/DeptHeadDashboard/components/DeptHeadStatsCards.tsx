"use client"

import { Briefcase, ClipboardList, GraduationCap, Users } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { DeptHeadStats } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadStats"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface DeptHeadStatsCardsProps {
  stats: DeptHeadStats
}

interface StatCard {
  labelKey: string
  value: number
  icon: React.ElementType
  href?: string
}

export function DeptHeadStatsCards({ stats }: DeptHeadStatsCardsProps) {
  const t = useTranslations("dashboard.deptHeadDashboard")

  const cards: StatCard[] = [
    {
      labelKey: "stats.totalStudents",
      value: stats.totalStudents,
      icon: Users,
    },
    {
      labelKey: "stats.pendingValidations",
      value: stats.pendingValidations,
      icon: ClipboardList,
      href: "/dashboard/dept-validations",
    },
    {
      labelKey: "stats.activeInternships",
      value: stats.activeInternships,
      icon: Briefcase,
    },
    {
      labelKey: "stats.studentsWithoutInternship",
      value: stats.studentsWithoutInternship,
      icon: GraduationCap,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const cardBody = (
          <div className="rounded-none border border-border/60 bg-background p-5 transition-colors hover:border-border">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {t(card.labelKey)}
                </span>
                <span className="font-serif text-3xl text-heading tabular-nums block leading-none mt-2">
                  {card.value}
                </span>
              </div>
              <card.icon className="size-5 text-muted-foreground" />
            </div>

            {card.href && (
              <div className="mt-4 pt-3 border-t border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary group-hover:underline">
                  {t("stats.view")} &rarr;
                </span>
              </div>
            )}
          </div>
        )

        return (
          <motion.div
            key={card.labelKey}
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.05 * index }}
          >
            {card.href ? (
              <Link href={card.href} className="group block">
                {cardBody}
              </Link>
            ) : (
              <div className="block">{cardBody}</div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
