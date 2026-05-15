"use client"

import { Search } from "lucide-react"

interface SkillSearchInputProps {
  query: string
  onChange: (value: string) => void
  placeholder: string
}

export function SkillSearchInput({
  query,
  onChange,
  placeholder,
}: SkillSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full ps-9 pe-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
