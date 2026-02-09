"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react"

import { orpcClient, orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { OfferCard } from "./OfferCard"
import { SearchFilters } from "./SearchFilters"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

export interface FilterState {
  wilayaCode?: number
  internshipTypes: string[]
  workModes: string[]
  skillTagIds: string[]
}

export function ExploreClient() {
  const t = useTranslations("dashboard.explore")

  const [keyword, setKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    internshipTypes: [],
    workModes: [],
    skillTagIds: [],
  })

  // Debounce keyword
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300)
    return () => clearTimeout(timer)
  }, [keyword])

  // Fetch skills for filter panel
  const { data: skills = [] } = useQuery(orpc.skills.list.queryOptions())

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["offers", "search", debouncedKeyword, filters],
    queryFn: async ({ pageParam }) => {
      return orpcClient.offers.search({
        keyword: debouncedKeyword || undefined,
        wilayaCode: filters.wilayaCode,
        internshipTypes:
          filters.internshipTypes.length > 0
            ? (filters.internshipTypes as ("pfe" | "immersion" | "summer" | "practical")[])
            : undefined,
        workModes:
          filters.workModes.length > 0
            ? (filters.workModes as ("on_site" | "hybrid" | "remote")[])
            : undefined,
        skillTagIds:
          filters.skillTagIds.length > 0 ? filters.skillTagIds : undefined,
        cursor: pageParam ?? undefined,
        limit: 12,
      })
    },
    initialPageParam: undefined as
      | { createdAt: string; id: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const offers = data?.pages.flatMap((p) => p.offers) ?? []

  // Intersection observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersection])

  const hasActiveFilters =
    !!filters.wilayaCode ||
    filters.internshipTypes.length > 0 ||
    filters.workModes.length > 0 ||
    filters.skillTagIds.length > 0

  const clearFilters = () => {
    setFilters({
      internshipTypes: [],
      workModes: [],
      skillTagIds: [],
    })
  }

  const filterPanel = (
    <SearchFilters
      filters={filters}
      onFiltersChange={setFilters}
      skills={skills}
      t={t}
    />
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light mt-1">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Search bar + filter toggle */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.05 }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-10"
          />
        </div>

        {/* Mobile filter toggle */}
        <Sheet>
          <SheetTrigger
            className="lg:hidden shrink-0 relative inline-flex items-center justify-center h-9 w-9 border border-border rounded-md text-muted-foreground hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>{t("filters")}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filterPanel}</div>
          </SheetContent>
        </Sheet>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="hidden lg:inline-flex gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            {t("clearFilters")}
          </Button>
        )}
      </motion.div>

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <motion.aside
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="hidden lg:block w-64 shrink-0 space-y-6"
        >
          {filterPanel}
        </motion.aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && offers.length === 0 && (
            <motion.div
              {...reveal}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="border border-dashed border-border p-12 text-center"
            >
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {t("noResults")}
              </p>
            </motion.div>
          )}

          {/* Offer grid */}
          {offers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {offers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  {...reveal}
                  transition={{ duration: 0.4, ease, delay: 0.03 * (i % 12) }}
                >
                  <OfferCard offer={offer} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
