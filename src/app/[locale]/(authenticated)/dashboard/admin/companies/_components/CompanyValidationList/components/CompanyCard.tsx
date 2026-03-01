"use client"

import {
  Building2,
  Calendar,
  FileCheck2,
  Globe,
  Mail,
  MapPin,
  User,
} from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"
import { CompanyCardActionPanel } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/components/CompanyCardActionPanel"
import { Badge } from "@/components/ui/badge"
import { getWilayaName } from "@/lib/wilayas"

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  suspended:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
}

interface CompanyCardProps {
  company: CompanyListItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  onDownloadVerificationDocument: (id: string) => void
  onDelete: (company: CompanyListItem) => void
  isApproving: boolean
  isRejecting: boolean
  isSuspending: boolean
  isReactivating: boolean
  isDownloadingVerificationDocument: boolean
  isDeleting: boolean
}

export function CompanyCard({
  company,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onDownloadVerificationDocument,
  onDelete,
  isApproving,
  isRejecting,
  isSuspending,
  isReactivating,
  isDownloadingVerificationDocument,
  isDeleting,
}: CompanyCardProps) {
  const t = useTranslations("dashboard.admin.companies")

  return (
    <div className="group relative border-b border-border/50 bg-background transition-colors hover:bg-muted/5">
      <div className="py-6 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  className={`shrink-0 px-2 py-0.5 rounded-sm font-semibold uppercase tracking-widest text-[10px] border-none ${
                    STATUS_STYLES[company.status] ?? STATUS_STYLES.pending
                  }`}
                >
                  {t(`status.${company.status}`)}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={company.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-sm object-cover border border-border/40 shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-muted/20 border border-border/40 shrink-0 text-muted-foreground/50">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-heading tracking-tight">
                    {company.name}
                  </h3>
                  {company.description && (
                    <p className="text-sm text-muted-foreground font-light line-clamp-1 max-w-xl">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground/80 mt-2">
              {company.wilayaCode && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {getWilayaName(company.wilayaCode) ??
                      `Wilaya ${company.wilayaCode}`}
                  </span>
                </div>
              )}
              {company.websiteUrl && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{company.websiteUrl}</span>
                </div>
              )}
              {company.representativeName && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{company.representativeName}</span>
                </div>
              )}
              {company.contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{company.contactEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(company.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>
                  {t("card.verificationDocument")}:{" "}
                  {company.verificationDocumentName
                    ? t("card.verificationDocumentUploaded")
                    : t("card.verificationDocumentMissing")}
                </span>
              </div>
            </div>
          </div>

          <CompanyCardActionPanel
            companyId={company.id}
            companyStatus={company.status}
            isApproving={isApproving}
            isRejecting={isRejecting}
            isSuspending={isSuspending}
            isReactivating={isReactivating}
            hasVerificationDocument={Boolean(company.verificationDocumentName)}
            isDownloadingVerificationDocument={isDownloadingVerificationDocument}
            onDownloadVerificationDocument={() =>
              onDownloadVerificationDocument(company.id)
            }
            isDeleting={isDeleting}
            onApprove={onApprove}
            onReject={onReject}
            onSuspend={onSuspend}
            onReactivate={onReactivate}
            onDelete={() => onDelete(company)}
            t={t}
          />
        </div>
      </div>
    </div>
  )
}
