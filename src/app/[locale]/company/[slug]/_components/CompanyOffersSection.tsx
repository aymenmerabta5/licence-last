import { Briefcase } from "lucide-react"
import { headers } from "next/headers"

import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { auth } from "@/lib/auth"

interface CompanyOffer {
  id: string
  title: string
  internshipType: string
  maxPositions: number
}

interface CompanyOffersSectionProps {
  offers: CompanyOffer[]
  labels: {
    noOffers: string
    positions: string
  }
}

export async function CompanyOffersSection({
  offers,
  labels,
}: CompanyOffersSectionProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const canOpenOffers = session?.user.role === "student"

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border/40 py-12 text-center">
        <Briefcase className="h-6 w-6 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{labels.noOffers}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {offers.map((offer) => {
        const content = (
          <article className="group border border-border/50 bg-background p-5 transition-colors hover:border-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <h3 className="font-serif text-lg text-heading transition-colors group-hover:text-primary">
                  {offer.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  >
                    {offer.internshipType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {offer.maxPositions} {labels.positions}
                  </span>
                </div>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/50 bg-primary/5 transition-colors group-hover:bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
            </div>
          </article>
        )

        if (!canOpenOffers) return <div key={offer.id}>{content}</div>

        return (
          <Link
            key={offer.id}
            href={`/dashboard/explore/${offer.id}` as "/dashboard"}
          >
            {content}
          </Link>
        )
      })}
    </div>
  )
}
