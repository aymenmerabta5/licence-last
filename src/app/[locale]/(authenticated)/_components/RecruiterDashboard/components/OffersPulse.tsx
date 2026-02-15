"use client"

import * as motion from "motion/react-client"
import { Briefcase, Users, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"

interface OffersPulseProps {
  activeOffers: number
  draftOffers: number
  totalCandidates: number
  activeCandidates: number
  closedOffers: number
}

export function OffersPulse({
  activeOffers,
  draftOffers,
  totalCandidates,
  activeCandidates,
  closedOffers,
}: OffersPulseProps) {
  const metrics = [
    {
      label: "Active Offers",
      value: String(activeOffers),
      sub: `${draftOffers} draft${draftOffers !== 1 ? "s" : ""}`,
      icon: Briefcase,
      highlight: activeOffers > 0,
    },
    {
      label: "Candidates",
      value: totalCandidates.toLocaleString(),
      sub: `${activeCandidates} on active offers`,
      icon: Users,
    },
    {
      label: "Total Offers",
      value: String(activeOffers + draftOffers + closedOffers),
      sub: `${closedOffers} completed`,
      icon: FileText,
    },
    {
      label: "Completed",
      value: String(closedOffers),
      sub: "Placements closed",
      icon: CheckCircle2,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="border-y-2 border-foreground dark:border-foreground/15"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon
          return (
            <div
              key={i}
              className={cn(
                "py-7 px-5 text-center relative transition-colors hover:bg-primary/[0.02]",
                i < metrics.length - 1 && "border-e border-border/40",
                // Stack on mobile: 2 cols with bottom borders
                i < 2 && "border-b sm:border-b-0 border-border/40",
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                  {metric.label}
                </span>
              </div>
              <h3
                className={cn(
                  "font-serif text-4xl font-bold leading-none tracking-tight",
                  metric.highlight ? "text-primary" : "text-heading",
                )}
              >
                {metric.value}
              </h3>
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-2">
                {metric.sub}
              </p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
