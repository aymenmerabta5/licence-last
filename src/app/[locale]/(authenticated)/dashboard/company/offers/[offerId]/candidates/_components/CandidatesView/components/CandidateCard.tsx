"use client"

import { useDrag } from "react-dnd"
import { useLocale, useTranslations } from "next-intl"
import { Check, GraduationCap, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  STATUS_COLORS,
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

import { MatchPreview } from "./MatchPreview"

interface CandidateCardProps {
  app: CandidateApp
  offerId: string
  actionLoading: string | null
  isStagePending: boolean
  canDrag: boolean
  onAccept: () => void
  onRefuse: () => void
  onStageChange: (toStage: PipelineStage) => void
  onViewTimeline: () => void
}

export function CandidateCard({
  app,
  offerId,
  actionLoading,
  isStagePending,
  canDrag,
  onAccept,
  onRefuse,
  onStageChange,
  onViewTimeline,
}: CandidateCardProps) {
  const t = useTranslations("dashboard.company.candidates")
  const locale = useLocale()
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: CANDIDATE_CARD_DND_TYPE,
      item: {
        applicationId: app.id,
        fromStage: app.pipelineStage,
      } satisfies CandidateCardDragItem,
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [app.id, app.pipelineStage, canDrag],
  )

  return (
    <article
      ref={(node) => {
        dragRef(node)
      }}
      className={cn(
        "border border-border bg-background p-3 space-y-3 transition-[opacity,box-shadow,transform]",
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 scale-[0.99] shadow-lg",
        !canDrag && "cursor-default",
      )}
      aria-label={t("candidateCardAria", {
        name: app.student.name || "Anonymous",
      })}
    >
      <div className="space-y-1">
        <p className="font-medium text-sm text-heading">
          {app.student.name || "Anonymous"}
        </p>
        {app.university && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {app.university.abbreviation || app.university.name}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[app.status] ?? ""}`}
        >
          {app.status.replace("_", " ")}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {new Date(app.createdAt).toLocaleDateString(locale)}
        </span>
      </div>

      <MatchPreview offerId={offerId} studentUserId={app.student.id} />

      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t("pipelineStage")}
        </span>
        <select
          value={app.pipelineStage}
          onChange={(event) =>
            onStageChange(event.target.value as PipelineStage)
          }
          disabled={
            isStagePending ||
            app.pipelineStage === "accepted" ||
            app.pipelineStage === "rejected"
          }
          className="w-full h-8 border border-border bg-background px-2 text-xs"
        >
          {STAGE_COLUMNS.map((option) => (
            <option
              key={option}
              value={option}
              disabled={
                option !== app.pipelineStage &&
                !canTransitionStage(app.pipelineStage, option)
              }
            >
              {STAGE_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      {app.status === "applied" && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-7 text-[11px] gap-1.5 bg-green-600 hover:bg-green-700"
            onClick={onAccept}
            disabled={actionLoading === app.id}
          >
            {actionLoading === app.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {t("accept")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onRefuse}
          >
            <X className="h-3 w-3" />
            {t("refuse")}
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-[11px] px-0"
        onClick={onViewTimeline}
      >
        View timeline
      </Button>
    </article>
  )
}
