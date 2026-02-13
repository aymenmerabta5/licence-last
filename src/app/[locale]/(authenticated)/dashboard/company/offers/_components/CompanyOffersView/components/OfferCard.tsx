"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import {
  Pencil,
  Rocket,
  XCircle,
  Trash2,
  MapPin,
  Clock,
  Users,
  Loader2,
  UserCheck,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"

import type { OfferItem } from "../types"

const STATUS_COLORS: Record<string, string> = {
  draft:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  published:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  closed:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
}

interface OfferCardProps {
  offer: OfferItem
  index: number
  isActionLoading: boolean
  onPublish: () => void
  onClose: () => void
  onDelete: () => void
}

export function OfferCard({
  offer,
  index,
  isActionLoading,
  onPublish,
  onClose,
  onDelete,
}: OfferCardProps) {
  const t = useTranslations("dashboard.company.offers")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.05 * index }}
      className="border border-border p-5 space-y-3"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h3 className="font-serif text-lg text-heading tracking-tight truncate">
            {offer.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[offer.status]}`}
            >
              {t(`status.${offer.status}` as "status.draft")}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 border border-border">
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>
            {offer.workMode && (
              <span className="inline-flex items-center px-2 py-0.5 border border-border">
                {t(`workMode.${offer.workMode}` as "workMode.on_site")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isActionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              {(offer.status === "draft" || offer.status === "published") && (
                <Link
                  href={
                    `/dashboard/company/offers/${offer.id}/edit` as "/dashboard"
                  }
                >
                  <button
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    title={t("actions.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </Link>
              )}
              {offer.status === "draft" && (
                <>
                  <button
                    onClick={onPublish}
                    className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors"
                    title={t("actions.publish")}
                  >
                    <Rocket className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    title={t("actions.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              {offer.status === "published" && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-amber-600 transition-colors"
                  title={t("actions.close")}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {offer.wilayaCode && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {String(offer.wilayaCode).padStart(2, "0")}
          </span>
        )}
        {offer.durationWeeks && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {offer.durationWeeks} {t("weeks")}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {offer.maxPositions} {t("positions")}
        </span>
      </div>

      {/* Skills */}
      {offer.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {offer.skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}

      {/* Candidates link */}
      {offer.status !== "draft" && (
        <Link
          href={
            `/dashboard/company/offers/${offer.id}/candidates` as "/dashboard"
          }
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>
            {offer.candidatesCount}{" "}
            {t("candidates", { count: offer.candidatesCount })}
          </span>
        </Link>
      )}
    </motion.div>
  )
}
