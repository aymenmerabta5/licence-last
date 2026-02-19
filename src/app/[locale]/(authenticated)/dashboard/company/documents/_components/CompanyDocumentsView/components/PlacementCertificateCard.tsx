"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"
import { PlacementDocumentPanel } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementDocumentPanel"
import type {
  CompanyPlacementDocumentSummary,
  PlacementDocumentStatus,
} from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/types"

interface PlacementCertificateCardProps {
  placement: CompanyPlacementDocumentSummary
  generatingPlacementId: string | null
  downloadingDocumentId: string | null
  onGenerateCertificate: (placementId: string) => void
  onDownloadDocument: (documentId: string) => void
}

type DocumentStatus = PlacementDocumentStatus | "notGenerated"

const STATUS_STYLES: Record<DocumentStatus, string> = {
  notGenerated: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  generated: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
}

export function PlacementCertificateCard({
  placement,
  generatingPlacementId,
  downloadingDocumentId,
  onGenerateCertificate,
  onDownloadDocument,
}: PlacementCertificateCardProps) {
  const t = useTranslations("dashboard.companyDocuments")
  const locale = useLocale()

  const internshipTypeLabel =
    INTERNSHIP_TYPE_LABELS[placement.internshipType] ?? placement.internshipType
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  )

  const agreementDoc =
    placement.documents.find((doc) => doc.type === "agreement") ?? null
  const certificateDoc =
    placement.documents.find((doc) => doc.type === "certificate") ?? null
  const isGenerating = generatingPlacementId === placement.placementId
  const isAgreementDownloading = agreementDoc
    ? downloadingDocumentId === agreementDoc.id
    : false
  const isCertificateDownloading = certificateDoc
    ? downloadingDocumentId === certificateDoc.id
    : false

  return (
    <Card className="border border-border bg-background">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t("placement.student")}
            </p>
            <CardTitle className="font-serif text-xl text-heading">
              {placement.studentName ?? placement.studentEmail}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{placement.studentEmail}</p>
          </div>
          <Badge variant="editorial-outline">{internshipTypeLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {t("placement.offer")}
            </dt>
            <dd className="text-foreground">{placement.offerTitle}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {t("placement.type")}
            </dt>
            <dd className="text-foreground">{internshipTypeLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {t("placement.startDate")}
            </dt>
            <dd className="text-foreground">
              {dateFormatter.format(new Date(placement.startDate))}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {t("placement.endDate")}
            </dt>
            <dd className="text-foreground">
              {dateFormatter.format(new Date(placement.endDate))}
            </dd>
          </div>
          <div className="space-y-1 md:col-span-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {t("placement.validatedAt")}
            </dt>
            <dd className="text-foreground">
              {dateFormatter.format(new Date(placement.validatedAt))}
            </dd>
          </div>
        </dl>

        <div className="space-y-3 border-t border-border pt-4">
          {agreementDoc ? (
            <PlacementDocumentPanel
              title={t("agreement")}
              statusLabel={t(`status.${agreementDoc.status}` as "status.pending")}
              statusClassName={STATUS_STYLES[agreementDoc.status]}
              verificationCodeLabel={t("placement.verificationCode")}
              verificationCode={agreementDoc.verificationCode}
              notAvailableLabel={t("placement.notAvailable")}
              actionVariant="editorial-outline"
              actionLabel={t("download")}
              actionLoadingLabel={t("downloading")}
              showDownloadIcon={true}
              isActionLoading={isAgreementDownloading}
              isActionDisabled={
                agreementDoc.status !== "generated" || isAgreementDownloading
              }
              onAction={() => onDownloadDocument(agreementDoc.id)}
            />
          ) : null}

          <PlacementDocumentPanel
            title={t("certificate")}
            statusLabel={
              certificateDoc
                ? t(`status.${certificateDoc.status}` as "status.pending")
                : t("status.notGenerated")
            }
            statusClassName={STATUS_STYLES[certificateDoc?.status ?? "notGenerated"]}
            verificationCodeLabel={t("placement.verificationCode")}
            verificationCode={certificateDoc?.verificationCode ?? null}
            notAvailableLabel={t("placement.notAvailable")}
            actionVariant={
              certificateDoc?.status === "generated" ? "editorial-outline" : "editorial"
            }
            actionLabel={
              certificateDoc?.status === "generated" ? t("download") : t("generate")
            }
            actionLoadingLabel={
              certificateDoc?.status === "generated"
                ? t("downloading")
                : t("generating")
            }
            showDownloadIcon={certificateDoc?.status === "generated"}
            isActionLoading={
              certificateDoc?.status === "generated"
                ? isCertificateDownloading
                : isGenerating
            }
            isActionDisabled={
              certificateDoc?.status === "generated"
                ? isCertificateDownloading
                : isGenerating
            }
            onAction={() =>
              certificateDoc?.status === "generated"
                ? onDownloadDocument(certificateDoc.id)
                : onGenerateCertificate(placement.placementId)
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
