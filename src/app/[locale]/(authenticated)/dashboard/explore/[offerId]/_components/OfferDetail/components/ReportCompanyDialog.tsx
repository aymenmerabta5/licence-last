"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { ReportFormFields } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ReportFormFields"
import type {
  CompanyReportFormErrors,
  CompanyReportFormValues,
} from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useCompanyReport"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReportCompanyDialogProps {
  companyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  values: CompanyReportFormValues
  errors: CompanyReportFormErrors
  isSubmitting: boolean
  onFieldChange: <K extends keyof CompanyReportFormValues>(
    field: K,
    value: CompanyReportFormValues[K],
  ) => void
  onSubmit: () => void
}

export function ReportCompanyDialog({
  companyName,
  open,
  onOpenChange,
  values,
  errors,
  isSubmitting,
  onFieldChange,
  onSubmit,
}: ReportCompanyDialogProps) {
  const t = useTranslations("dashboard.offerDetail.report")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { companyName })}
          </DialogDescription>
        </DialogHeader>

        <ReportFormFields
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onFieldChange={onFieldChange}
        />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="editorial-outline"
            className="rounded-none"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="editorial"
            className="gap-1.5 rounded-none"
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
