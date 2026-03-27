"use client"

import { GraduationCap, Languages, Trash2 } from "lucide-react"
import { SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import {
  isLanguageCode,
  LANGUAGE_CATALOG,
  type LanguageCode,
  type SupportedLocale,
} from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"

interface LanguageRowProps {
  index: number
  languageCode: LanguageCode
  proficiency: ProficiencyLevel
  selectedLanguageCodes: LanguageCode[]
  languageLocale: SupportedLocale
  proficiencyOptions: Array<{ value: string; label: string }>
  languageText: string
  languagePlaceholder: string
  proficiencyText: string
  proficiencyPlaceholder: string
  removeLanguageAriaLabel: string
  onUpdateLanguage: (
    index: number,
    patch: Partial<{
      languageCode: (typeof LANGUAGE_CATALOG)[number]["code"]
      proficiency: ProficiencyLevel
    }>,
  ) => void
  onRemoveLanguage: (index: number) => void
}

export function LanguageRow({
  index,
  languageCode,
  proficiency,
  selectedLanguageCodes,
  languageLocale,
  proficiencyOptions,
  languageText,
  languagePlaceholder,
  proficiencyText,
  proficiencyPlaceholder,
  removeLanguageAriaLabel,
  onUpdateLanguage,
  onRemoveLanguage,
}: LanguageRowProps) {
  return (
    <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <SelectField
        id={`settings-language-code-${index}`}
        label={languageText}
        placeholder={languagePlaceholder}
        icon={Languages}
        options={LANGUAGE_CATALOG.map((entry) => ({
          value: entry.code,
          label: entry.labels[languageLocale],
          disabled:
            selectedLanguageCodes.includes(entry.code) &&
            entry.code !== languageCode,
        }))}
        value={languageCode}
        onChange={(value) => {
          if (isLanguageCode(value)) {
            onUpdateLanguage(index, { languageCode: value })
          }
        }}
      />

      <SelectField
        id={`settings-language-proficiency-${index}`}
        label={proficiencyText}
        placeholder={proficiencyPlaceholder}
        icon={GraduationCap}
        options={proficiencyOptions}
        value={proficiency}
        onChange={(value) =>
          onUpdateLanguage(index, {
            proficiency: value as ProficiencyLevel,
          })
        }
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-none"
        onClick={() => onRemoveLanguage(index)}
        aria-label={removeLanguageAriaLabel}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
