"use client"

import { Loader2, Star } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type {
  FeedbackPlacementContext,
  QualityFeedbackFormErrors,
  QualityFeedbackFormValues,
} from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/hooks/useCompanyFeedback"

interface QualityFeedbackDialogProps {
  placement: FeedbackPlacementContext | null
  open: boolean
  onOpenChange: (open: boolean) => void
  values: QualityFeedbackFormValues
  errors: QualityFeedbackFormErrors
  isSubmitting: boolean
  onFieldChange: <K extends keyof QualityFeedbackFormValues>(
    field: K,
    value: QualityFeedbackFormValues[K],
  ) => void
  onSubmit: () => void
}

const RATING_OPTIONS = [1, 2, 3, 4, 5]

export function QualityFeedbackDialog({
  placement,
  open,
  onOpenChange,
  values,
  errors,
  isSubmitting,
  onFieldChange,
  onSubmit,
}: QualityFeedbackDialogProps) {
  const t = useTranslations("dashboard.documents.feedback")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{t("title")}</DialogTitle>
          <DialogDescription>
            {placement
              ? t("description", {
                  companyName: placement.companyName,
                  offerTitle: placement.offerTitle,
                })
              : t("descriptionFallback")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>{t("ratingLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((ratingValue) => {
                const isActive = values.rating === ratingValue
                return (
                  <Button
                    key={ratingValue}
                    type="button"
                    variant="editorial-outline"
                    size="sm"
                    className={cn(
                      "min-w-14 gap-1.5 border-border/40",
                      isActive && "border-primary bg-primary/10 text-primary",
                    )}
                    onClick={() => onFieldChange("rating", ratingValue)}
                    disabled={isSubmitting}
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        isActive && "fill-current text-primary",
                      )}
                    />
                    {ratingValue}
                  </Button>
                )
              })}
            </div>
            {errors.rating && (
              <p className="text-xs text-destructive">{errors.rating}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="feedback-recommend"
              checked={values.wouldRecommend}
              onCheckedChange={(checked) =>
                onFieldChange("wouldRecommend", Boolean(checked))
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="feedback-recommend" className="text-sm font-normal">
              {t("wouldRecommendLabel")}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-comment">{t("commentLabel")}</Label>
            <Textarea
              id="feedback-comment"
              value={values.comment}
              onChange={(event) => onFieldChange("comment", event.target.value)}
              placeholder={t("commentPlaceholder")}
              className="min-h-28 rounded-xl border-border/40"
              disabled={isSubmitting}
            />
            {errors.comment && (
              <p className="text-xs text-destructive">{errors.comment}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="editorial-outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="editorial"
            className="gap-1.5"
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
