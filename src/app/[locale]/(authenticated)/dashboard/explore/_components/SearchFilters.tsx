"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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

  // Group skills by category
  const categorized = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const cat = s.category ?? "Other"
    ;(acc[cat] ??= []).push(s)
    return acc
  }, {})

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

      {/* Skills — grouped by category */}
      {skills.length > 0 && (
        <FilterSection label={t("skills")} count={filters.skillTagIds.length}>
          <div className="space-y-4 max-h-64 overflow-y-auto pe-1">
            {Object.entries(categorized).map(([category, categorySkills]) => (
              <div key={category} className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
                  {category}
                </p>
                {categorySkills.map((skill) => (
                  <label
                    key={skill.id}
                    className={cn(
                      "flex items-center gap-2.5 cursor-pointer py-0.5 px-2 -mx-2 transition-colors",
                      filters.skillTagIds.includes(skill.id) && "bg-primary/[0.03]",
                    )}
                  >
                    <Checkbox
                      checked={filters.skillTagIds.includes(skill.id)}
                      onCheckedChange={() => toggleArrayItem("skillTagIds", skill.id)}
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
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
