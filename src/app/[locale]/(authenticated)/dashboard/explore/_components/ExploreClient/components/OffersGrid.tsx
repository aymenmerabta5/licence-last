import type { RefObject } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Search, Loader2 } from "lucide-react"

import { reveal, ease } from "@/lib/animations"
import { OfferCard } from "../../OfferCard"

type Offer = React.ComponentProps<typeof OfferCard>["offer"]

interface OffersGridProps {
  offers: Offer[]
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
  filterPanel: React.ReactNode
}

export function OffersGrid({
  offers,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  filterPanel,
}: OffersGridProps) {
  const t = useTranslations("dashboard.explore")

  return (
    <div className="flex gap-8">
      <motion.aside
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="hidden lg:block w-64 shrink-0 space-y-6"
      >
        {filterPanel}
      </motion.aside>

      <div className="flex-1 min-w-0">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && offers.length === 0 && (
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="border border-dashed border-border p-12 text-center"
          >
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{t("noResults")}</p>
          </motion.div>
        )}

        {offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.id}
                {...reveal}
                transition={{
                  duration: 0.4,
                  ease,
                  delay: 0.03 * (i % 12),
                }}
              >
                <OfferCard offer={offer} />
              </motion.div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}
