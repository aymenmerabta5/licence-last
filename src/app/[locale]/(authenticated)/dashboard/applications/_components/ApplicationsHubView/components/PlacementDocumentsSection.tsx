"use client"

import { Download, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
}

export function PlacementDocumentsSection({
  placement,
  downloadingDocumentId,
  onDownload,
}: PlacementDocumentsSectionProps) {
  const t = useTranslations("dashboard.applications.hub")
  const tPlacementDocs = useTranslations("dashboard.placementDocuments")
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

  const formatDate = (value: Date | string) =>
    dateFormatter.format(new Date(value))

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

      <div className="space-y-2">
        {placement.documents.map((doc) => {
          const isDownloading = downloadingDocumentId === doc.id
          const canDownload = doc.status === "generated" && !isDownloading

          return (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 border border-border/60 px-3 py-2.5 transition-colors hover:border-foreground/20"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-xs font-medium text-foreground">
                  {t(`document.type.${doc.type}`)}
                </span>
                {doc.type === "certificate" && (
                  <span className="text-[10px] text-muted-foreground">
                    {tPlacementDocs("certificateVersion", { language: doc.locale, border: doc.borderStyle })}
                  </span>
                )}
                <Badge
                  variant="editorial-muted"
                  className={cn(
                    doc.status === "generated" &&
                      "text-emerald-600 dark:text-emerald-400",
                    doc.status === "pending" &&
                      "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {t(`status.${doc.status}`)}
                </Badge>
                {doc.verificationCode && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {doc.verificationCode}
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="editorial-outline"
                size="editorial-sm"
                disabled={!canDownload}
                className="gap-1.5"
                onClick={() => onDownload(doc.id)}
              >
                {isDownloading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                {isDownloading
                  ? t("document.downloading")
                  : t("document.download")}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
