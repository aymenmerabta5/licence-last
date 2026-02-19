"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import { OfferCard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/OfferCard"
import type { OfferRow } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

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
    <section className="relative mt-16 lg:mt-24">
      {/* Decorative vertical line */}
      <div className="absolute top-0 bottom-0 -left-6 w-px bg-border/40 hidden lg:block" />

      {/* Editorial section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b-4 border-foreground">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Curated For You
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tighter text-foreground mb-4 sm:mb-0">
            {labels.title}
            <span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
        <Link href="/dashboard/explore">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-foreground hover:text-background rounded-none border border-transparent hover:border-foreground transition-all duration-300 font-bold uppercase tracking-[0.15em] text-[10px] py-1 h-8 group"
          >
            {labels.exploreAll}{" "}
            <ArrowRight className="h-3 w-3 ms-2 transition-transform duration-500 group-hover:translate-x-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Underlay texture pattern for the grid */}
        <div className="absolute inset-x-0 -inset-y-6 -z-10 bg-[url('data:image/svg+xml;base64,...')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

        {offers.map((offer, i) => (
          <OfferCard key={offer.id} offer={offer} index={i} />
        ))}
      </div>
    </section>
  )
}
