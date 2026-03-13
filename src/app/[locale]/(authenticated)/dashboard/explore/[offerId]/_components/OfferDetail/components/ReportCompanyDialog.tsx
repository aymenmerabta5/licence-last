"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CompanyReportSeverity } from "@/lib/schemas/enums"

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

const CATEGORY_OPTIONS = [
  "professional_conduct",
  "misleading_offer",
  "communication_issue",
  "other",
] as const

const SEVERITY_OPTIONS: CompanyReportSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
]

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

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="company-report-category">
              {t("categoryLabel")}
            </Label>
            <Select
              value={values.category}
              onValueChange={(value) => {
                if (value) {
                  onFieldChange("category", value)
                }
              }}
              disabled={isSubmitting}
              items={CATEGORY_OPTIONS.map((cat) => ({
                value: cat,
                label: t(`categories.${cat}`),
              }))}
            >
              <SelectTrigger
                id="company-report-category"
                className="h-10 w-full border-border/40"
              >
                <SelectValue placeholder={t("categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(`categories.${category}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-report-severity">
              {t("severityLabel")}
            </Label>
            <Select
              value={values.severity}
              onValueChange={(value) => {
                if (value) {
                  onFieldChange("severity", value as CompanyReportSeverity)
                }
              }}
              disabled={isSubmitting}
              items={SEVERITY_OPTIONS.map((sev) => ({
                value: sev,
                label: t(`severity.${sev}`),
              }))}
            >
              <SelectTrigger
                id="company-report-severity"
                className="h-10 w-full border-border/40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_OPTIONS.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {t(`severity.${severity}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.severity && (
              <p className="text-xs text-destructive">{errors.severity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-report-description">
              {t("descriptionLabel")}
            </Label>
            <Textarea
              id="company-report-description"
              value={values.description}
              onChange={(event) =>
                onFieldChange("description", event.target.value)
              }
              placeholder={t("descriptionPlaceholder")}
              className="min-h-28 rounded-xl border-border/40"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="editorial-outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
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
