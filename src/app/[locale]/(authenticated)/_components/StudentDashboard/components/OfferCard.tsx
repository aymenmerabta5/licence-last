import { MapPin, Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"

import type { OfferRow } from "../types"
import { relativeTime } from "../utils"
import { getWilayaName } from "@/lib/wilayas"

interface OfferCardProps {
  offer: OfferRow
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <Link href={`/dashboard/explore/${offer.id}`}>
      <div className="group py-5 first:pt-0 last:pb-0 cursor-pointer hover:bg-secondary/5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.1em] [[dir=rtl]_&]:tracking-normal">
                {offer.companyName}
              </span>
              {offer.wilayaCode && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {getWilayaName(offer.wilayaCode)}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-base font-bold leading-tight text-heading group-hover:text-primary transition-colors">
              {offer.title}
            </h3>
            {offer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {offer.skills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="bg-primary/5 text-primary/70 text-[8px] uppercase font-bold tracking-wider rounded-none px-2 py-0.5 border-none"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end justify-between gap-2 shrink-0">
            <Badge className="bg-foreground text-background border-none text-[8px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-none">
              {offer.internshipType}
            </Badge>
            <span className="text-[9px] text-muted-foreground/40 flex items-center gap-1.5 uppercase tracking-wider font-medium">
              <Calendar className="h-3 w-3" />
              {relativeTime(offer.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
