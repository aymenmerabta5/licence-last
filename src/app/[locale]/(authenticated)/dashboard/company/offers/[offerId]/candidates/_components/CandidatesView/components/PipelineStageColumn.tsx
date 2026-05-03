import { Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { useDrop } from "react-dnd"

import { CandidateCard } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCard"
import {
  CANDIDATE_CARD_DND_TYPE,
  type CandidateApp,
  type CandidateCardDragItem,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { canTransitionStage, STAGE_LABELS } from "@/lib/constants/pipeline"
import { cn } from "@/lib/utils"

const STAGE_THEME: Record<
  PipelineStage,
  { dot: string; headerBg: string; dropBg: string; border: string }
> = {
  applied: {
    dot: "bg-blue-500",
    headerBg: "bg-blue-500/5",
    dropBg: "border-blue-500/40 bg-blue-500/5",
    border: "border-blue-500/15",
  },
  screening: {
    dot: "bg-amber-500",
    headerBg: "bg-amber-500/5",
    dropBg: "border-amber-500/40 bg-amber-500/5",
    border: "border-amber-500/15",
  },
  interview: {
    dot: "bg-violet-500",
    headerBg: "bg-violet-500/5",
    dropBg: "border-violet-500/40 bg-violet-500/5",
    border: "border-violet-500/15",
  },
  offer: {
    dot: "bg-teal-500",
    headerBg: "bg-teal-500/5",
    dropBg: "border-teal-500/40 bg-teal-500/5",
    border: "border-teal-500/15",
  },
  accepted: {
    dot: "bg-emerald-500",
    headerBg: "bg-emerald-500/5",
    dropBg: "border-emerald-500/40 bg-emerald-500/5",
    border: "border-emerald-500/15",
  },
  validated: {
    dot: "bg-emerald-600",
    headerBg: "bg-emerald-600/5",
    dropBg: "border-emerald-600/40 bg-emerald-600/5",
    border: "border-emerald-600/15",
  },
  rejected: {
    dot: "bg-rose-500",
    headerBg: "bg-rose-500/5",
    dropBg: "border-rose-500/40 bg-rose-500/5",
    border: "border-rose-500/15",
  },
}

export interface PipelineStageColumnProps {
  stage: PipelineStage
  stageApps: CandidateApp[]
  offerId: string
  actionLoading: string | null
  pendingStageById: Record<string, true>
  onAccept: (app: CandidateApp) => void
  onRefuse: (app: CandidateApp) => void
  onInterview: (app: CandidateApp) => void
  onStageChange: (appId: string, toStage: PipelineStage) => void
  onViewTimeline: (appId: string) => void
}

export function PipelineStageColumn({
  stage,
  stageApps,
  offerId,
  actionLoading,
  pendingStageById,
  onAccept,
  onRefuse,
  onInterview,
  onStageChange,
  onViewTimeline,
}: PipelineStageColumnProps) {
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
        "border bg-secondary/[0.02] min-h-[70vh] flex flex-col transition-all",
        isOver && canDrop ? theme.dropBg : "border-border/40",
      )}
      aria-label={t("kanbanColumnAria", { stage: STAGE_LABELS[stage] })}
    >
      <header
        className={cn(
          "flex items-center justify-between px-3.5 py-3 border-b border-border/30",
          theme.headerBg,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full shrink-0", theme.dot)} />
          <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-heading">
            {STAGE_LABELS[stage]}
          </h2>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/50 tabular-nums bg-background/50 px-1.5 py-0.5">
          {stageApps.length}
        </span>
      </header>

      <div className="p-2.5 space-y-2.5 flex-1">
        {stageApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="h-8 w-8 border border-dashed border-border/30 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-muted-foreground/20" />
            </div>
            <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.12em]">
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
              app.pipelineStage !== "validated" &&
              app.pipelineStage !== "rejected"
            }
            onAccept={() => onAccept(app)}
            onRefuse={() => onRefuse(app)}
            onInterview={() => onInterview(app)}
            onStageChange={(toStage) => onStageChange(app.id, toStage)}
            onViewTimeline={() => onViewTimeline(app.id)}
          />
        ))}
      </div>
    </section>
  )
}
