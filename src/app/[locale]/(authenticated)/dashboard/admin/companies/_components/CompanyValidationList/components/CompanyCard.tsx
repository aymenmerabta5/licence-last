"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import {
  MapPin,
  Building2,
  Globe,
  User,
  Calendar,
  Check,
  X,
  Mail,
  PauseCircle,
  PlayCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getWilayaName } from "@/lib/wilayas"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  suspended: "bg-orange-500/10 text-orange-600",
}

interface CompanyCardProps {
  company: {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    websiteUrl: string | null
    representativeName: string | null
    contactEmail: string | null
    wilayaCode: number | null
    status: string
    createdAt: Date
  }
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
  isSuspending: boolean
  isReactivating: boolean
}

export function CompanyCard({
  company,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  isApproving,
  isRejecting,
  isSuspending,
  isReactivating,
}: CompanyCardProps) {
  const t = useTranslations("dashboard.admin.companies")

  return (
    <div className="group relative border border-border/50 bg-background transition-all duration-300 hover:border-primary/30 hover:shadow-sm overflow-hidden">
      {/* Top accent line on hover */}
      <div className="absolute top-0 start-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />

      <div className="p-6 sm:p-7 space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover border border-border/30"
                unoptimized
              />
            ) : (
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="font-serif text-lg font-bold text-heading tracking-tight leading-tight">
                {company.name}
              </h3>
              {company.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                  {company.description}
                </p>
              )}
            </div>
          </div>
          <Badge
            className={`shrink-0 px-2.5 py-1 font-bold uppercase tracking-widest text-[9px] border-none rounded-full ${
              STATUS_STYLES[company.status] ?? STATUS_STYLES.pending
            }`}
          >
            {t(`status.${company.status}`)}
          </Badge>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {company.wilayaCode && (
            <InfoField
              icon={MapPin}
              label={t("card.location")}
              value={getWilayaName(company.wilayaCode) ?? `Wilaya ${company.wilayaCode}`}
            />
          )}
          {company.websiteUrl && (
            <InfoField icon={Globe} label={t("card.website")} value={company.websiteUrl} />
          )}
          {company.representativeName && (
            <InfoField icon={User} label={t("card.representative")} value={company.representativeName} />
          )}
          {company.contactEmail && (
            <InfoField icon={Mail} label={t("card.contact")} value={company.contactEmail} />
          )}
          <InfoField
            icon={Calendar}
            label={t("card.registeredAt")}
            value={new Date(company.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        </div>

        {/* Actions */}
        {(company.status === "pending" ||
          company.status === "approved" ||
          company.status === "suspended") && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30">
            {company.status === "pending" ? (
              <>
                <Button
                  type="button"
                  variant="editorial"
                  size="sm"
                  className="h-9 px-5 rounded-lg"
                  disabled={isApproving}
                  onClick={() => onApprove(company.id)}
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
                  onClick={() => onReject(company.id)}
                >
                  <X className="h-3.5 w-3.5 me-1.5" />
                  {t("reject")}
                </Button>
              </>
            ) : null}

            {company.status === "approved" ? (
              <Button
                type="button"
                variant="editorial-outline"
                size="sm"
                className="h-9 px-5 rounded-lg"
                disabled={isSuspending}
                onClick={() => onSuspend(company.id)}
              >
                <PauseCircle className="h-3.5 w-3.5 me-1.5" />
                {t("suspend")}
              </Button>
            ) : null}

            {company.status === "suspended" ? (
              <Button
                type="button"
                variant="editorial"
                size="sm"
                className="h-9 px-5 rounded-lg"
                disabled={isReactivating}
                onClick={() => onReactivate(company.id)}
              >
                <PlayCircle className="h-3.5 w-3.5 me-1.5" />
                {t("reactivate")}
              </Button>
            ) : null}
          </div>
        )}
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
