"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BorderStyleKey } from "@/server/pdfs/borders"

const SUPPORTED_LOCALES = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
] as const

const BORDER_OPTIONS: { key: BorderStyleKey; nameKey: string }[] = [
  { key: "classic", nameKey: "classic" },
  { key: "minimal", nameKey: "minimal" },
  { key: "formal", nameKey: "formal" },
  { key: "ornate", nameKey: "ornate" },
  { key: "modern", nameKey: "modern" },
  { key: "premium", nameKey: "premium" },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingVariants: Array<{ locale: string; borderStyle: string }>
  onGenerate: (locale: string, borderStyle: BorderStyleKey) => void
  isGenerating: boolean
}

export function CertificateGenerationDialog({
  open,
  onOpenChange,
  existingVariants,
  onGenerate,
  isGenerating,
}: Props) {
  const t = useTranslations("dashboard.companyDocuments")
  const [locale, setLocale] = useState<string>(SUPPORTED_LOCALES[0].value)
  const [borderStyle, setBorderStyle] = useState<BorderStyleKey>(
    BORDER_OPTIONS[0].key
  )

  const isExisting = existingVariants.some(
    (v) => v.locale === locale && v.borderStyle === borderStyle
  )

  const handleGenerate = () => {
    onGenerate(locale, borderStyle)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("generateDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("generateDialog.languageLabel")}
            </label>
            <Select value={locale} onValueChange={(value) => value && setLocale(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LOCALES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    <span className="me-2">{l.flag}</span>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("generateDialog.borderLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BORDER_OPTIONS.map((option) => {
                const isSelected = borderStyle === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setBorderStyle(option.key)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {t(`border.${option.nameKey}`)}
                  </button>
                )
              })}
            </div>
          </div>

          {isExisting && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {t("generateDialog.regenerateWarning")}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            {t("generateDialog.cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isExisting
              ? t("generateDialog.regenerate")
              : t("generateDialog.generate")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
