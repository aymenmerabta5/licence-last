import { GripVertical, Loader2, Users } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { CandidateDragLayer } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateDragLayer"
import { PipelineStageColumn } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/PipelineStageColumn"
import type { CandidateApp } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { ease } from "@/lib/animations"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"

interface PipelineGridProps {
  applications: CandidateApp[]
  grouped: Map<PipelineStage, CandidateApp[]>
  isLoading: boolean
  isFiltered: boolean
  offerId: string
  actionLoading: string | null
  pendingStageById: Record<string, true>
  onAccept: (app: CandidateApp) => void
  onRefuse: (app: CandidateApp) => void
  onInterview: (app: CandidateApp) => void
  onStageChange: (appId: string, toStage: PipelineStage) => void
  onViewTimeline: (appId: string) => void
}

export function PipelineGrid({
  applications,
  grouped,
  isLoading,
  isFiltered,
  offerId,
  actionLoading,
  pendingStageById,
  onAccept,
  onRefuse,
  onInterview,
  onStageChange,
  onViewTimeline,
}: PipelineGridProps) {
  const t = useTranslations("dashboard.company.candidates")

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="border border-dashed border-border/40 p-12 text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5">
          <Users className="h-8 w-8 text-primary/30" />
        </div>
        <p className="text-sm text-muted-foreground/60">
          {isFiltered ? t("emptyFiltered") : t("empty")}
        </p>
      </motion.div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <CandidateDragLayer />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-muted-foreground/40">
          <GripVertical className="h-3 w-3" />
          <p className="text-[10px] font-medium">{t("dragHint")}</p>
        </div>
        <div className="overflow-y-auto md:overflow-x-auto md:overflow-y-hidden pb-3">
          <div className="grid grid-flow-row md:grid-flow-col grid-cols-1 md:auto-cols-[minmax(280px,1fr)] gap-3 min-w-0 md:min-w-[1760px]">
            {STAGE_COLUMNS.map((stage) => (
              <PipelineStageColumn
                key={stage}
                stage={stage}
                stageApps={grouped.get(stage) ?? []}
                offerId={offerId}
                actionLoading={actionLoading}
                pendingStageById={pendingStageById}
                onAccept={onAccept}
                onRefuse={onRefuse}
                onInterview={onInterview}
                onStageChange={onStageChange}
                onViewTimeline={onViewTimeline}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </DndProvider>
  )
}
