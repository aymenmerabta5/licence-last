"use client"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { OfferRow } from "../types"
import { OfferCard } from "./OfferCard"

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
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-heading">
          {labels.title}
        </h2>
        <Link href="/dashboard/explore">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 group text-xs font-bold uppercase tracking-widest"
          >
            {labels.exploreAll}{" "}
            <ArrowRight className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  )
}
