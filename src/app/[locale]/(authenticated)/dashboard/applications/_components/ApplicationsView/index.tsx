"use client"

import { Loader2, Search } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { PipelineBoard } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView/components/PipelineBoard"
import { useApplications } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView/hooks/useApplications"
import { TimelineModal } from "@/components/TimelineModal"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

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
  const hasApplications = applications.length > 0

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl tracking-tight text-heading">
          {t("title")} - Pipeline
        </h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          {t("subtitle")}
        </p>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && !hasApplications && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="space-y-4 border border-dashed border-border p-12 text-center"
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

      {hasApplications && (
        <PipelineBoard
          groupedByStage={groupedByStage}
          withdrawingId={withdrawingId}
          onWithdraw={(applicationId) =>
            handleWithdraw(applicationId, t("withdrawConfirm"))
          }
          onViewTimeline={setOpenedTimelineFor}
        />
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
