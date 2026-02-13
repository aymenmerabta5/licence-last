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
  onClearFilters: () => void
  filterPanel: React.ReactNode
}

export function SearchBar({
  keyword,
  onKeywordChange,
  hasActiveFilters,
  onClearFilters,
  filterPanel,
}: SearchBarProps) {
  const t = useTranslations("dashboard.explore")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.05 }}
      className="flex gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ps-10"
        />
      </div>

      <Sheet>
        <SheetTrigger className="lg:hidden shrink-0 relative inline-flex items-center justify-center h-9 w-9 border border-border rounded-md text-muted-foreground hover:bg-accent transition-colors">
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
          onClick={onClearFilters}
          className="hidden lg:inline-flex gap-1 text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          {t("clearFilters")}
        </Button>
      )}
    </motion.div>
  )
}
