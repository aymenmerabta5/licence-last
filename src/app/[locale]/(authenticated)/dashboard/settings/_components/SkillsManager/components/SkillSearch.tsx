"use client"

import { Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface SkillSearchProps {
  query: string
  onQueryChange: (value: string) => void
  isLoading: boolean
  isAtMax: boolean
  saveError: string
  saveTick: number
}

export function SkillSearch({
  query,
  onQueryChange,
  isLoading,
  isAtMax,
  saveError,
  saveTick,
}: SkillSearchProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="skill-search"
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
      >
        Find skills
      </Label>
      <div className="relative">
        <InputGroup className="rounded-none h-11">
          <InputGroupAddon align="inline-start">
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="skill-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search e.g. React, Postgres, Docker..."
            disabled={isLoading}
          />
        </InputGroup>
      </div>
      {isAtMax && (
        <p className="text-[11px] text-muted-foreground">
          You reached the maximum. Remove a skill to add another.
        </p>
      )}
      {saveError && (
        <p className="text-[11px] text-destructive" role="alert">
          {saveError}
        </p>
      )}
      {saveTick > 0 && (
        <p className="text-[11px] text-muted-foreground">Saved.</p>
      )}
    </div>
  )
}
