import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SearchBarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  hasActiveFilters: boolean
  activeFilterCount: number
  onClearFilters: () => void
  filterPanel: React.ReactNode
}

export function SearchBar({
  keyword,
  onKeywordChange,
  hasActiveFilters,
  activeFilterCount,
  onClearFilters,
  filterPanel,
}: SearchBarProps) {
  const t = useTranslations("dashboard.explore")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.05 }}
      className="space-y-0"
    >
      {/* Search input row */}
      <div className="flex gap-3 items-stretch">
        <div className="relative flex-1 group">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
          <Input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-11 pe-4 h-11 rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/50 focus-visible:ring-0 transition-colors"
          />
        </div>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger className="lg:hidden shrink-0 relative inline-flex items-center justify-center h-11 w-11 border-2 border-foreground/10 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -end-1.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="font-serif">{t("filters")}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filterPanel}</div>
          </SheetContent>
        </Sheet>

        {/* Clear filters (desktop) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="hidden lg:inline-flex gap-1.5 text-muted-foreground/60 hover:text-destructive h-11 px-4 rounded-none text-[10px] font-bold uppercase tracking-wider [[dir=rtl]_&]:tracking-normal"
          >
            <X className="h-3 w-3" />
            {t("clearFilters")}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
