"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { PendingQueueOverview } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/components/PendingQueueOverview"
import {
  useDeptHeadDashboardData,
  type DeptHeadDashboardInitialData,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadDashboardData"
import type {
  DeptHeadDashboardLabels,
  DeptHeadDashboardProps,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function DeptHeadDashboard({
  user,
  initialPendingResult,
}: DeptHeadDashboardProps & DeptHeadDashboardInitialData) {
  void user
  const t = useTranslations("dashboard.deptHeadDashboard")
  const { applications, pendingCount, queueIsBusy, isLoading } =
    useDeptHeadDashboardData({ initialPendingResult })

  const labels: DeptHeadDashboardLabels = {
    pendingLabel: t("pendingLabel"),
    queueStatusLabel: t("queueStatusLabel"),
    queueBusy: t("queueBusy"),
    queueClear: t("queueClear"),
    recentTitle: t("recentTitle"),
    empty: t("empty"),
    acceptedOn: t("acceptedOn"),
  }

  const now = new Date()

  return (
    <div className="space-y-10">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease }}
          className="h-0.5 bg-primary"
        />

        <div className="space-y-3">
          <motion.div {...reveal} transition={revealWithDelay(0.05)}>
            <Badge variant="editorial-muted">{t("kicker")}</Badge>
          </motion.div>

          <motion.div
            {...reveal}
            transition={revealWithDelay(0.1)}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-3">
              <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight text-heading max-w-2xl">
                {t("title")}
              </h1>
              <p className="text-sm font-light text-muted-foreground max-w-lg">
                {t("description")}
              </p>
            </div>

            <motion.div
              {...reveal}
              transition={revealWithDelay(0.15)}
              className="shrink-0 border-s border-border/40 ps-6 hidden md:flex flex-col gap-4"
            >
              <div className="text-end space-y-1">
                <span className="font-serif text-3xl text-primary leading-none block">
                  {now.getDate().toString().padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block">
                  {now.toLocaleString("en-US", { month: "short" })} '
                  {now.getFullYear().toString().slice(-2)}
                </span>
              </div>

              {pendingCount !== "0" && (
                <>
                  <div className="h-px bg-border/40" />
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-heading tabular-nums">
                      {pendingCount}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      Pending
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.2)}
            className="pt-2"
          >
            <Link
              href={"/dashboard/dept-validations" as "/dashboard"}
              prefetch={false}
            >
              <Button variant="editorial" size="editorial" className="gap-2">
                {t("openQueue")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

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
