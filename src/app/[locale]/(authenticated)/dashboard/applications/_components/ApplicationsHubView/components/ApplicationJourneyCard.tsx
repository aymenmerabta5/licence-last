"use client"

import { Loader2, X } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ApplicationJourneyCardHeader } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/ApplicationJourneyCardHeader"
import { InterviewSlotsSection } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/InterviewSlotsSection"
import { JourneyTimeline } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/JourneyTimeline"
import { PlacementDocumentsSection } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/PlacementDocumentsSection"
import type { ApplicationJourney } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/types"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"
import { STAGE_COLUMNS, STAGE_LABELS } from "@/lib/constants/pipeline"
import { cn } from "@/lib/utils"

interface ApplicationJourneyCardProps {
  journey: ApplicationJourney
  isExpanded: boolean
  onToggleExpand: () => void
  onWithdraw: (applicationId: string) => void
  isWithdrawing: boolean
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

function getNextActionVariant(
  journey: ApplicationJourney,
): "action" | "waiting" | "ready" {
  const hasPendingInterview = journey.interviews.some(
    (i) => i.status === "pending_confirmation",
  )
  const hasPendingDocs = journey.placement?.documents.some(
    (d) => d.status === "pending",
  )
  if (hasPendingInterview || hasPendingDocs) return "action"
  const hasGeneratedDocs = journey.placement?.documents.some(
    (d) => d.status === "generated",
  )
  if (hasGeneratedDocs) return "ready"
  return "waiting"
}

export function ApplicationJourneyCard({
  journey,
  isExpanded,
  onToggleExpand,
  onWithdraw,
  isWithdrawing,
  onConfirmSlot,
  confirmingSlotId,
  onDownloadDocument,
  downloadingDocumentId,
  generatingPlacementId,
  onGenerateCertificate,
}: ApplicationJourneyCardProps) {
  const t = useTranslations("dashboard.applications.hub")
  const nextAction = getNextActionVariant(journey)

  const nextActionClass = {
    action:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    waiting: "bg-muted text-muted-foreground border-border",
    ready:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  }[nextAction]

  const nextActionLabel = {
    action: t("nextAction.actionRequired"),
    waiting: t("nextAction.waiting"),
    ready: t("nextAction.readyToDownload"),
  }[nextAction]

  return (
    <motion.article
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className={cn(
        "overflow-hidden border transition-colors",
        isExpanded
          ? "border-foreground/30 bg-card/50"
          : "border-border/60 bg-card/30 hover:border-foreground/20",
      )}
    >
      <ApplicationJourneyCardHeader
        journey={journey}
        isExpanded={isExpanded}
        nextActionClass={nextActionClass}
        nextActionLabel={nextActionLabel}
        onToggleExpand={onToggleExpand}
        tStatus={(status) => t(`status.${status}`)}
      />

      {isExpanded && (
        <div className="border-t border-border/60 px-4 pb-4 pt-2">
          <JourneyTimeline
            currentStage={journey.pipelineStage}
            stages={[...STAGE_COLUMNS]}
            stageLabels={STAGE_LABELS}
          />

          {journey.interviews.length > 0 && (
            <InterviewSlotsSection
              interviews={journey.interviews}
              confirmingSlotId={confirmingSlotId}
              onConfirmSlot={onConfirmSlot}
            />
          )}

          {journey.placement && (
            <PlacementDocumentsSection
              placement={journey.placement}
              downloadingDocumentId={downloadingDocumentId}
              onDownload={onDownloadDocument}
              generatingPlacementId={generatingPlacementId}
              onGenerateCertificate={onGenerateCertificate}
            />
          )}

          {journey.status === "applied" && (
            <div className="mt-4 flex justify-end border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onWithdraw(journey.id)}
                disabled={isWithdrawing}
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-destructive"
              >
                {isWithdrawing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                {t("journeyCard.withdraw")}
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.article>
  )
}
