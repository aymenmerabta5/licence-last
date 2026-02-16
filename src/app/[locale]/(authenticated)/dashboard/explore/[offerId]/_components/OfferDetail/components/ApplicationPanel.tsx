"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import {
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  PenLine,
} from "lucide-react"

import { STATUS_COLORS } from "@/lib/constants/pipeline"
import { reveal, ease } from "@/lib/animations"
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
  isDrafting: boolean
  draftError: Error | null
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
  isDrafting,
  draftError,
  onDraftCoverLetter,
  applyMutation,
  offerId,
}: ApplicationPanelProps) {
  const t = useTranslations("dashboard.offerDetail")
  const statusT = useTranslations("dashboard.applications.status")

  return (
    <motion.section
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.2 }}
      className="space-y-5"
    >
      {/* Section divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/30" />
        <PenLine className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
          {t("application")}
        </span>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {/* Success message */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            {successMsg}
          </p>
        </motion.div>
      )}

      {/* Already applied */}
      {application ? (
        <div className="border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">
            {t("alreadyApplied")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t("applicationStatus")}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${STATUS_COLORS[application.status] ?? ""}`}
            >
              {statusT(application.status as "applied")}
            </span>
          </div>
        </div>
      ) : isOfferClosed ? (
        <div className="border border-border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground">{t("offerClosed")}</p>
        </div>
      ) : showApplyForm ? (
        <div className="border border-border bg-card p-5 space-y-5">
          {/* Cover letter area */}
          <div className="space-y-3">
            <Label
              htmlFor="coverLetter"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              {t("coverLetter")}
            </Label>

            {/* AI Draft button */}
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              className="gap-2"
              disabled={isDrafting}
              onClick={onDraftCoverLetter}
            >
              {isDrafting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("copilot.drafting")}
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("copilot.draftWithAi")}
                </>
              )}
            </Button>

            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => onCoverLetterChange(e.target.value)}
              placeholder={t("coverLetterPlaceholder")}
              rows={6}
              maxLength={5000}
              className="resize-none"
            />

            {draftError && (
              <p className="text-xs text-destructive">{draftError.message}</p>
            )}

            {/* Draft preview */}
            {coverLetterDraft && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className="border-s-2 border-amber-500/50 bg-amber-500/5 p-4 space-y-3"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
                  {t("copilot.previewTitle")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {coverLetterDraft}
                </p>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="editorial"
                    size="editorial-sm"
                    onClick={onApplyDraft}
                  >
                    {t("copilot.applyDraft")}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Submit error */}
          {applyMutation.error && (
            <p className="text-sm text-destructive">
              {applyMutation.error.message || t("applicationError")}
            </p>
          )}

          {/* Submit button */}
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
    </motion.section>
  )
}
