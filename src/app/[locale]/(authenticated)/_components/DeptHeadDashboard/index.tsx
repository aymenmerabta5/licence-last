"use client"

import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  GraduationCap,
  Loader2,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { DashboardMasthead } from "@/app/[locale]/(authenticated)/_components/DashboardMasthead"
import { StatsBulletin } from "@/app/[locale]/(authenticated)/_components/StatsBulletin"
import { PendingQueueOverview } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/components/PendingQueueOverview"
import {
  type DeptHeadDashboardInitialData,
  useDeptHeadDashboardData,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadDashboardData"
import { useDeptHeadStats } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadStats"
import type {
  DeptHeadDashboardLabels,
  DeptHeadDashboardProps,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

export function DeptHeadDashboard({
  user,
  initialPendingResult,
}: DeptHeadDashboardProps & DeptHeadDashboardInitialData) {
  void user
  const t = useTranslations("dashboard.deptHeadDashboard")
  const { applications, pendingCount, queueIsBusy, isLoading } =
    useDeptHeadDashboardData({ initialPendingResult })

  const { stats, isLoading: statsLoading } = useDeptHeadStats()

  const labels: DeptHeadDashboardLabels = {
    pendingLabel: t("pendingLabel"),
    queueStatusLabel: t("queueStatusLabel"),
    queueBusy: t("queueBusy"),
    queueClear: t("queueClear"),
    recentTitle: t("recentTitle"),
    empty: t("empty"),
    acceptedOn: t("acceptedOn"),
  }

  const bulletinMetrics = statsLoading
    ? []
    : [
        {
          label: t("stats.totalStudents"),
          value: String(stats.totalStudents),
          sub: t("stats.totalStudentsDescription"),
          icon: Users,
        },
        {
          label: t("stats.pendingValidations"),
          value: String(stats.pendingValidations),
          sub: t("stats.pendingValidationsDescription"),
          icon: ClipboardList,
          highlight: stats.pendingValidations > 0,
        },
        {
          label: t("stats.activeInternships"),
          value: String(stats.activeInternships),
          sub: t("stats.activeInternshipsDescription"),
          icon: Briefcase,
        },
        {
          label: t("stats.studentsWithoutInternship"),
          value: String(stats.studentsWithoutInternship),
          sub: t("stats.studentsWithoutInternshipDescription"),
          icon: GraduationCap,
        },
      ]

  return (
    <div className="space-y-8 sm:space-y-12">
      <DashboardMasthead
        badge={<Badge variant="editorial-muted">{t("kicker")}</Badge>}
        title={t("title")}
        description={t("description")}
        rightSlot={
          pendingCount !== "0" ? (
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg text-heading tabular-nums">
                {pendingCount}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Pending
              </span>
            </div>
          ) : null
        }
        actions={
          <Link
            href={"/dashboard/dept-validations" as "/dashboard"}
            prefetch={false}
          >
            <Button variant="editorial" size="editorial" className="gap-2">
              {t("openQueue")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      {!statsLoading && <StatsBulletin metrics={bulletinMetrics} />}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Loading queue
          </span>
        </div>
      )}

      {!isLoading && (
        <PendingQueueOverview
          applications={applications}
          pendingCount={pendingCount}
          queueIsBusy={queueIsBusy}
          labels={labels}
        />
      )}
    </div>
  )
}
