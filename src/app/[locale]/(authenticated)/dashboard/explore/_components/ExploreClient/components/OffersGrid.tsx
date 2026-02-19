import { Loader2, Newspaper } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"
import { OfferCard } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/OfferCard"
import { ease, reveal } from "@/lib/animations"

type Offer = React.ComponentProps<typeof OfferCard>["offer"]

interface OffersGridProps {
  offers: Offer[]
  totalCount: number
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
  filterPanel: React.ReactNode
}

export function OffersGrid({
  offers,
  totalCount,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  filterPanel,
}: OffersGridProps) {
  const t = useTranslations("dashboard.explore")

  return (
    <div className="flex gap-10">
      {/* Sidebar filters — desktop only */}
      <motion.aside
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="hidden lg:block w-60 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filterPanel}
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Results header */}
        {!isLoading && offers.length > 0 && (
          <motion.div
            {...reveal}
            transition={{ duration: 0.4, ease, delay: 0.08 }}
            className="flex items-center justify-between pb-4 mb-6 border-b-2 border-foreground dark:border-foreground/15"
          >
            <h2 className="font-serif text-lg font-bold text-heading">
              {t("results") ?? "Results"}
            </h2>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
              {totalCount} {t("positions") ?? "positions"}
            </span>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30 [[dir=rtl]_&]:tracking-normal">
              {t("loading") ?? "Loading offers..."}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && offers.length === 0 && (
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="border border-border/40 p-16 text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center p-4 bg-primary/5">
              <Newspaper className="h-8 w-8 text-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg text-heading">
                {t("noResults")}
              </h3>
              <p className="text-xs text-muted-foreground/40 font-light max-w-xs mx-auto leading-relaxed">
                {t("noResultsHint") ??
                  "Try adjusting your filters or search terms to discover more opportunities."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Offers grid */}
        {offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {/* Loading more */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-3 py-10">
            <div className="h-px w-8 bg-border/40" />
            <Loader2 className="h-4 w-4 animate-spin text-primary/30" />
            <div className="h-px w-8 bg-border/40" />
          </div>
        )}
      </div>
    </div>
  )
}
