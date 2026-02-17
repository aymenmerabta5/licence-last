"use client"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { OfferRow } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { OfferCard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/OfferCard"

interface RecommendedOffersProps {
  offers: OfferRow[]
  labels: {
    title: string
    exploreAll: string
  }
}

export function RecommendedOffers({ offers, labels }: RecommendedOffersProps) {
  if (offers.length === 0) return null

  return (
    <section>
      {/* Editorial section header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-foreground dark:border-foreground/15 mb-6">
        <h2 className="font-serif text-xl font-bold text-heading">
          {labels.title}
        </h2>
        <Link href="/dashboard/explore">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 group text-[9px] font-bold uppercase tracking-[0.15em] [[dir=rtl]_&]:tracking-normal"
          >
            {labels.exploreAll}{" "}
            <ArrowRight className="h-3.5 w-3.5 ms-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border/40">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  )
}
