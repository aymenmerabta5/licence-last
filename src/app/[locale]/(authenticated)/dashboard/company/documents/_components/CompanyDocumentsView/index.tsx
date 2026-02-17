"use client"

import * as motion from "motion/react-client"
import { Loader2, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { PlacementCertificateCard } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementCertificateCard"
import { useCompanyDocuments } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/hooks/useCompanyDocuments"

export function CompanyDocumentsView() {
  const t = useTranslations("dashboard.companyDocuments")
  const {
    placements,
    isLoading,
    isError,
    refetch,
    generatingPlacementId,
    downloadingDocumentId,
    handleGenerateCertificate,
    handleDownloadDocument,
  } = useCompanyDocuments()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          {t("subtitle")}
        </p>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && isError && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-4 border border-dashed border-border px-6 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            className="gap-1.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("retry")}
          </Button>
        </motion.div>
      )}

      {!isLoading && !isError && placements.length === 0 && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground"
        >
          {t("empty")}
        </motion.div>
      )}

      {!isLoading && !isError && placements.length > 0 && (
        <div className="space-y-4">
          {placements.map((placement, index) => (
            <motion.div
              key={placement.placementId}
              {...reveal}
              transition={{ duration: 0.6, ease, delay: 0.06 * index }}
            >
              <PlacementCertificateCard
                placement={placement}
                generatingPlacementId={generatingPlacementId}
                downloadingDocumentId={downloadingDocumentId}
                onGenerateCertificate={handleGenerateCertificate}
                onDownloadDocument={handleDownloadDocument}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
