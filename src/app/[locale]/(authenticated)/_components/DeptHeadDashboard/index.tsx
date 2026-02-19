"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

import { PendingQueueOverview } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/components/PendingQueueOverview"
import { useDeptHeadDashboardData } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadDashboardData"
import type {
  DeptHeadDashboardLabels,
  DeptHeadDashboardProps,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"

export function DeptHeadDashboard({ user }: DeptHeadDashboardProps) {
  void user
  const t = useTranslations("dashboard.deptHeadDashboard")
  const { applications, pendingCount, queueIsBusy, isLoading } =
    useDeptHeadDashboardData()

  const labels: DeptHeadDashboardLabels = {
    pendingLabel: t("pendingLabel"),
    queueStatusLabel: t("queueStatusLabel"),
    queueBusy: t("queueBusy"),
    queueClear: t("queueClear"),
    recentTitle: t("recentTitle"),
    empty: t("empty"),
    acceptedOn: t("acceptedOn"),
  }

  return (
    <div className="space-y-8">
      <motion.section
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-4 border border-border/50 p-7"
      >
        <span className="inline-flex text-[10px] font-bold uppercase tracking-[0.2em] text-primary [[dir=rtl]_&]:tracking-normal">
          {t("kicker")}
        </span>
        <h2 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-heading">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        <Link
          href={"/dashboard/dept-validations" as "/dashboard"}
          className="inline-flex"
        >
          <Button variant="editorial" size="editorial-sm" className="rounded-lg">
            {t("openQueue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.section>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
