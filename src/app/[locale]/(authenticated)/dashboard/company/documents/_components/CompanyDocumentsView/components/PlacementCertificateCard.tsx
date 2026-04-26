"use client"

import { Briefcase, Calendar, GraduationCap, Mail } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { PlacementDocumentPanel } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementDocumentPanel"
import type { CompanyPlacementDocumentSummary } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/types"
import {
  getCertificateActionState,
  getReadonlyDocumentActionState,
  STATUS_STYLES,
} from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/utils"
import { Badge } from "@/components/ui/badge"
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
    <article className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
      {/* Card header */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/50 bg-muted/30">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {t("placement.student")}
            </p>
            <h3 className="font-serif text-lg text-heading truncate">
              {placement.studentName ?? placement.studentEmail}
            </h3>
            <p className="text-xs text-muted-foreground/70 inline-flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3" />
              {placement.studentEmail}
            </p>
          </div>
        </div>
        <Badge variant="editorial-outline">{internshipTypeLabel}</Badge>
      </div>

      {/* Metadata grid */}
      <div className="p-6 pt-4">
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <MetaItem
            icon={Briefcase}
            label={t("placement.offer")}
            value={placement.offerTitle}
          />
          <MetaItem
            icon={Calendar}
            label={t("placement.startDate")}
            value={dateFormatter.format(new Date(placement.startDate))}
          />
          <MetaItem
            icon={Calendar}
            label={t("placement.endDate")}
            value={dateFormatter.format(new Date(placement.endDate))}
          />
        </dl>
      </div>

      {/* Documents section */}
      <div className="border-t border-border/40 p-6 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-4">
          Documents
        </p>

        {agreementDoc && agreementAction && (
          <PlacementDocumentPanel
            title={t("agreement")}
            statusLabel={t(`status.${agreementDoc.status}` as "status.pending")}
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
        )}

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
            if (certificateAction.actionKind === "download" && certificateDoc) {
              onDownloadDocument(certificateDoc.id)
            }
            if (certificateAction.actionKind === "generate") {
              onGenerateCertificate(placement.placementId)
            }
          }}
        />
      </div>
    </article>
  )
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground inline-flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}
