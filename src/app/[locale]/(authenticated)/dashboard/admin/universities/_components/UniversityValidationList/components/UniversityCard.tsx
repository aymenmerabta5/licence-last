"use client"

import { useTranslations } from "next-intl"
import {
  MapPin,
  Building2,
  Globe,
  Check,
  X,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
}

interface UniversityCardProps {
  university: UniversityListItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (university: UniversityListItem) => void
  onDelete: (university: UniversityListItem) => void
  isApproving: boolean
  isRejecting: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export function UniversityCard({
  university,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  isApproving,
  isRejecting,
  isUpdating,
  isDeleting,
}: UniversityCardProps) {
  const t = useTranslations("dashboard.admin.universities")

  return (
    <div className="group relative border border-border/50 bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-sm overflow-hidden">
      {/* Top accent line on hover */}
      <div className="absolute top-0 start-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />

      <div className="p-6 sm:p-7 space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-heading tracking-tight leading-tight">
                  {university.name}
                  {university.abbreviation && (
                    <span className="text-muted-foreground/50 font-normal ms-1.5 text-sm">
                      ({university.abbreviation})
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </div>
          <Badge
            className={`shrink-0 px-2.5 py-1 font-bold uppercase tracking-widest text-[9px] border-none rounded-full ${
              STATUS_STYLES[university.status] ?? STATUS_STYLES.pending
            }`}
          >
            {t(`status.${university.status}`)}
          </Badge>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {university.city && (
            <InfoField icon={MapPin} label={t("card.location")} value={university.city} />
          )}
          {university.departmentName && (
            <InfoField icon={Globe} label={t("card.department")} value={university.departmentName} />
          )}
          <InfoField
            icon={Calendar}
            label={t("card.registeredAt")}
            value={new Date(university.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        </div>

        {/* Review actions */}
        {university.status === "pending" && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30">
            <Button
              type="button"
              variant="editorial"
              size="sm"
              className="h-9 px-5 rounded-lg"
              disabled={isApproving}
              onClick={() => onApprove(university.id)}
            >
              <Check className="h-3.5 w-3.5 me-1.5" />
              {t("approve")}
            </Button>
            <Button
              type="button"
              variant="editorial-outline"
              size="sm"
              className="h-9 px-5 rounded-lg"
              disabled={isRejecting}
              onClick={() => onReject(university.id)}
            >
              <X className="h-3.5 w-3.5 me-1.5" />
              {t("reject")}
            </Button>
          </div>
        )}

        {/* Management actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-5 rounded-lg"
            disabled={isUpdating}
            onClick={() => onEdit(university)}
          >
            <Pencil className="h-3.5 w-3.5 me-1.5" />
            {t("edit")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-9 px-5 rounded-lg"
            disabled={isDeleting}
            onClick={() => onDelete(university)}
          >
            <Trash2 className="h-3.5 w-3.5 me-1.5" />
            {t("delete")}
          </Button>
        </div>
      </div>
    </div>
  )
}

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 font-bold mb-0.5 [[dir=rtl]_&]:tracking-normal">
          {label}
        </p>
        <p className="text-xs font-medium text-heading truncate">
          {value}
        </p>
      </div>
    </div>
  )
}
