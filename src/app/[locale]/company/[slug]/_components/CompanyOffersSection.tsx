import { headers } from "next/headers"

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
    return <p className="text-sm text-muted-foreground">{labels.noOffers}</p>
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const content = (
          <article className="border border-border/50 p-4 hover:border-primary/30 transition-colors">
            <h3 className="font-serif text-lg text-heading">{offer.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {offer.internshipType} - {offer.maxPositions} {labels.positions}
            </p>
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
