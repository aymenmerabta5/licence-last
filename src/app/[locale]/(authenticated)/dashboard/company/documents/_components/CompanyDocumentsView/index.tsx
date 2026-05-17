"use client"

import { FilePlus, FileText, Loader2, RefreshCw, Search } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
import { CertificateGenerationDialog } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/CertificateGenerationDialog"
import { PlacementCertificateCard } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementCertificateCard"
import { RevokeCertificateDialog } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/RevokeCertificateDialog"
import { useCompanyDocuments } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/hooks/useCompanyDocuments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function CompanyDocumentsView() {
  const t = useTranslations("dashboard.companyDocuments")
  const { companyMembershipRole } = useDashboard()
  const isOwner = companyMembershipRole === "owner"

  const {
    placements,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    generatingPlacementId,
    downloadingDocumentId,
    revokingDocumentId,
    handleGenerateCertificate,
    handleDownloadDocument,
    handleOpenRevokeDialog,
    handleRevokeCertificate,
    handleGenerateMissing,
    generateDialogOpen,
    setGenerateDialogOpen,
    dialogPlacementId,
    handleOpenGenerateDialog,
    revokeDialogOpen,
    setRevokeDialogOpen,
    searchQuery,
    setSearchQuery,
    isGeneratingMissing,
    sentinelRef,
  } = useCompanyDocuments()

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease }}
          className="h-0.5 bg-primary"
        />

        <div className="space-y-3">
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.1)}
            className="space-y-2"
          >
            <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
              {t("title")}
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-lg">
              {t("subtitle")}
            </p>
          </motion.div>

          {!isLoading && !isError && placements.length > 0 && (
            <motion.div
              {...reveal}
              transition={revealWithDelay(0.15)}
              className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-4"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{t("placementCount", { count: placements.length })}</span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Search + Generate Missing */}
      {!isLoading && !isError && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="ps-9"
              aria-label={t("searchLabel")}
            />
          </div>
          {isOwner && (
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              className="gap-1.5 shrink-0"
              onClick={() => setGenerateDialogOpen(true)}
              disabled={isGeneratingMissing}
            >
              {isGeneratingMissing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FilePlus className="h-3.5 w-3.5" />
              )}
              {isGeneratingMissing
                ? t("generateMissingGenerating")
                : t("generateMissing")}
            </Button>
          )}
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
            {t("loading")}
          </span>
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="gap-1.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("retry")}
          </Button>
        </motion.div>
      )}

      {/* Empty */}
      {!isLoading && !isError && placements.length === 0 && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="border border-dashed border-border/60 p-12 text-center space-y-4"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
            <FileText className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-lg text-heading">
              {t("noDocumentsTitle")}
            </p>
            <p className="text-sm font-light text-muted-foreground max-w-sm mx-auto">
              {t("empty")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Placement cards */}
      {!isLoading && !isError && placements.length > 0 && (
        <div className="space-y-5">
          {placements.map((placement, index) => (
            <motion.div
              key={placement.placementId}
              {...reveal}
              transition={{ duration: 0.6, ease, delay: 0.06 * index }}
            >
              <PlacementCertificateCard
                placement={placement}
                companyMembershipRole={companyMembershipRole}
                generatingPlacementId={generatingPlacementId}
                downloadingDocumentId={downloadingDocumentId}
                revokingDocumentId={revokingDocumentId}
                onDownloadDocument={handleDownloadDocument}
                onOpenGenerateDialog={handleOpenGenerateDialog}
                onOpenRevokeDialog={handleOpenRevokeDialog}
              />
            </motion.div>
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Fetching next page indicator */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t("loading")}
              </span>
            </div>
          )}
        </div>
      )}

      <CertificateGenerationDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        existingVariants={
          dialogPlacementId
            ? (placements
                .find((p) => p.placementId === dialogPlacementId)
                ?.documents.filter((d) => d.type === "certificate")
                .map((d) => ({
                  locale: d.locale,
                  borderStyle: d.borderStyle,
                })) ?? [])
            : []
        }
        onGenerate={(certificateLocale, borderStyle) => {
          if (dialogPlacementId) {
            handleGenerateCertificate(
              dialogPlacementId,
              certificateLocale,
              borderStyle,
            )
          } else {
            handleGenerateMissing(certificateLocale, borderStyle)
          }
        }}
        isGenerating={generatingPlacementId !== null || isGeneratingMissing}
      />

      <RevokeCertificateDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        onConfirm={handleRevokeCertificate}
        isRevoking={revokingDocumentId !== null}
      />
    </div>
  )
}
