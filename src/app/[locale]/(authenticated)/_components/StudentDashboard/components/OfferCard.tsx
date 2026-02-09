import { MapPin, Calendar } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
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
      <Card className="group hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer border-border/50 bg-background hover:bg-secondary/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-bold text-primary">
                  {offer.companyName}
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
                {offer.wilayaCode && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{" "}
                    {getWilayaName(offer.wilayaCode)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                {offer.title}
              </h3>
              {offer.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {offer.skills.slice(0, 5).map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="bg-secondary/50 text-[9px] uppercase font-bold tracking-wider rounded-none px-2 py-0.5 border-none"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
              <Badge className="bg-heading text-white border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-none italic">
                {offer.internshipType.toUpperCase()}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
                <Calendar className="h-3.5 w-3.5" />{" "}
                {relativeTime(offer.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
