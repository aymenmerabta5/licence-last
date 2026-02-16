"use client"

import * as motion from "motion/react-client"
import { Users, ArrowRight, Briefcase } from "lucide-react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"
import { Badge } from "@/components/ui/badge"
import type { Route } from "next"

interface Offer {
  id: string
  title: string
  status: "draft" | "published" | "closed"
  internshipType: string
  candidatesCount: number
  createdAt: Date
}

const STATUS_STYLES: Record<string, { label: string; accent: string; badge: string }> = {
  published: {
    label: "Live",
    accent: "border-s-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  draft: {
    label: "Draft",
    accent: "border-s-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  closed: {
    label: "Closed",
    accent: "border-s-zinc-400",
    badge: "bg-zinc-400/10 text-zinc-500 border-zinc-400/20",
  },
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
        <h2 className="font-serif text-xl font-bold text-heading tracking-tight">
          Your Offers
        </h2>
        <div className="border border-dashed border-border/40 p-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/5">
            <Briefcase className="h-6 w-6 text-primary/30" />
          </div>
          <p className="text-sm text-muted-foreground/50 font-medium">
            No offers yet. Post your first internship position.
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
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-heading tracking-tight">
          Your Offers
        </h2>
        <Link
          href="/dashboard/company/offers"
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors group/link [[dir=rtl]_&]:tracking-normal"
        >
          View All{" "}
          <ArrowRight className="inline h-3 w-3 group-hover/link:translate-x-0.5 transition-transform [[dir=rtl]_&]:rotate-180" />
        </Link>
      </div>

      <div className="space-y-2">
        {offers.map((offer, i) => {
          const style = STATUS_STYLES[offer.status] ?? STATUS_STYLES.draft
          return (
            <Link
              key={offer.id}
              href={
                `/dashboard/company/offers/${offer.id}/candidates` as Route
              }
            >
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.06, ease }}
                className={cn(
                  "group flex items-center gap-4 p-4 border border-border/40 border-s-4 bg-background hover:bg-secondary/5 hover:shadow-sm transition-all cursor-pointer",
                  style.accent,
                )}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-heading truncate">
                      {offer.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0 h-4 shrink-0",
                        style.badge,
                      )}
                    >
                      {style.label}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">
                    {TYPE_LABELS[offer.internshipType] ?? offer.internshipType}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground/40 shrink-0">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold text-heading tabular-nums">
                    {offer.candidatesCount}
                  </span>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0 [[dir=rtl]_&]:rotate-180" />
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
