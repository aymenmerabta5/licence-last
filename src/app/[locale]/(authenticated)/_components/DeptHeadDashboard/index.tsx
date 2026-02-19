"use client"

import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { PendingQueueOverview } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/components/PendingQueueOverview"
import { useDeptHeadDashboardData } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/hooks/useDeptHeadDashboardData"
import type {
  DeptHeadDashboardLabels,
  DeptHeadDashboardProps,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

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

  const now = new Date()

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <div className="relative border-y-4 border-foreground dark:border-foreground/80 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-4 group">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Date Column */}
          <div className="md:col-span-2 flex flex-col justify-start items-start md:border-r border-border md:pr-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/50 mb-4 [[dir=rtl]_&]:tracking-normal">
              {t("kicker")}
            </div>
            <motion.div
              className="font-serif text-3xl md:text-5xl font-normal leading-none text-primary"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {now.getDate().toString().padStart(2, "0")}
            </motion.div>
            <div className="text-xs uppercase font-medium tracking-[0.2em] mt-2 text-foreground/80 [[dir=rtl]_&]:tracking-normal">
              {now.toLocaleString("en-US", { month: "short" })} '
              {now.getFullYear().toString().slice(-2)}
            </div>
            <div className="w-full h-[1px] bg-border my-6 hidden md:block" />
            <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-1.5 hidden md:flex">
              <Sparkles className="h-3.5 w-3.5" /> Department Status
            </div>
          </div>

          {/* Main Headings */}
          <div className="md:col-span-6 flex flex-col justify-center px-0 md:px-6">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-tighter text-foreground mb-6">
              <span className="hover:text-primary transition-colors duration-500 selection:bg-primary selection:text-white block">
                {t("title")}
              </span>
            </h2>
            <p className="text-foreground/70 text-sm md:text-base font-light leading-relaxed max-w-lg mb-8 md:mb-0">
              {t("description")}
            </p>
          </div>

          {/* Actions */}
          <div className="md:col-span-4 flex flex-col justify-end md:pl-6 md:border-l border-border group/meter h-full pb-2">
            <Link
              href={"/dashboard/dept-validations" as "/dashboard"}
              className="w-full"
            >
              <Button className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-[0.1em] text-xs h-14 rounded-none transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_oklch(var(--primary))]">
                {t("openQueue")}
                <ArrowRight className="h-4 w-4 ms-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 min-h-[40vh]">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 border-2 border-foreground animate-ping opacity-20" />
          </div>
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
