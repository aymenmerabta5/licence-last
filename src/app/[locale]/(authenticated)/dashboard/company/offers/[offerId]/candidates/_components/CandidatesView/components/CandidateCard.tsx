"use client"

import { Clock, GraduationCap } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useDrag } from "react-dnd"
import { CandidateCardActions } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCardActions"
import { CandidateCardDetails } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCardDetails"
import { MatchPreview } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/MatchPreview"
import {
  CANDIDATE_CARD_DND_TYPE,
  type CandidateApp,
  type CandidateCardDragItem,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { STATUS_COLORS } from "@/lib/constants/pipeline"
import { cn } from "@/lib/utils"

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

  const initials = (app.student.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <article
      ref={(node) => {
        dragRef(node)
      }}
      className={cn(
        "border border-border/50 bg-background p-3.5 space-y-3 transition-all rounded-sm",
        canDrag &&
          "cursor-grab active:cursor-grabbing hover:border-border hover:shadow-sm",
        isDragging &&
          "opacity-50 scale-[0.98] shadow-lg ring-2 ring-primary/20",
        !canDrag && "cursor-default",
      )}
      aria-label={t("candidateCardAria", {
        name: app.student.name || "Anonymous",
      })}
    >
      {/* Student info row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-heading truncate">
            {app.student.name || "Anonymous"}
          </p>
          {app.university && (
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {app.university.abbreviation || app.university.name}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Status + date row */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border rounded-sm ${STATUS_COLORS[app.status] ?? ""}`}
        >
          {app.status.replace("_", " ")}
        </span>
        <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {new Date(app.createdAt).toLocaleDateString(locale)}
        </span>
      </div>

      {/* Match score */}
      <MatchPreview offerId={offerId} studentUserId={app.student.id} />

      <CandidateCardDetails app={app} />
      <CandidateCardActions
        app={app}
        actionLoading={actionLoading}
        isStagePending={isStagePending}
        onAccept={onAccept}
        onRefuse={onRefuse}
        onStageChange={onStageChange}
        onViewTimeline={onViewTimeline}
      />
    </article>
  )
}
