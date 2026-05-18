"use client"

import { Search } from "lucide-react"
import { useTranslations } from "next-intl"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTranslations("dashboard.messages")

  return (
    <div className="relative">
      <Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
        className="w-full border border-border/50 bg-background py-2 pe-3 ps-9 text-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none"
      />
    </div>
  )
}
