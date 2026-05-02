"use client"

import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WILAYA_OPTIONS } from "@/lib/wilayas"

interface CompaniesDirectoryHeaderProps {
  keyword: string
  onKeywordChange: (value: string) => void
  wilayaCode: number | undefined
  onWilayaCodeChange: (value: number | undefined) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function CompaniesDirectoryHeader({
  keyword,
  onKeywordChange,
  wilayaCode,
  onWilayaCodeChange,
  hasActiveFilters,
  onClearFilters,
}: CompaniesDirectoryHeaderProps) {
  const t = useTranslations("dashboard.studentCompanies")

  return (
    <div className="space-y-4">
      <div className="h-0.5 bg-primary" />
      <div className="space-y-3">
        <div className="space-y-2">
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 rounded-none border border-foreground/10 bg-transparent ps-11 pe-4 text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
          />
        </div>

        <Select
          value={wilayaCode ? String(wilayaCode) : "all"}
          onValueChange={(value) =>
            onWilayaCodeChange(value === "all" ? undefined : Number(value))
          }
          items={[
            { value: "all", label: t("wilayaPlaceholder") },
            ...WILAYA_OPTIONS.map((option) => ({
              value: String(option.value),
              label: option.label,
            })),
          ]}
        >
          <SelectTrigger className="h-11 w-full rounded-none border border-foreground/10 bg-transparent text-sm lg:w-56">
            <SelectValue placeholder={t("wilayaPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("wilayaPlaceholder")}</SelectItem>
            {WILAYA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="h-11 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            onClick={onClearFilters}
          >
            <X className="h-3 w-3" />
            {t("clearFilters")}
          </Button>
        )}
      </div>
    </div>
  )
}
