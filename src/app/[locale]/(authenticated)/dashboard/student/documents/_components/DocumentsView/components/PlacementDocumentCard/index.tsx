"use client"

import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"

import { FeedbackCallout } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard/components/FeedbackCallout"
import { PlacementDetails } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard/components/PlacementDetails"
import { PlacementDocumentRow } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard/components/PlacementDocumentRow"
import { STATUS_STYLES } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard/constants"
import type { PlacementDocumentCardProps } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

export function PlacementDocumentCard({
  placement,
  downloadingDocumentId,
  onDownload,
  onOpenFeedback,
}: PlacementDocumentCardProps) {
  const locale = useLocale()
  const t = useTranslations("dashboard.documents")

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  )

  const internshipTypeLabel =
    INTERNSHIP_TYPE_LABELS[placement.internshipType] ?? placement.internshipType

  return (
    <Card className="border border-border bg-background">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t("placement.company")}
            </p>
            <CardTitle className="font-serif text-xl text-heading">
              {placement.companyName}
            </CardTitle>
          </div>
          <Badge variant="editorial-outline">{internshipTypeLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <PlacementDetails
          offerLabel={t("placement.offer")}
          offerValue={placement.offerTitle}
          typeLabel={t("placement.type")}
          typeValue={internshipTypeLabel}
          startDateLabel={t("placement.startDate")}
          startDateValue={dateFormatter.format(new Date(placement.startDate))}
          endDateLabel={t("placement.endDate")}
          endDateValue={dateFormatter.format(new Date(placement.endDate))}
          validatedAtLabel={t("placement.validatedAt")}
          validatedAtValue={dateFormatter.format(new Date(placement.validatedAt))}
        />

        <FeedbackCallout
          description={t("feedback.ctaDescription")}
          actionLabel={t("feedback.ctaLabel")}
          onOpenFeedback={() =>
            onOpenFeedback({
              placementId: placement.placementId,
              companyName: placement.companyName,
              offerTitle: placement.offerTitle,
            })
          }
        />

        <div className="space-y-3 border-t border-border pt-4">
          {placement.documents.map((doc) => (
            <PlacementDocumentRow
              key={doc.id}
              title={t(doc.type)}
              statusLabel={t(`status.${doc.status}` as "status.pending")}
              statusClassName={STATUS_STYLES[doc.status]}
              verificationCodeLabel={t("placement.verificationCode")}
              verificationCode={doc.verificationCode}
              notAvailableLabel={t("placement.notAvailable")}
              isActionLoading={downloadingDocumentId === doc.id}
              isActionDisabled={
                doc.status !== "generated" || downloadingDocumentId === doc.id
              }
              actionLabel={
                doc.status === "generated"
                  ? t("download")
                  : t(`status.${doc.status}` as "status.pending")
              }
              actionLoadingLabel={t("downloading")}
              showDownloadIcon={doc.status === "generated"}
              onAction={() => onDownload(doc.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
