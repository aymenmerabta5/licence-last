import { Search, X } from "lucide-react"
import * as motion from "motion/react-client"
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
import { ease, reveal } from "@/lib/animations"
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
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      <div className="h-0.5 bg-primary" />
      <div className="border border-t-0 border-border/50 p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary [[dir=rtl]_&]:tracking-normal">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.1] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 rounded-none border-2 border-foreground/10 bg-transparent ps-11 pe-4 text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
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
            <SelectTrigger className="h-11 w-full rounded-none border-2 border-foreground/10 bg-transparent text-sm lg:w-56">
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
              variant="ghost"
              size="sm"
              className="h-11 gap-1.5 rounded-none px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-destructive [[dir=rtl]_&]:tracking-normal"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3" />
              {t("clearFilters")}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
