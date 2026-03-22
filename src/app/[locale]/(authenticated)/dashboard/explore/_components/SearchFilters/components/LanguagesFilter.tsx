"use client"

import { Search, X } from "lucide-react"
import { useLocale } from "next-intl"
import { useMemo, useState } from "react"
import { FilterSection } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/components/FilterSection"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  LANGUAGE_CATALOG,
  toSupportedLocale,
} from "@/lib/constants/languages"
import { cn } from "@/lib/utils"

interface LanguagesFilterProps {
  selectedCodes: string[]
  onToggle: (languageCode: string) => void
  t: (key: string) => string
}

export function LanguagesFilter({
  selectedCodes,
  onToggle,
  t,
}: LanguagesFilterProps) {
  const locale = useLocale()
  const languageLocale = toSupportedLocale(locale)
  const [query, setQuery] = useState("")
  const lowerQuery = query.toLowerCase()

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes])

  const filtered = useMemo(() => {
    const matched = lowerQuery
      ? LANGUAGE_CATALOG.filter((language) =>
          language.labels[languageLocale].toLowerCase().includes(lowerQuery),
        )
      : LANGUAGE_CATALOG

    const selected = matched.filter((language) => selectedSet.has(language.code))
    const unselected = matched.filter((language) => !selectedSet.has(language.code))

    return { selected, unselected }
  }, [languageLocale, lowerQuery, selectedSet])

  return (
    <FilterSection label={t("languages")} count={selectedCodes.length}>
      <div className="relative">
        <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("languagesPlaceholder")}
          className="rounded-none border-foreground/10 bg-transparent h-8 text-xs ps-8 pe-8 placeholder:text-muted-foreground/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="space-y-1 max-h-56 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[...filtered.selected, ...filtered.unselected].map((language) => {
          const checked = selectedSet.has(language.code)

          return (
            <label
              key={language.code}
              className={cn(
                "flex items-center gap-2.5 cursor-pointer py-1 px-2 -mx-2 transition-colors",
                checked && "bg-primary/[0.04]",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle(language.code)}
              />
              <span className={cn("text-sm", checked && "font-medium")}>
                {language.labels[languageLocale]}
              </span>
            </label>
          )
        })}
      </div>
    </FilterSection>
  )
}
