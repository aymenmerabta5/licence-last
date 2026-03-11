"use client"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { PlacementDocumentPanel } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementDocumentPanel"
import {
  getCertificateActionState,
  getReadonlyDocumentActionState,
  STATUS_STYLES,
} from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/utils"
import type { CompanyPlacementDocumentSummary } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

interface PlacementCertificateCardProps {
  placement: CompanyPlacementDocumentSummary
  companyMembershipRole?: string | null
  generatingPlacementId: string | null
  downloadingDocumentId: string | null
  onGenerateCertificate: (placementId: string) => void
  onDownloadDocument: (documentId: string) => void
}

export function PlacementCertificateCard({
  placement,
  companyMembershipRole = null,
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
  const agreementAction = agreementDoc
    ? getReadonlyDocumentActionState(
        agreementDoc.status,
        isAgreementDownloading,
        {
          download: t("download"),
          downloading: t("downloading"),
          pending: t("status.pending"),
          failed: t("status.failed"),
        },
      )
    : null
  const certificateAction = getCertificateActionState({
    status: certificateDoc?.status ?? "notGenerated",
    isOwner: companyMembershipRole === "owner",
    isLoading:
      certificateDoc?.status === "generated"
        ? isCertificateDownloading
        : isGenerating,
    labels: {
      download: t("download"),
      downloading: t("downloading"),
      pending: t("status.pending"),
      failed: t("status.failed"),
      generate: t("generate"),
      generating: t("generating"),
      ownerOnlyGenerate: t("ownerOnlyGenerate"),
    },
  })

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
            <p className="text-xs text-muted-foreground">
              {placement.studentEmail}
            </p>
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
          {agreementDoc && agreementAction ? (
            <PlacementDocumentPanel
              title={t("agreement")}
              statusLabel={t(
                `status.${agreementDoc.status}` as "status.pending",
              )}
              statusClassName={STATUS_STYLES[agreementDoc.status]}
              verificationCodeLabel={t("placement.verificationCode")}
              verificationCode={agreementDoc.verificationCode}
              notAvailableLabel={t("placement.notAvailable")}
              actionVariant={agreementAction.actionVariant}
              actionLabel={agreementAction.actionLabel}
              actionLoadingLabel={agreementAction.actionLoadingLabel}
              showDownloadIcon={agreementAction.showDownloadIcon}
              isActionLoading={isAgreementDownloading}
              isActionDisabled={agreementAction.isActionDisabled}
              onAction={() =>
                agreementAction.actionKind === "download" &&
                onDownloadDocument(agreementDoc.id)
              }
            />
          ) : null}
          <PlacementDocumentPanel
            title={t("certificate")}
            statusLabel={
              certificateDoc
                ? t(`status.${certificateDoc.status}` as "status.pending")
                : t("status.notGenerated")
            }
            statusClassName={
              STATUS_STYLES[certificateDoc?.status ?? "notGenerated"]
            }
            verificationCodeLabel={t("placement.verificationCode")}
            verificationCode={certificateDoc?.verificationCode ?? null}
            notAvailableLabel={t("placement.notAvailable")}
            actionVariant={certificateAction.actionVariant}
            actionLabel={certificateAction.actionLabel}
            actionLoadingLabel={certificateAction.actionLoadingLabel}
            showDownloadIcon={certificateAction.showDownloadIcon}
            isActionLoading={
              certificateAction.actionKind === "download"
                ? isCertificateDownloading
                : certificateAction.actionKind === "generate"
                  ? isGenerating
                  : false
            }
            isActionDisabled={certificateAction.isActionDisabled}
            onAction={() => {
              if (
                certificateAction.actionKind === "download" &&
                certificateDoc
              ) {
                onDownloadDocument(certificateDoc.id)
              }
              if (certificateAction.actionKind === "generate") {
                onGenerateCertificate(placement.placementId)
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
