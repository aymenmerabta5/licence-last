"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getWilayaName, WILAYA_OPTIONS } from "@/lib/wilayas"
import { INTERNSHIP_TYPE_COLORS } from "@/lib/constants/internship"
import type { FilterState } from "./ExploreClient"

interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  skills: { id: string; name: string; category: string | null }[]
  t: (key: string) => string
}

const INTERNSHIP_TYPES = ["pfe", "immersion", "summer", "practical"] as const
const WORK_MODES = ["on_site", "hybrid", "remote"] as const

/** Small colored dot per internship type */
const TYPE_DOT: Record<string, string> = {
  pfe: "bg-purple-500",
  immersion: "bg-blue-500",
  summer: "bg-amber-500",
  practical: "bg-emerald-500",
}

export function SearchFilters({
  filters,
  onFiltersChange,
  skills,
  t,
}: SearchFiltersProps) {
  const toggleArrayItem = (
    key: "internshipTypes" | "workModes" | "skillTagIds",
    value: string,
  ) => {
    const arr = filters[key]
    onFiltersChange({
      ...filters,
      [key]: arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    })
  }

  return (
    <div className="space-y-7">
      {/* Wilaya */}
      <FilterSection label={t("wilaya")}>
        <Select
          value={filters.wilayaCode?.toString() ?? "all"}
          onValueChange={(val) =>
            onFiltersChange({
              ...filters,
              wilayaCode: val === "all" ? undefined : Number(val),
            })
          }
        >
          <SelectTrigger className="rounded-none border-foreground/10 h-9 text-sm">
            <SelectValue placeholder={t("wilayaPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("wilayaPlaceholder")}</SelectItem>
            {WILAYA_OPTIONS.map((w) => (
              <SelectItem key={w.value} value={w.value.toString()}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filters.wilayaCode && (
          <p className="text-[10px] text-primary/70 font-medium mt-1">
            {getWilayaName(filters.wilayaCode)}
          </p>
        )}
      </FilterSection>

      {/* Internship Type */}
      <FilterSection label={t("internshipType")}>
        <div className="space-y-2.5">
          {INTERNSHIP_TYPES.map((type) => {
            const isActive = filters.internshipTypes.includes(type)
            return (
              <label
                key={type}
                className={cn(
                  "flex items-center gap-2.5 cursor-pointer py-1 px-2 -mx-2 transition-colors",
                  isActive && "bg-primary/[0.03]",
                )}
              >
                <Checkbox
                  checked={isActive}
                  onCheckedChange={() => toggleArrayItem("internshipTypes", type)}
                />
                <span className={cn("h-2 w-2 rounded-full shrink-0", TYPE_DOT[type])} />
                <span className="text-sm">{t(`type.${type}` as "type.pfe")}</span>
                {isActive && (
                  <span className={cn("ms-auto text-[9px] font-bold px-1.5 py-0.5 border", INTERNSHIP_TYPE_COLORS[type])}>
                    ON
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* Work Mode */}
      <FilterSection label={t("workMode")}>
        <div className="space-y-2.5">
          {WORK_MODES.map((mode) => (
            <label
              key={mode}
              className={cn(
                "flex items-center gap-2.5 cursor-pointer py-1 px-2 -mx-2 transition-colors",
                filters.workModes.includes(mode) && "bg-primary/[0.03]",
              )}
            >
              <Checkbox
                checked={filters.workModes.includes(mode)}
                onCheckedChange={() => toggleArrayItem("workModes", mode)}
              />
              <span className="text-sm">
                {t(`workModeLabel.${mode}` as "workModeLabel.on_site")}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Skills — searchable, grouped by category */}
      {skills.length > 0 && (
        <SkillsFilter
          skills={skills}
          selectedIds={filters.skillTagIds}
          onToggle={(id) => toggleArrayItem("skillTagIds", id)}
          t={t}
        />
      )}
    </div>
  )
}

/** Skills filter with search and selected-first sorting */
function SkillsFilter({
  skills,
  selectedIds,
  onToggle,
  t,
}: {
  skills: { id: string; name: string; category: string | null }[]
  selectedIds: string[]
  onToggle: (id: string) => void
  t: (key: string) => string
}) {
  const [query, setQuery] = useState("")
  const lowerQuery = query.toLowerCase()

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  // Filter skills by search query, then group by category
  const filtered = useMemo(() => {
    const matched = lowerQuery
      ? skills.filter((s) => s.name.toLowerCase().includes(lowerQuery))
      : skills

    // Selected skills first, then group rest by category
    const selected = matched.filter((s) => selectedSet.has(s.id))
    const unselected = matched.filter((s) => !selectedSet.has(s.id))

    const categorized = unselected.reduce<Record<string, typeof skills>>(
      (acc, s) => {
        const cat = s.category ?? "Other"
        ;(acc[cat] ??= []).push(s)
        return acc
      },
      {},
    )

    return { selected, categorized }
  }, [skills, lowerQuery, selectedSet])

  const totalResults = filtered.selected.length +
    Object.values(filtered.categorized).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <FilterSection label={t("skills")} count={selectedIds.length}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("skillsPlaceholder")}
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

      {/* Skill list */}
      <div className="space-y-3 max-h-56 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Selected skills pinned at top */}
        {filtered.selected.length > 0 && (
          <div className="space-y-1">
            {filtered.selected.map((skill) => (
              <SkillCheckbox
                key={skill.id}
                skill={skill}
                checked
                onToggle={onToggle}
              />
            ))}
          </div>
        )}

        {/* Separator between selected and unselected */}
        {filtered.selected.length > 0 &&
          Object.keys(filtered.categorized).length > 0 && (
            <div className="border-t border-foreground/5" />
          )}

        {/* Unselected skills grouped by category */}
        {Object.entries(filtered.categorized).map(([category, categorySkills]) => (
          <div key={category} className="space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal sticky top-0 bg-background py-0.5">
              {category}
            </p>
            {categorySkills.map((skill) => (
              <SkillCheckbox
                key={skill.id}
                skill={skill}
                checked={false}
                onToggle={onToggle}
              />
            ))}
          </div>
        ))}

        {/* Empty state */}
        {totalResults === 0 && query && (
          <p className="text-xs text-muted-foreground/40 text-center py-3">
            No skills match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </FilterSection>
  )
}

/** Single skill checkbox row */
function SkillCheckbox({
  skill,
  checked,
  onToggle,
}: {
  skill: { id: string; name: string }
  checked: boolean
  onToggle: (id: string) => void
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 cursor-pointer py-1 px-2 -mx-2 transition-colors",
        checked && "bg-primary/[0.04]",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle(skill.id)}
      />
      <span className={cn("text-sm", checked && "font-medium")}>{skill.name}</span>
    </label>
  )
}

/** Reusable filter section with editorial header */
function FilterSection({
  label,
  count,
  children,
}: {
  label: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
        <Label className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
          {label}
        </Label>
        {count != null && count > 0 && (
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 min-w-[18px] text-center">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
