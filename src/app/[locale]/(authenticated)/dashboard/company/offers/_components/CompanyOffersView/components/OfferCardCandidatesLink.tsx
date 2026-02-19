"use client"

import { ArrowRight, UserCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"

interface OfferCardCandidatesLinkProps {
  offerId: string
  candidatesCount: number
}

export function OfferCardCandidatesLink({
  offerId,
  candidatesCount,
}: OfferCardCandidatesLinkProps) {
  const t = useTranslations("dashboard.company.offers")

  return (
    <Link
      href={`/dashboard/company/offers/${offerId}/candidates` as "/dashboard"}
      className="group/link inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      <UserCheck className="h-3.5 w-3.5" />
      <span>
        <span className="font-serif text-sm font-bold text-heading">{candidatesCount}</span>{" "}
        {t("candidates", { count: candidatesCount })}
      </span>
      <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100 [[dir=rtl]_&]:rotate-180" />
    </Link>
  )
}
