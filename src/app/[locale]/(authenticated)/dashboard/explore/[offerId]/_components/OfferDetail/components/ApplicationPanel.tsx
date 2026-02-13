"use client"

import { useTranslations } from "next-intl"
import {
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react"

import { STATUS_COLORS } from "@/lib/constants/pipeline"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ApplicationPanelProps {
  application: { id: string; status: string; createdAt: Date } | null
  isOfferClosed: boolean
  showApplyForm: boolean
  onShowApplyForm: () => void
  coverLetter: string
  onCoverLetterChange: (value: string) => void
  coverLetterDraft: string | null
  onApplyDraft: () => void
  successMsg: string
  aiStatus: string
  aiError: Error | undefined
  onDraftCoverLetter: () => void
  applyMutation: {
    mutate: (input: { offerId: string; coverLetter?: string }) => void
    isPending: boolean
    error: Error | null
  }
  offerId: string
}

export function ApplicationPanel({
  application,
  isOfferClosed,
  showApplyForm,
  onShowApplyForm,
  coverLetter,
  onCoverLetterChange,
  coverLetterDraft,
  onApplyDraft,
  successMsg,
  aiStatus,
  aiError,
  onDraftCoverLetter,
  applyMutation,
  offerId,
}: ApplicationPanelProps) {
  const t = useTranslations("dashboard.offerDetail")
  const statusT = useTranslations("dashboard.applications.status")

  return (
    <div className="border border-border p-5 space-y-4">
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {application ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("alreadyApplied")}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("applicationStatus")}:
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[application.status] ?? ""}`}
            >
              {statusT(application.status as "applied")}
            </span>
          </div>
        </div>
      ) : isOfferClosed ? (
        <p className="text-sm text-muted-foreground">{t("offerClosed")}</p>
      ) : showApplyForm ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-sm">
              {t("coverLetter")}
            </Label>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={aiStatus !== "ready"}
                onClick={onDraftCoverLetter}
              >
                <Sparkles className="h-4 w-4" />
                {t("copilot.draftWithAi")}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                {t("copilot.aiStatus", { status: aiStatus })}
              </p>
            </div>

            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => onCoverLetterChange(e.target.value)}
              placeholder={t("coverLetterPlaceholder")}
              rows={6}
              maxLength={5000}
            />

            {aiError && (
              <p className="text-xs text-destructive">{aiError.message}</p>
            )}

            {coverLetterDraft && (
              <div className="border border-border bg-primary/5 p-3 rounded-none space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("copilot.previewTitle")}
                </p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {coverLetterDraft}
                </p>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="editorial"
                    size="editorial"
                    className="h-9"
                    onClick={onApplyDraft}
                  >
                    {t("copilot.applyDraft")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {applyMutation.error && (
            <p className="text-sm text-destructive">
              {applyMutation.error.message || t("applicationError")}
            </p>
          )}

          <Button
            onClick={() =>
              applyMutation.mutate({
                offerId,
                coverLetter: coverLetter || undefined,
              })
            }
            disabled={applyMutation.isPending}
            variant="editorial"
            size="editorial"
            className="w-full gap-2"
          >
            {applyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t("submitApplication")}
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button
          onClick={onShowApplyForm}
          variant="editorial"
          size="editorial"
          className="w-full gap-2"
        >
          <Send className="h-4 w-4" />
          {t("applyNow")}
        </Button>
      )}
    </div>
  )
}
