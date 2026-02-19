"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import {
  MapPin,
  Building2,
  Globe,
  User,
  Calendar,
  Mail,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { CompanyCardActions } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyCardActions"
import { getWilayaName } from "@/lib/wilayas"
import { CompanyInfoField } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyInfoField"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  suspended: "bg-orange-500/10 text-orange-600",
}

interface CompanyCardProps {
  company: CompanyListItem
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
      <div className="absolute top-0 start-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />

      <div className="p-6 sm:p-7 space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {company.wilayaCode && (
            <CompanyInfoField
              icon={MapPin}
              label={t("card.location")}
              value={getWilayaName(company.wilayaCode) ?? `Wilaya ${company.wilayaCode}`}
            />
          )}
          {company.websiteUrl && (
            <CompanyInfoField
              icon={Globe}
              label={t("card.website")}
              value={company.websiteUrl}
            />
          )}
          {company.representativeName && (
            <CompanyInfoField
              icon={User}
              label={t("card.representative")}
              value={company.representativeName}
            />
          )}
          {company.contactEmail && (
            <CompanyInfoField
              icon={Mail}
              label={t("card.contact")}
              value={company.contactEmail}
            />
          )}
          <CompanyInfoField
            icon={Calendar}
            label={t("card.registeredAt")}
            value={new Date(company.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
        </div>

        <CompanyCardActions
          companyId={company.id}
          status={company.status}
          isApproving={isApproving}
          isRejecting={isRejecting}
          isSuspending={isSuspending}
          isReactivating={isReactivating}
          onApprove={onApprove}
          onReject={onReject}
          onSuspend={onSuspend}
          onReactivate={onReactivate}
          t={t}
        />
      </div>
    </div>
  )
}
