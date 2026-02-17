"use client"

import { useMemo } from "react"
import { Download, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

interface PlacementCertificateCardProps {
  placement: {
    placementId: string
    offerTitle: string
    internshipType: string
    studentName: string | null
    studentEmail: string
    startDate: Date | string
    endDate: Date | string
    validatedAt: Date | string
    documents: Array<{
      id: string
      type: "agreement" | "certificate"
      status: "pending" | "generated" | "failed"
      verificationCode: string | null
      createdAt: Date | string
    }>
  }
  generatingPlacementId: string | null
  downloadingDocumentId: string | null
  onGenerateCertificate: (placementId: string) => void
  onDownloadDocument: (documentId: string) => void
}

const STATUS_STYLES: Record<string, string> = {
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
          <Badge variant="editorial-outline">
            {INTERNSHIP_TYPE_LABELS[placement.internshipType] ??
              placement.internshipType}
          </Badge>
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
            <dd className="text-foreground">
              {INTERNSHIP_TYPE_LABELS[placement.internshipType] ??
                placement.internshipType}
            </dd>
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
          {agreementDoc && (
            <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-heading">
                    {t("agreement")}
                  </p>
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[agreementDoc.status] ?? ""}
                  >
                    {t(`status.${agreementDoc.status}` as "status.pending")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("placement.verificationCode")}:{" "}
                  {agreementDoc.verificationCode ?? t("placement.notAvailable")}
                </p>
              </div>
              <div className="flex items-center justify-start md:justify-end">
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDownloadDocument(agreementDoc.id)}
                  disabled={agreementDoc.status !== "generated" || isAgreementDownloading}
                >
                  {isAgreementDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {isAgreementDownloading ? t("downloading") : t("download")}
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-heading">
                  {t("certificate")}
                </p>
                <Badge
                  variant="outline"
                  className={
                    STATUS_STYLES[certificateDoc?.status ?? "notGenerated"] ?? ""
                  }
                >
                  {certificateDoc
                    ? t(`status.${certificateDoc.status}` as "status.pending")
                    : t("status.notGenerated")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("placement.verificationCode")}:{" "}
                {certificateDoc?.verificationCode ?? t("placement.notAvailable")}
              </p>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              {certificateDoc?.status === "generated" ? (
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDownloadDocument(certificateDoc.id)}
                  disabled={isCertificateDownloading}
                >
                  {isCertificateDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {isCertificateDownloading ? t("downloading") : t("download")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="editorial"
                  size="sm"
                  onClick={() => onGenerateCertificate(placement.placementId)}
                  disabled={isGenerating}
                  className="gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  {isGenerating ? t("generating") : t("generate")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
