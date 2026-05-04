"use client"

import { Download, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CertificateDocItemProps {
  doc: {
    id: string
    type: "agreement" | "certificate"
    status: string
    verificationCode: string | null
    locale: string
    borderStyle: string
  }
  downloadingDocumentId: string | null
  onDownload: (documentId: string) => void
}

export function CertificateDocItem({
  doc,
  downloadingDocumentId,
  onDownload,
}: CertificateDocItemProps) {
  const t = useTranslations("dashboard.applications.hub")
  const tPlacementDocs = useTranslations("dashboard.placementDocuments")
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
        <span className="text-[10px] text-muted-foreground">
          {tPlacementDocs("certificateVersion", {
            language: doc.locale,
            border: doc.borderStyle,
          })}
        </span>
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
        {isDownloading ? t("document.downloading") : t("document.download")}
      </Button>
    </div>
  )
}
