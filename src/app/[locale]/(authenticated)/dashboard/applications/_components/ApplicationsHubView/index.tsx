"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ApplicationsHubBody } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/ApplicationsHubBody"
import { FilterTabs } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/FilterTabs"
import { PipelineSummaryBar } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/PipelineSummaryBar"
import type { FilterTab } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/hooks/useApplicationHub"
import type { ApplicationJourney } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/types"
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
  generatingPlacementId: string | null
  onGenerateCertificate: (
    placementId: string,
    locale: string,
    borderStyle: string,
  ) => void
}

export function ApplicationsHubView(props: ApplicationsHubViewProps) {
  const t = useTranslations("dashboard.applications.hub")
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const {
    journeys,
    isLoading,
    isError,
    counts,
    activeFilter,
    onFilterChange,
    expandedId,
    onToggleExpand,
    onWithdraw,
    withdrawingId,
    onConfirmSlot,
    confirmingSlotId,
    onDownloadDocument,
    downloadingDocumentId,
    generatingPlacementId,
    onGenerateCertificate,
  } = props
  const displayedJourneys = activeStage
    ? journeys.filter((j) => j.pipelineStage === activeStage)
    : journeys

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          {t("subtitle")}
        </p>
      </motion.div>
      <PipelineSummaryBar
        counts={counts}
        activeStage={activeStage}
        onStageClick={setActiveStage}
      />
      <FilterTabs active={activeFilter} onChange={onFilterChange} />
      <ApplicationsHubBody
        journeys={displayedJourneys}
        isLoading={isLoading}
        isError={isError}
        expandedId={expandedId}
        onToggleExpand={onToggleExpand}
        onWithdraw={onWithdraw}
        withdrawingId={withdrawingId}
        onConfirmSlot={onConfirmSlot}
        confirmingSlotId={confirmingSlotId}
        onDownloadDocument={onDownloadDocument}
        downloadingDocumentId={downloadingDocumentId}
        generatingPlacementId={generatingPlacementId}
        onGenerateCertificate={onGenerateCertificate}
      />
    </div>
  )
}
