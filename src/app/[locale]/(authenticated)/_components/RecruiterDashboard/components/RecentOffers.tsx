"use client"

import { ArrowRight, Briefcase, Users } from "lucide-react"
import * as motion from "motion/react-client"
import type { Route } from "next"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

interface Offer {
  id: string
  title: string
  status: "draft" | "published" | "closed"
  internshipType: string
  candidatesCount: number
  createdAt: Date
}

const TYPE_LABELS: Record<string, string> = {
  pfe: "PFE",
  immersion: "Immersion",
  summer: "Summer",
  practical: "Practical",
}

interface RecentOffersProps {
  offers: Offer[]
}

export function RecentOffers({ offers }: RecentOffersProps) {
  if (offers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease }}
        className="space-y-4"
      >
        <div className="flex items-end justify-between border-b-4 border-foreground pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
              Positions
            </span>
            <h2 className="font-serif text-3xl font-normal text-foreground tracking-tighter">
              Your Offers<span className="text-primary/40 leading-none">.</span>
            </h2>
          </div>
        </div>
        <div className="text-center py-20 border-2 border-dashed border-border/80 bg-background flex flex-col items-center justify-center relative group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-[0.03] mix-blend-overlay pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500" />
          <div className="mb-6 h-16 w-16 border border-border/80 bg-background flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-[4px_4px_0_0_oklch(var(--primary)_/_0.4)]">
            <Briefcase className="h-6 w-6 text-foreground/40" />
          </div>
          <h3 className="font-serif text-2xl text-foreground mb-3 relative z-10">
            No Offers Yet
          </h3>
          <p className="text-xs text-foreground/50 font-medium max-w-sm relative z-10">
            Post your first internship position.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease }}
      className="space-y-8 relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-4 border-foreground pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            Positions
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tighter text-foreground mb-4 sm:mb-0">
            Your Offers<span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
        <Link
          href="/dashboard/company/offers"
          className="text-foreground hover:bg-foreground hover:text-background border border-transparent hover:border-foreground transition-all duration-300 font-bold uppercase tracking-[0.15em] text-[10px] py-1 px-3 h-8 flex items-center group/btn"
        >
          View All{" "}
          <ArrowRight className="inline h-3 w-3 ms-2 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="border border-border/60 bg-background flex flex-col divide-y divide-border/60 shadow-[4px_4px_0_0_oklch(var(--border)_/_0.3)]">
        {offers.map((offer, i) => (
          <Link
            key={offer.id}
            href={`/dashboard/company/offers/${offer.id}/candidates` as Route}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 transition-colors hover:bg-foreground hover:text-background overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-in-out" />

            <div className="flex items-center gap-4 relative z-10">
              <span className="font-serif italic text-2xl text-foreground/20 group-hover:text-background/30 w-8 hidden sm:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal group-hover:text-background tracking-tight truncate">
                    {offer.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-transparent border-foreground/20 text-foreground/60 group-hover:border-background/30 group-hover:text-background/80 text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0 h-5"
                  >
                    {offer.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-foreground/50 group-hover:text-primary font-bold uppercase tracking-widest">
                  {TYPE_LABELS[offer.internshipType] ?? offer.internshipType}
                </p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/20 pt-4 sm:pt-0 group-hover:border-background/20 relative z-10">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/50 group-hover:text-background/50">
                <Users className="h-3.5 w-3.5" />
                <span>Candidates</span>
              </div>
              <span className="font-serif text-2xl font-normal tracking-tighter text-foreground group-hover:text-primary tabular-nums">
                {offer.candidatesCount}
              </span>
            </div>

            <div className="absolute end-6 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 hidden sm:block">
              <ArrowRight className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
