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
import type { FilterState } from "./ExploreClient"

interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  skills: { id: string; name: string; category: string | null }[]
  t: (key: string) => string
}

const INTERNSHIP_TYPES = ["pfe", "immersion", "summer", "practical"] as const
const WORK_MODES = ["on_site", "hybrid", "remote"] as const

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
    <div className="space-y-6">
      {/* Wilaya */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {t("wilaya")}
        </Label>
        <Select
          value={filters.wilayaCode?.toString() ?? "all"}
          onValueChange={(val) =>
            onFiltersChange({
              ...filters,
              wilayaCode: val === "all" ? undefined : Number(val),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("wilayaPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("wilayaPlaceholder")}</SelectItem>
            {Array.from({ length: 58 }, (_, i) => i + 1).map((code) => (
              <SelectItem key={code} value={code.toString()}>
                {String(code).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Internship Type */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {t("internshipType")}
        </Label>
        <div className="space-y-2">
          {INTERNSHIP_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={filters.internshipTypes.includes(type)}
                onCheckedChange={() =>
                  toggleArrayItem("internshipTypes", type)
                }
              />
              <span className="text-sm">
                {t(`type.${type}` as "type.pfe")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {t("workMode")}
        </Label>
        <div className="space-y-2">
          {WORK_MODES.map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-2 cursor-pointer"
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
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {t("skills")}
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={filters.skillTagIds.includes(skill.id)}
                  onCheckedChange={() =>
                    toggleArrayItem("skillTagIds", skill.id)
                  }
                />
                <span className="text-sm">{skill.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
