"use client"

import { BookmarkMinus, Building2, Clock3, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { getWilayaName } from "@/lib/wilayas"

interface SavedOffer {
  offerId: string
  title: string
  description: string
  internshipType: string
  workMode: string | null
  wilayaCode: number | null
  durationWeeks: number | null
  companyName: string
  companyLogoUrl: string | null
  skills: Array<{ id: string; name: string }>
}

interface SavedOffersListProps {
  offers: SavedOffer[]
  unsaving: boolean
  onUnsave: (offerId: string) => Promise<void>
}

export function SavedOffersList({ offers, unsaving, onUnsave }: SavedOffersListProps) {
  if (offers.length === 0) {
    return (
      <div className="border border-dashed border-border/40 p-12 text-center text-sm text-muted-foreground">
        You have no saved offers yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {offers.map((offer) => {
        const wilaya = getWilayaName(offer.wilayaCode)
        const initial = offer.companyName.charAt(0).toUpperCase()

        return (
          <article key={offer.offerId} className="border border-border/50 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {offer.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.companyLogoUrl}
                    alt={offer.companyName}
                    className="h-9 w-9 object-cover border border-border/60 shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 border border-border/60 bg-primary/10 text-primary flex items-center justify-center shrink-0 font-serif text-sm">
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif text-lg text-heading leading-tight line-clamp-2">{offer.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {offer.companyName}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary"
                disabled={unsaving}
                onClick={() => {
                  void onUnsave(offer.offerId)
                }}
              >
                <BookmarkMinus className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {wilaya && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {wilaya}
                </span>
              )}
              {offer.durationWeeks && (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {offer.durationWeeks} weeks
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {offer.skills.slice(0, 5).map((skill) => (
                <span key={skill.id} className="px-2 py-0.5 text-[10px] border border-primary/20 text-primary bg-primary/5">
                  {skill.name}
                </span>
              ))}
            </div>

            <Link
              href={`/dashboard/student/offers/${offer.offerId}` as "/dashboard"}
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              View details
            </Link>
          </article>
        )
      })}
    </div>
  )
}
