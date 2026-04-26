import { Building2, Calendar, Hexagon } from "lucide-react"
import { useLocale } from "next-intl"
import type { OfferRow } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { relativeTime } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/utils"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { getWilayaName } from "@/lib/wilayas"

interface OfferCardProps {
  offer: OfferRow
  index: number
}

export function OfferCard({ offer, index: _index }: OfferCardProps) {
  const locale = useLocale()

  return (
    <Link
      href={`/dashboard/explore/${offer.id}`}
      className="group relative block h-full"
    >
      <div className="relative h-full border border-border/80 bg-background hover:bg-foreground hover:text-background flex flex-col p-6 transition-all duration-500 shadow-[6px_6px_0_0_oklch(var(--border)_/_0.3)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]">
        {/* Image/Graphic Placeholder */}
        <div className="absolute top-0 end-0 w-24 h-24 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity">
          <Hexagon className="w-full h-full text-primary absolute -top-10 -end-10 rotate-12 scale-150 group-hover:rotate-45 transition-transform duration-1000 ease-out" />
        </div>

        {/* Company & Meta */}
        <div className="relative z-10 flex flex-col justify-start mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary group-hover:text-background" />
            <span className="text-[10px] font-bold text-primary group-hover:text-background uppercase tracking-[0.1em] [[dir=rtl]_&]:tracking-normal">
              {offer.companyName}
            </span>
            {offer.wilayaCode && (
              <>
                <span className="h-3 w-px bg-border group-hover:bg-background/20 mx-1" />
                <span className="text-[9px] text-foreground/50 group-hover:text-background/50 flex items-center font-bold tracking-widest uppercase truncate max-w-[80px]">
                  {getWilayaName(offer.wilayaCode)}
                </span>
              </>
            )}
          </div>

          <h3 className="text-2xl font-serif font-normal leading-[1.1] group-hover:text-background transition-colors tracking-tight line-clamp-3 mb-4">
            {offer.title}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            <Badge className="bg-foreground text-background group-hover:bg-background group-hover:text-foreground border-none text-[8px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-none transition-colors">
              {offer.internshipType}
            </Badge>
            {offer.matchScore != null ? (
              <Badge className="bg-primary text-primary-foreground group-hover:bg-transparent group-hover:border-primary group-hover:text-primary border-none border border-primary text-[8px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-none transition-colors">
                {offer.matchScore}% Match
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border group-hover:bg-background/20 mt-auto mb-4 transition-colors" />

        {/* Skills Slider & Footer */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 shrink-0 overflow-hidden max-h-[48px]">
            {offer.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="text-[9px] uppercase font-bold tracking-wider text-foreground/60 group-hover:text-background/60 border border-foreground/10 group-hover:border-background/20 px-1.5 py-0.5"
              >
                {skill.name}
              </span>
            ))}
            {offer.skills.length > 3 && (
              <span className="text-[9px] uppercase font-bold tracking-wider text-primary px-1.5 py-0.5">
                +{offer.skills.length - 3}
              </span>
            )}
          </div>

          <span className="text-[9px] text-foreground/40 group-hover:text-background/50 flex items-center shrink-0 gap-1.5 uppercase tracking-[0.15em] font-bold mt-2 md:mt-0">
            <Calendar className="h-3 w-3" />
            {relativeTime(offer.createdAt, locale)}
          </span>
        </div>
      </div>
    </Link>
  )
}
