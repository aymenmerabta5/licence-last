"use client"

import { CalendarPlus, Check, Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { CandidateApp } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import type { PipelineStage } from "@/lib/constants/pipeline"
import {
  canTransitionStage,
  STAGE_COLUMNS,
  STAGE_LABELS,
} from "@/lib/constants/pipeline"

interface CandidateCardActionsProps {
  app: CandidateApp
  actionLoading: string | null
  isStagePending: boolean
  onAccept: () => void
  onRefuse: () => void
  onInterview: () => void
  onStageChange: (toStage: PipelineStage) => void
  onViewTimeline: () => void
}

export function CandidateCardActions({
  app,
  actionLoading,
  isStagePending,
  onAccept,
  onRefuse,
  onInterview,
  onStageChange,
  onViewTimeline,
}: CandidateCardActionsProps) {
  const t = useTranslations("dashboard.company.candidates")

  return (
    <>
      <SelectField
        id={`pipeline-stage-${app.id}`}
        label={t("pipelineStage")}
        options={STAGE_COLUMNS.map((option) => ({
          value: option,
          label: STAGE_LABELS[option],
          disabled:
            option !== app.pipelineStage &&
            (!canTransitionStage(app.pipelineStage, option) ||
              (option === "interview" && !app.interviewPreview)),
        }))}
        value={app.pipelineStage}
        onChange={(value) => onStageChange(value as PipelineStage)}
        disabled={
          isStagePending ||
          app.pipelineStage === "accepted" ||
          app.pipelineStage === "rejected"
        }
        className="h-8 rounded-sm border-border/50 bg-secondary/10 text-xs"
      />

      {app.status === "applied" && (
        <div className="flex flex-col gap-2">
          {(app.pipelineStage === "applied" || app.pipelineStage === "screening") && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 border-violet-500/30 text-[10px] font-bold uppercase tracking-wider text-violet-600 hover:bg-violet-500/5 hover:text-violet-700"
              onClick={onInterview}
            >
              <CalendarPlus className="h-3 w-3" />
              Interview
            </Button>
          )}

          {app.pipelineStage === "offer" && (
            <Button
              size="sm"
              className="h-7 flex-1 gap-1.5 bg-emerald-600 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700"
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
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-7 flex-1 gap-1.5 border-destructive/20 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/5"
            onClick={onRefuse}
          >
            <X className="h-3 w-3" />
            {t("refuse")}
          </Button>
        </div>
      )}

      <Link
        href={`/profile/${app.student.id}` as "/profile"}
        className="block w-full py-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 transition-colors hover:text-primary"
      >
        {t("viewProfile")}
      </Link>

      <button
        type="button"
        className="w-full py-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 transition-colors hover:text-primary"
        onClick={onViewTimeline}
      >
        View timeline
      </button>
    </>
  )
}
