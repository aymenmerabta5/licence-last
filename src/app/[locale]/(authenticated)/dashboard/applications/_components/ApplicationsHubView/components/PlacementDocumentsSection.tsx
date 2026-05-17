"use client"

import { Download, FilePlus, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { AgreementDocItem } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/AgreementDocItem"
import { CertificateDocItem } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/components/CertificateDocItem"
import { CertificateGenerationDialog } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/CertificateGenerationDialog"
import { Button } from "@/components/ui/button"

interface PlacementDocumentsSectionProps {
  placement: {
    placementId: string
    startDate: Date | string
    endDate: Date | string
    validatedAt: Date | string
    validatedByName: string | null
    documents: Array<{
      id: string
      type: "agreement" | "certificate"
      status: string
      verificationCode: string | null
      locale: string
      borderStyle: string
    }>
  }
  downloadingDocumentId: string | null
  onDownload: (documentId: string) => void
  generatingPlacementId: string | null
  onGenerateCertificate: (
    placementId: string,
    locale: string,
    borderStyle: string,
  ) => void
}

export function PlacementDocumentsSection({
  placement,
  downloadingDocumentId,
  onDownload,
  generatingPlacementId,
  onGenerateCertificate,
}: PlacementDocumentsSectionProps) {
  const t = useTranslations("dashboard.applications.hub")
  const locale = useLocale()

  const [dialogOpen, setDialogOpen] = useState(false)

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const formatDate = (value: Date | string) =>
    dateFormatter.format(new Date(value))

  const endDate = new Date(placement.endDate)
  const isInternshipCompleted = endDate <= new Date()

  const agreementDocs = placement.documents.filter(
    (d) => d.type === "agreement",
  )
  const certificateDocs = placement.documents.filter(
    (d) => d.type === "certificate",
  )
  const generatedCertificates = certificateDocs.filter(
    (d) => d.status === "generated",
  )

  const isGenerating = generatingPlacementId === placement.placementId

  const handleDownloadAll = () => {
    for (const doc of generatedCertificates) {
      onDownload(doc.id)
    }
  }

  return (
    <div className="space-y-4 border-t border-border/60 pt-4">
      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {t("document.placementTitle")}
        </h4>
        <p className="text-xs text-muted-foreground">
          {placement.validatedByName
            ? t("document.approvedBy", {
                name: placement.validatedByName,
                date: formatDate(placement.validatedAt),
              })
            : t("document.approvedOn", {
                date: formatDate(placement.validatedAt),
              })}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(placement.startDate)} — {formatDate(placement.endDate)}
        </p>
      </div>

      {/* Agreement documents */}
      {agreementDocs.map((doc) => (
        <AgreementDocItem
          key={doc.id}
          doc={doc}
          downloadingDocumentId={downloadingDocumentId}
          onDownload={onDownload}
        />
      ))}

      {/* Certificate documents */}
      {certificateDocs.length > 0 && (
        <div className="space-y-2">
          {certificateDocs.map((doc) => (
            <CertificateDocItem
              key={doc.id}
              doc={doc}
              downloadingDocumentId={downloadingDocumentId}
              onDownload={onDownload}
            />
          ))}

          {generatedCertificates.length > 1 && (
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              className="gap-1.5"
              onClick={handleDownloadAll}
            >
              <Download className="h-3 w-3" />
              {t("document.downloadAll")}
            </Button>
          )}
        </div>
      )}

      {/* Generate certificate action */}
      {isInternshipCompleted && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="gap-1.5"
            disabled={isGenerating}
            onClick={() => setDialogOpen(true)}
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FilePlus className="h-3.5 w-3.5" />
            )}
            {isGenerating
              ? t("document.generating")
              : t("document.generateCertificate")}
          </Button>
        </div>
      )}

      {!isInternshipCompleted && certificateDocs.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {t("document.certificateAvailableAfter", {
            date: formatDate(placement.endDate),
          })}
        </p>
      )}

      <CertificateGenerationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingVariants={certificateDocs.map((d) => ({
          locale: d.locale,
          borderStyle: d.borderStyle,
        }))}
        onGenerate={(certificateLocale, borderStyle) => {
          onGenerateCertificate(
            placement.placementId,
            certificateLocale,
            borderStyle,
          )
          setDialogOpen(false)
        }}
        isGenerating={isGenerating}
      />
    </div>
  )
}
