"use client"

import { useMemo, useState } from "react"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { CompanyOffersEmptyState } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/CompanyOffersEmptyState"
import { CompanyOffersFilters } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/CompanyOffersFilters"
import { CompanyOffersHeader } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/CompanyOffersHeader"
import { OfferCard } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCard"
import { TrustBanner } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/TrustBanner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCompanyOffers } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/hooks/useCompanyOffers"
import type { OfferStatusFilter } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/types"

export function CompanyOffersView({
  canManageStatus,
}: {
  canManageStatus: boolean
}) {
  const t = useTranslations("dashboard.company.offers")
  const {
    offers,
    isLoading,
    trustData,
    actionLoading,
    handlePublish,
    handleClose,
    handleDelete,
  } = useCompanyOffers()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OfferStatusFilter>("all")
  const [confirmInfo, setConfirmInfo] = useState<{
    offerId: string
    type: "close" | "delete"
  } | null>(null)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredOffers = useMemo(
    () =>
      offers.filter((offer) => {
        if (statusFilter !== "all" && offer.status !== statusFilter) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        const description =
          "description" in offer && typeof offer.description === "string"
            ? offer.description
            : ""

        return `${offer.title} ${description}`
          .toLowerCase()
          .includes(normalizedQuery)
      }),
    [offers, normalizedQuery, statusFilter],
  )
  const hasOffers = offers.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CompanyOffersHeader />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && trustData && <TrustBanner data={trustData} />}
      {!isLoading && !hasOffers && <CompanyOffersEmptyState />}

      {!isLoading && hasOffers && (
        <>
          <CompanyOffersFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
              {filteredOffers.length} offer
              {filteredOffers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {filteredOffers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={index}
                canManageStatus={canManageStatus}
                isActionLoading={actionLoading === offer.id}
                onPublish={() => handlePublish(offer.id)}
                onClose={() =>
                  setConfirmInfo({ offerId: offer.id, type: "close" })
                }
                onDelete={() =>
                  setConfirmInfo({ offerId: offer.id, type: "delete" })
                }
              />
            ))}
          </div>

          <AlertDialog
            open={!!confirmInfo}
            onOpenChange={(open) => !open && setConfirmInfo(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirmInfo?.type === "close"
                    ? t("actions.close")
                    : t("actions.delete")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmInfo?.type === "close"
                    ? t("actions.confirmClose")
                    : t("actions.confirmDelete")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (confirmInfo) {
                      if (confirmInfo.type === "close") {
                        handleClose(confirmInfo.offerId)
                      } else {
                        handleDelete(confirmInfo.offerId)
                      }
                      setConfirmInfo(null)
                    }
                  }}
                  className={
                    confirmInfo?.type === "delete"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : ""
                  }
                >
                  {confirmInfo?.type === "close"
                    ? t("actions.close")
                    : t("actions.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
