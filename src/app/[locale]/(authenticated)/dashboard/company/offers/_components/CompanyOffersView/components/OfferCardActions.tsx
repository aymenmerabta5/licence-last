"use client"

import { Loader2, Pencil, Rocket, Trash2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"

interface OfferCardActionsProps {
  offerId: string
  status: string
  isActionLoading: boolean
  onPublish: () => void
  onClose: () => void
  onDelete: () => void
}

export function OfferCardActions({
  offerId,
  status,
  isActionLoading,
  onPublish,
  onClose,
  onDelete,
}: OfferCardActionsProps) {
  const t = useTranslations("dashboard.company.offers")
  const showEdit = status === "draft" || status === "published"

  return (
    <div className="flex shrink-0 items-center gap-1">
      {isActionLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          {showEdit && (
            <Link
              href={`/dashboard/company/offers/${offerId}/edit` as "/dashboard"}
            >
              <button
                type="button"
                title={t("actions.edit")}
                className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-primary/5 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </Link>
          )}

          {status === "draft" && (
            <>
              <button
                type="button"
                onClick={onPublish}
                title={t("actions.publish")}
                className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-emerald-500/5 hover:text-emerald-600"
              >
                <Rocket className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title={t("actions.delete")}
                className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-destructive/5 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          {status === "published" && (
            <button
              type="button"
              onClick={onClose}
              title={t("actions.close")}
              className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-amber-500/5 hover:text-amber-600"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  )
}
