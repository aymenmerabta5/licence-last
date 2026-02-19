"use client"

import { Download, Loader2, MessageSquarePlus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"

interface PlacementDocumentCardProps {
  placement: {
    placementId: string
    offerTitle: string
    internshipType: string
    companyName: string
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
  downloadingDocumentId: string | null
  onDownload: (documentId: string) => void
  onOpenFeedback: (placement: {
    placementId: string
    companyName: string
    offerTitle: string
  }) => void
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  generated: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
}

export function PlacementDocumentCard({
  placement,
  downloadingDocumentId,
  onDownload,
  onOpenFeedback,
}: PlacementDocumentCardProps) {
  const locale = useLocale()
  const t = useTranslations("dashboard.documents")

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  )

  return (
    <Card className="border border-border bg-background">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t("placement.company")}
            </p>
            <CardTitle className="font-serif text-xl text-heading">
              {placement.companyName}
            </CardTitle>
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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">
            {t("feedback.ctaDescription")}
          </p>
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              onOpenFeedback({
                placementId: placement.placementId,
                companyName: placement.companyName,
                offerTitle: placement.offerTitle,
              })
            }
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {t("feedback.ctaLabel")}
          </Button>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          {placement.documents.map((doc) => {
            const isDownloading = downloadingDocumentId === doc.id

            return (
              <div
                key={doc.id}
                className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_auto]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-heading">
                      {t(doc.type)}
                    </p>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[doc.status] ?? ""}
                    >
                      {t(`status.${doc.status}` as "status.pending")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("placement.verificationCode")}:{" "}
                    {doc.verificationCode ?? t("placement.notAvailable")}
                  </p>
                </div>

                <div className="flex items-center justify-start md:justify-end">
                  <Button
                    type="button"
                    variant="editorial-outline"
                    size="sm"
                    onClick={() => onDownload(doc.id)}
                    disabled={isDownloading}
                    className="gap-1.5"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {isDownloading ? t("downloading") : t("download")}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
