import { Languages, Trash2 } from "lucide-react"

import { CheckboxField, SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import {
  LANGUAGE_CATALOG,
  type SupportedLocale,
} from "@/lib/constants/languages"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface LanguageRequirementValue {
  languageCode: string
  minimumProficiency: string
  isRequired: boolean
  weight: number
}

interface TranslationFn {
  (key: string, values?: Record<string, string | number>): string
}

interface LanguageRequirementRowProps {
  index: number
  requirement: LanguageRequirementValue
  selectedLanguageCodes: string[]
  languageLocale: SupportedLocale
  proficiencyOptions: SelectOption[]
  weightOptions: SelectOption[]
  onLanguageCodeChange: (index: number, languageCode: string) => void
  onMinimumProficiencyChange: (
    index: number,
    minimumProficiency: string,
  ) => void
  onWeightChange: (index: number, weight: number) => void
  onRequiredChange: (index: number, isRequired: boolean) => void
  onRemove: (index: number) => void
  t: TranslationFn
}

export function LanguageRequirementRow({
  index,
  requirement,
  selectedLanguageCodes,
  languageLocale,
  proficiencyOptions,
  weightOptions,
  onLanguageCodeChange,
  onMinimumProficiencyChange,
  onWeightChange,
  onRequiredChange,
  onRemove,
  t,
}: LanguageRequirementRowProps) {
  const languageLabel =
    LANGUAGE_CATALOG.find((entry) => entry.code === requirement.languageCode)
      ?.labels[languageLocale] ?? requirement.languageCode

  return (
    <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <SelectField
        id={`offer-language-code-${index}`}
        label={t("language")}
        placeholder={t("languagePlaceholder")}
        icon={Languages}
        options={LANGUAGE_CATALOG.map((entry) => ({
          value: entry.code,
          label: entry.labels[languageLocale],
          disabled:
            selectedLanguageCodes.includes(entry.code) &&
            entry.code !== requirement.languageCode,
        }))}
        value={requirement.languageCode}
        onChange={(value) => onLanguageCodeChange(index, value)}
      />

      <SelectField
        id={`offer-language-minimum-proficiency-${index}`}
        label={t("minimumProficiency")}
        placeholder={t("minimumProficiencyPlaceholder")}
        icon={Languages}
        options={proficiencyOptions}
        value={requirement.minimumProficiency}
        onChange={(value) => onMinimumProficiencyChange(index, value)}
      />

      <SelectField
        id={`offer-language-weight-${index}`}
        label={t("weight")}
        placeholder={t("weightPlaceholder")}
        icon={Languages}
        options={weightOptions}
        value={String(requirement.weight)}
        onChange={(value) => onWeightChange(index, Number(value))}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-none"
        onClick={() => onRemove(index)}
        aria-label={t("removeLanguageRequirementAria", {
          language: languageLabel,
        })}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="sm:col-span-3">
        <CheckboxField
          id={`offer-language-is-required-${index}`}
          label={t("requiredLabel")}
          checked={Boolean(requirement.isRequired)}
          onChange={(checked) => onRequiredChange(index, checked)}
        />
      </div>
    </div>
  )
}
