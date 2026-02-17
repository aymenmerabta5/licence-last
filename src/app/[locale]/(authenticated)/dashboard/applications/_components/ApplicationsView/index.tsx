"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Loader2, Search } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { reveal, ease } from "@/lib/animations"
import { STAGE_COLUMNS, STAGE_LABELS } from "@/lib/constants/pipeline"

import { useApplications } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView/hooks/useApplications"
import { ApplicationCard } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView/components/ApplicationCard"
import { TimelineModal } from "@/components/TimelineModal"

export function ApplicationsView() {
  const t = useTranslations("dashboard.applications")
  const {
    applications,
    isLoading,
    isFetchingNextPage,
    groupedByStage,
    sentinelRef,
    withdrawingId,
    handleWithdraw,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData,
    isTimelineLoading,
  } = useApplications()

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          {t("title")} - Pipeline
        </h1>
        <p className="text-sm text-muted-foreground font-light mt-1">
          {t("subtitle")}
        </p>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <Link href={"/dashboard/explore" as "/dashboard"}>
            <Button variant="editorial" size="editorial" className="gap-2">
              <Search className="h-4 w-4" />
              {t("exploreOffers")}
            </Button>
          </Link>
        </motion.div>
      )}

      {applications.length > 0 && (
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 min-w-[1120px]">
            {STAGE_COLUMNS.map((stage) => {
              const stageApps = groupedByStage.get(stage) ?? []
              return (
                <section
                  key={stage}
                  className="border border-border bg-secondary/10 p-3 space-y-3 min-h-[380px]"
                >
                  <header className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-heading">
                      {STAGE_LABELS[stage]}
                    </h2>
                    <span className="text-[10px] text-muted-foreground">
                      {stageApps.length}
                    </span>
                  </header>
                  <div className="space-y-2">
                    {stageApps.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        No applications
                      </p>
                    )}
                    {stageApps.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        isWithdrawing={withdrawingId === app.id}
                        onWithdraw={() =>
                          handleWithdraw(app.id, t("withdrawConfirm"))
                        }
                        onViewTimeline={() => setOpenedTimelineFor(app.id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {openedTimelineFor && (
        <TimelineModal
          events={timelineData}
          isLoading={isTimelineLoading}
          onClose={() => setOpenedTimelineFor(null)}
        />
      )}
    </div>
  )
}
