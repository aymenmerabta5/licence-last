"use client"

import { Loader2, Search } from "lucide-react"
import * as motion from "motion/react-client"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { ApplicationJourneyCard } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/ApplicationJourneyCard"
import { FilterTabs } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/FilterTabs"
import { PipelineSummaryBar } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/PipelineSummaryBar"
import type { ApplicationJourney } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/types"
import type { FilterTab } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/hooks/useApplicationHub"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface ApplicationsHubViewProps {
  journeys: ApplicationJourney[]
  isLoading: boolean
  isError: boolean
  counts: Record<string, number>
  activeFilter: FilterTab
  onFilterChange: (filter: FilterTab) => void
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onWithdraw: (applicationId: string) => void
  withdrawingId: string | null
  onConfirmSlot: (interviewId: string, slotId: string) => void
  confirmingSlotId: string | null
  onDownloadDocument: (documentId: string) => void
  downloadingDocumentId: string | null
}

export function ApplicationsHubView(props: ApplicationsHubViewProps) {
  const t = useTranslations("dashboard.applications.hub")
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const {
    journeys, isLoading, isError, counts, activeFilter, onFilterChange,
    expandedId, onToggleExpand, onWithdraw, withdrawingId,
    onConfirmSlot, confirmingSlotId, onDownloadDocument, downloadingDocumentId,
  } = props
  const displayedJourneys = activeStage ? journeys.filter((j) => j.pipelineStage === activeStage) : journeys

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl tracking-tight text-heading">{t("title")}</h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">{t("subtitle")}</p>
      </motion.div>
      <PipelineSummaryBar counts={counts} activeStage={activeStage} onStageClick={setActiveStage} />
      <FilterTabs active={activeFilter} onChange={onFilterChange} />
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{t("loading")}</span>
        </div>
      )}
      {isError && (
        <div className="space-y-2 border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("errorDescription")}</p>
        </div>
      )}
      {!isLoading && !isError && displayedJourneys.length === 0 && (
        <motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }} className="space-y-4 border border-dashed border-border/60 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
            <Search className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-xl text-heading">{t("empty.title")}</p>
            <p className="mx-auto max-w-sm text-sm font-light text-muted-foreground">{t("empty.description")}</p>
          </div>
          <Link href={"/dashboard/explore" as "/dashboard"}>
            <Button variant="editorial" size="editorial" className="gap-2">
              <Search className="h-4 w-4" />
              {t("empty.explore")}
            </Button>
          </Link>
        </motion.div>
      )}
      {!isLoading && !isError && displayedJourneys.length > 0 && (
        <div className="space-y-4">
          {displayedJourneys.map((journey) => (
            <ApplicationJourneyCard
              key={journey.id}
              journey={journey}
              isExpanded={expandedId === journey.id}
              onToggleExpand={() => onToggleExpand(journey.id)}
              onWithdraw={onWithdraw}
              isWithdrawing={withdrawingId === journey.id}
              onConfirmSlot={onConfirmSlot}
              confirmingSlotId={confirmingSlotId}
              onDownloadDocument={onDownloadDocument}
              downloadingDocumentId={downloadingDocumentId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
