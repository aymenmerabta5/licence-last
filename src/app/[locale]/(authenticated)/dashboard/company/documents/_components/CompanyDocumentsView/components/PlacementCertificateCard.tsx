"use client"

import {
  Briefcase,
  Calendar,
  FilePlus,
  GraduationCap,
  Mail,
  ShieldX,
} from "lucide-react"
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
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

function toMetaRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

interface PlacementCertificateCardProps {
  placement: CompanyPlacementDocumentSummary
  companyMembershipRole?: string | null
  generatingPlacementId: string | null
  downloadingDocumentId: string | null
  revokingDocumentId: string | null
  onDownloadDocument: (documentId: string) => void
  onOpenGenerateDialog: (placementId: string) => void
  onOpenRevokeDialog?: (documentId: string) => void
}

export function PlacementCertificateCard({
  placement,
  companyMembershipRole = null,
  generatingPlacementId,
  downloadingDocumentId,
  revokingDocumentId,
  onDownloadDocument,
  onOpenGenerateDialog,
  onOpenRevokeDialog,
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

  const endDate = new Date(placement.endDate)
  const isInternshipCompleted = endDate <= new Date()
  const formattedEndDate = dateFormatter.format(endDate)

  const agreementDoc =
    placement.documents.find((doc) => doc.type === "agreement") ?? null
  const certificateDocs = placement.documents.filter(
    (doc) => doc.type === "certificate",
  )
  const isGenerating = generatingPlacementId === placement.placementId
  const isAgreementDownloading = agreementDoc
    ? downloadingDocumentId === agreementDoc.id
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

  const certificateDisabledReason = !isInternshipCompleted
    ? t("certificateAvailableAfter", { date: formattedEndDate })
    : undefined

  const isOwner = companyMembershipRole === "owner"

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
            value={formattedEndDate}
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

        {/* Certificate panels */}
        {certificateDocs.length > 0 ? (
          <div className="space-y-3">
            {certificateDocs.map((doc) => {
              const meta = toMetaRecord(doc.meta)
              const revokedAt =
                typeof meta.revokedAt === "string" ? meta.revokedAt : undefined
              const isRevoked = !!revokedAt
              const isCertificateDownloading = downloadingDocumentId === doc.id
              const isCertificateRevoking = revokingDocumentId === doc.id

              const certificateAction = getReadonlyDocumentActionState(
                doc.status,
                isCertificateDownloading,
                {
                  download: t("download"),
                  downloading: t("downloading"),
                  pending: t("status.pending"),
                  failed: t("status.failed"),
                },
                isRevoked,
              )

              const title = isRevoked
                ? `${t("certificate")} \u00b7 ${doc.locale.toUpperCase()} \u00b7 ${t(`border.${doc.borderStyle}`)}`
                : `${t("certificate")} \u00b7 ${doc.locale.toUpperCase()} \u00b7 ${t(`border.${doc.borderStyle}`)}`

              return (
                <PlacementDocumentPanel
                  key={doc.id}
                  title={title}
                  statusLabel={
                    isRevoked
                      ? t("status.revoked")
                      : t(`status.${doc.status}` as "status.pending")
                  }
                  statusClassName={
                    isRevoked ? STATUS_STYLES.revoked : STATUS_STYLES[doc.status]
                  }
                  verificationCodeLabel={t("placement.verificationCode")}
                  verificationCode={
                    isRevoked ? null : doc.verificationCode
                  }
                  notAvailableLabel={t("placement.notAvailable")}
                  actionVariant={certificateAction.actionVariant}
                  actionLabel={certificateAction.actionLabel}
                  actionLoadingLabel={certificateAction.actionLoadingLabel}
                  showDownloadIcon={certificateAction.showDownloadIcon}
                  isActionLoading={
                    isCertificateDownloading || isCertificateRevoking
                  }
                  isActionDisabled={certificateAction.isActionDisabled}
                  onAction={() => {
                    if (
                      !isRevoked &&
                      certificateAction.actionKind === "download" &&
                      doc.status === "generated"
                    ) {
                      onDownloadDocument(doc.id)
                    }
                  }}
                  extraActions={
                    isOwner && !isRevoked && doc.status === "generated"
                      ? [
                          {
                            label: t("revoke"),
                            variant: "ghost" as const,
                            icon: ShieldX,
                            isLoading: isCertificateRevoking,
                            onClick: () => onOpenRevokeDialog?.(doc.id),
                          },
                        ]
                      : undefined
                  }
                />
              )
            })}
          </div>
        ) : (
          (() => {
            const emptyCertificateAction = getCertificateActionState({
              status: "notGenerated",
              isOwner,
              isLoading: isGenerating,
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

            const canGenerate =
              isInternshipCompleted &&
              emptyCertificateAction.actionKind === "generate"

            return (
              <PlacementDocumentPanel
                title={t("certificate")}
                statusLabel={t("status.notGenerated")}
                statusClassName={STATUS_STYLES.notGenerated}
                verificationCodeLabel={t("placement.verificationCode")}
                verificationCode={null}
                notAvailableLabel={t("placement.notAvailable")}
                actionVariant={emptyCertificateAction.actionVariant}
                actionLabel={emptyCertificateAction.actionLabel}
                actionLoadingLabel={emptyCertificateAction.actionLoadingLabel}
                showDownloadIcon={emptyCertificateAction.showDownloadIcon}
                isActionLoading={
                  emptyCertificateAction.actionKind === "generate"
                    ? isGenerating
                    : false
                }
                isActionDisabled={
                  emptyCertificateAction.isActionDisabled || !canGenerate
                }
                disabledReason={certificateDisabledReason}
                onAction={() => {
                  if (emptyCertificateAction.actionKind === "generate") {
                    onOpenGenerateDialog(placement.placementId)
                  }
                }}
              />
            )
          })()
        )}

        {/* Generate New Version button */}
        {isOwner && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <span
                    {...props}
                    className="inline-block cursor-not-allowed"
                    onClick={(e) => {
                      if (!isInternshipCompleted) e.preventDefault()
                    }}
                  >
                    <Button
                      type="button"
                      variant="editorial-outline"
                      size="editorial-sm"
                      className="gap-1.5"
                      onClick={() => onOpenGenerateDialog(placement.placementId)}
                      disabled={isGenerating || !isInternshipCompleted}
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                      {t("generateNewVersion")}
                    </Button>
                  </span>
                )}
              />
              {certificateDisabledReason && (
                <TooltipContent>
                  <p>{certificateDisabledReason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
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
