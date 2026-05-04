"use client"

import { Search } from "lucide-react"
import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { ApplicationJourneyCard } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/ApplicationJourneyCard"
import type { ApplicationJourney } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface ApplicationsHubBodyProps {
  journeys: ApplicationJourney[]
  isLoading: boolean
  isError: boolean
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

export function ApplicationsHubBody({
  journeys,
  isLoading,
  isError,
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
}: ApplicationsHubBodyProps) {
  const t = useTranslations("dashboard.applications.hub")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("loading")}
        </span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2 border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm font-medium text-destructive">
          {t("errorTitle")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("errorDescription")}
        </p>
      </div>
    )
  }

  if (journeys.length === 0) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-4 border border-dashed border-border/60 p-12 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <Search className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-xl text-heading">{t("empty.title")}</p>
          <p className="mx-auto max-w-sm text-sm font-light text-muted-foreground">
            {t("empty.description")}
          </p>
        </div>
        <Link href={"/dashboard/explore" as "/dashboard"}>
          <Button variant="editorial" size="editorial" className="gap-2">
            <Search className="h-4 w-4" />
            {t("empty.explore")}
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {journeys.map((journey) => (
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
          generatingPlacementId={generatingPlacementId}
          onGenerateCertificate={onGenerateCertificate}
        />
      ))}
    </div>
  )
}
