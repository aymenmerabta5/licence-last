"use client"

import { useTranslations } from "next-intl"

import type { OfferStatusFilter } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STATUS_FILTERS: OfferStatusFilter[] = [
  "all",
  "draft",
  "published",
  "closed",
]

interface CompanyOffersFiltersProps {
  searchQuery: string
  statusFilter: OfferStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: OfferStatusFilter) => void
}

export function CompanyOffersFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: CompanyOffersFiltersProps) {
  const t = useTranslations("dashboard.company.offers")
  const tStatusFilter = useTranslations(
    "dashboard.company.candidates.statusFilter",
  )

  return (
    <div className="space-y-3 border border-border/40 p-4 sm:p-5">
      <label htmlFor="company-offers-search" className="sr-only">
        {t("form.title")}
      </label>
      <Input
        id="company-offers-search"
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={`${t("form.title")}...`}
        autoComplete="off"
      />

      <div
        role="group"
        aria-label={t("pageTitle")}
        className="flex flex-wrap items-center gap-1.5"
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter
          const label =
            filter === "all"
              ? tStatusFilter("all")
              : t(`status.${filter}` as "status.draft")

          return (
            <Button
              key={filter}
              type="button"
              size="sm"
              variant={isActive ? "secondary" : "outline"}
              aria-pressed={isActive}
              onClick={() => onStatusChange(filter)}
              className="rounded-none text-[10px] font-bold uppercase tracking-[0.15em] [[dir=rtl]_&]:tracking-normal"
            >
              {label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
