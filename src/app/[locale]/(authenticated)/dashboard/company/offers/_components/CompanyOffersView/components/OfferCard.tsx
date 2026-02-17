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
  ArrowRight,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"

import type { OfferItem } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/types"

const STATUS_CONFIG: Record<string, { label: string; accent: string; bg: string; badge: string }> = {
  draft: {
    label: "Draft",
    accent: "border-s-amber-500",
    bg: "hover:bg-amber-500/[0.02]",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  published: {
    label: "Live",
    accent: "border-s-emerald-500",
    bg: "hover:bg-emerald-500/[0.02]",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    accent: "border-s-zinc-400",
    bg: "hover:bg-zinc-400/[0.02]",
    badge: "bg-zinc-400/10 text-zinc-500 border-zinc-400/20",
  },
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
  const config = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.draft

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease, delay: 0.05 * index }}
      className={cn(
        "group border border-border/50 border-s-4 p-5 sm:p-6 transition-all",
        config.accent,
        config.bg,
      )}
    >
      {/* Top row: Title + badges + actions */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-serif text-lg text-heading tracking-tight leading-tight">
              {offer.title}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "text-[8px] font-bold uppercase tracking-widest px-2 py-0 h-5 shrink-0",
                config.badge,
              )}
            >
              {t(`status.${offer.status}` as "status.draft")}
            </Badge>
          </div>

          {/* Type + work mode row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>
            {offer.workMode && (
              <>
                <span className="text-muted-foreground/20">·</span>
                <span className="text-[10px] font-medium text-muted-foreground/50">
                  {t(`workMode.${offer.workMode}` as "workMode.on_site")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
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
                    className="p-2 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
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
                    className="p-2 text-muted-foreground/40 hover:text-emerald-600 hover:bg-emerald-500/5 rounded-lg transition-all"
                    title={t("actions.publish")}
                  >
                    <Rocket className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                    title={t("actions.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              {offer.status === "published" && (
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground/40 hover:text-amber-600 hover:bg-amber-500/5 rounded-lg transition-all"
                  title={t("actions.close")}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Meta info bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/60 mb-4">
        {offer.wilayaCode && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary/40" />
            {String(offer.wilayaCode).padStart(2, "0")}
          </span>
        )}
        {offer.durationWeeks && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary/40" />
            {offer.durationWeeks} {t("weeks")}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3 w-3 text-primary/40" />
          {offer.maxPositions} {t("positions")}
        </span>
      </div>

      {/* Skills */}
      {offer.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {offer.skills.map((skill) => (
            <Badge
              key={skill.id}
              variant="secondary"
              className="bg-primary/5 text-primary/80 rounded-full text-[10px] font-medium px-2.5 py-0.5"
            >
              {skill.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Bottom: Candidates link */}
      {offer.status !== "draft" && (
        <div className="pt-3 border-t border-border/30">
          <Link
            href={
              `/dashboard/company/offers/${offer.id}/candidates` as "/dashboard"
            }
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group/link"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>
              <span className="font-serif text-sm font-bold text-heading">
                {offer.candidatesCount}
              </span>{" "}
              {t("candidates", { count: offer.candidatesCount })}
            </span>
            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all [[dir=rtl]_&]:rotate-180" />
          </Link>
        </div>
      )}
    </motion.div>
  )
}
