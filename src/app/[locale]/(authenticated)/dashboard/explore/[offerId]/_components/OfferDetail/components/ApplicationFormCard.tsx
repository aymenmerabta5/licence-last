"use client"

import { Loader2, Send, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { OfferApplyMutation } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ease, reveal } from "@/lib/animations"

interface ApplicationFormCardProps {
  coverLetter: string
  onCoverLetterChange: (value: string) => void
  coverLetterDraft: string | null
  onApplyDraft: () => void
  isDrafting: boolean
  draftError: Error | null
  onDraftCoverLetter: () => void
  applyMutation: OfferApplyMutation
  offerId: string
}

export function ApplicationFormCard({
  coverLetter,
  onCoverLetterChange,
  coverLetterDraft,
  onApplyDraft,
  isDrafting,
  draftError,
  onDraftCoverLetter,
  applyMutation,
  offerId,
}: ApplicationFormCardProps) {
  const t = useTranslations("dashboard.offerDetail")

  return (
    <div className="border border-border bg-card p-5 space-y-5">
      <div className="space-y-3">
        <Label
          htmlFor="coverLetter"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          {t("coverLetter")}
        </Label>

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

        {draftError ? (
          <p className="text-xs text-destructive">{draftError.message}</p>
        ) : null}

        {coverLetterDraft ? (
          <motion.div
            {...reveal}
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
        ) : null}
      </div>

      {applyMutation.error ? (
        <p className="text-sm text-destructive">
          {applyMutation.error.message || t("applicationError")}
        </p>
      ) : null}

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
  )
}
