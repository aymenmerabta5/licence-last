import { DndProvider, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useTranslations } from "next-intl"
import { Loader2, Users, GripVertical } from "lucide-react"
import * as motion from "motion/react-client"

import { ease } from "@/lib/animations"
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
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"

import { CandidateCard } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCard"

const STAGE_THEME: Record<PipelineStage, { dot: string; headerBg: string; dropBg: string }> = {
  applied: {
    dot: "bg-blue-500",
    headerBg: "bg-blue-500/5",
    dropBg: "border-blue-500/40 bg-blue-500/5",
  },
  screening: {
    dot: "bg-amber-500",
    headerBg: "bg-amber-500/5",
    dropBg: "border-amber-500/40 bg-amber-500/5",
  },
  interview: {
    dot: "bg-violet-500",
    headerBg: "bg-violet-500/5",
    dropBg: "border-violet-500/40 bg-violet-500/5",
  },
  offer: {
    dot: "bg-teal-500",
    headerBg: "bg-teal-500/5",
    dropBg: "border-teal-500/40 bg-teal-500/5",
  },
  accepted: {
    dot: "bg-emerald-500",
    headerBg: "bg-emerald-500/5",
    dropBg: "border-emerald-500/40 bg-emerald-500/5",
  },
  rejected: {
    dot: "bg-rose-500",
    headerBg: "bg-rose-500/5",
    dropBg: "border-rose-500/40 bg-rose-500/5",
  },
}

interface PipelineGridProps {
  applications: CandidateApp[]
  grouped: Map<PipelineStage, CandidateApp[]>
  isLoading: boolean
  offerId: string
  actionLoading: string | null
  pendingStageById: Record<string, true>
  onAccept: (app: CandidateApp) => void
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
  onAccept: (app: CandidateApp) => void
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
  const theme = STAGE_THEME[stage]
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
        "border border-border/40 bg-secondary/5 min-h-[70vh] flex flex-col transition-all rounded-sm",
        isOver && canDrop && theme.dropBg,
      )}
      aria-label={t("kanbanColumnAria", { stage: STAGE_LABELS[stage] })}
    >
      {/* Column header */}
      <header
        className={cn(
          "flex items-center justify-between px-3.5 py-3 border-b border-border/30",
          theme.headerBg,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full shrink-0", theme.dot)} />
          <h2 className="text-[11px] font-bold tracking-wider uppercase text-heading">
            {STAGE_LABELS[stage]}
          </h2>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/50 tabular-nums bg-background/50 px-1.5 py-0.5 rounded-sm">
          {stageApps.length}
        </span>
      </header>

      {/* Cards area */}
      <div className="p-2.5 space-y-2.5 flex-1">
        {stageApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="h-8 w-8 rounded-lg border border-dashed border-border/30 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-muted-foreground/20" />
            </div>
            <p className="text-[10px] text-muted-foreground/30 font-medium">
              {t("noApplications")}
            </p>
          </div>
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
            onAccept={() => onAccept(app)}
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="border border-dashed border-border/40 p-12 text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/5">
          <Users className="h-8 w-8 text-primary/30" />
        </div>
        <p className="text-sm text-muted-foreground/60">{t("empty")}</p>
      </motion.div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
        <div className="overflow-x-auto pb-3">
          <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-3 min-w-[1760px]">
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
      </motion.div>
    </DndProvider>
  )
}
