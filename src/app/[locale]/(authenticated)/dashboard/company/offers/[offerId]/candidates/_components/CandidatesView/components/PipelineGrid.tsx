import { DndProvider, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useTranslations } from "next-intl"
import { Loader2, Users } from "lucide-react"
import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"
import {
  STAGE_COLUMNS,
  STAGE_LABELS,
  canTransitionStage,
} from "@/lib/constants/pipeline"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { cn } from "@/lib/utils"
import {
  CANDIDATE_CARD_DND_TYPE,
  type CandidateApp,
  type CandidateCardDragItem,
} from "../types"

import { CandidateCard } from "./CandidateCard"

interface PipelineGridProps {
  applications: CandidateApp[]
  grouped: Map<PipelineStage, CandidateApp[]>
  isLoading: boolean
  offerId: string
  actionLoading: string | null
  pendingStageById: Record<string, true>
  onAccept: (appId: string) => void
  onRefuse: (app: CandidateApp) => void
  onStageChange: (appId: string, toStage: PipelineStage) => void
  onViewTimeline: (appId: string) => void
}

interface StageColumnProps {
  stage: PipelineStage
  stageApps: CandidateApp[]
  offerId: string
  actionLoading: string | null
  pendingStageById: Record<string, true>
  onAccept: (appId: string) => void
  onRefuse: (app: CandidateApp) => void
  onStageChange: (appId: string, toStage: PipelineStage) => void
  onViewTimeline: (appId: string) => void
}

function StageColumn({
  stage,
  stageApps,
  offerId,
  actionLoading,
  pendingStageById,
  onAccept,
  onRefuse,
  onStageChange,
  onViewTimeline,
}: StageColumnProps) {
  const t = useTranslations("dashboard.company.candidates")
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: CANDIDATE_CARD_DND_TYPE,
      canDrop: (item: CandidateCardDragItem) => {
        if (item.fromStage === stage) return false
        return canTransitionStage(item.fromStage, stage)
      },
      drop: (item: CandidateCardDragItem) => {
        onStageChange(item.applicationId, stage)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onStageChange, stage],
  )

  return (
    <section
      ref={(node) => {
        dropRef(node)
      }}
      className={cn(
        "border border-border bg-secondary/10 p-3 min-h-[70vh] flex flex-col space-y-3 transition-colors",
        isOver && canDrop && "border-primary bg-primary/5",
      )}
      aria-label={t("kanbanColumnAria", { stage: STAGE_LABELS[stage] })}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wider uppercase text-heading">
          {STAGE_LABELS[stage]}
        </h2>
        <span className="text-[10px] text-muted-foreground">{stageApps.length}</span>
      </header>

      <div className="space-y-2 flex-1">
        {stageApps.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            {t("noApplications")}
          </p>
        )}

        {stageApps.map((app) => (
          <CandidateCard
            key={app.id}
            app={app}
            offerId={offerId}
            actionLoading={actionLoading}
            isStagePending={Boolean(pendingStageById[app.id])}
            canDrag={
              !pendingStageById[app.id] &&
              app.pipelineStage !== "accepted" &&
              app.pipelineStage !== "rejected"
            }
            onAccept={() => onAccept(app.id)}
            onRefuse={() => onRefuse(app)}
            onStageChange={(toStage) => onStageChange(app.id, toStage)}
            onViewTimeline={() => onViewTimeline(app.id)}
          />
        ))}
      </div>
    </section>
  )
}

export function PipelineGrid({
  applications,
  grouped,
  isLoading,
  offerId,
  actionLoading,
  pendingStageById,
  onAccept,
  onRefuse,
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
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="border border-dashed border-border p-12 text-center space-y-2"
      >
        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </motion.div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">{t("dragHint")}</p>
        <div className="overflow-x-auto pb-3">
          <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 min-w-[1760px]">
            {STAGE_COLUMNS.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                stageApps={grouped.get(stage) ?? []}
                offerId={offerId}
                actionLoading={actionLoading}
                pendingStageById={pendingStageById}
                onAccept={onAccept}
                onRefuse={onRefuse}
                onStageChange={onStageChange}
                onViewTimeline={onViewTimeline}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
