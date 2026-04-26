"use client"

import { Plus } from "lucide-react"
import { LanguageRow } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/LanguagesManager/components/LanguageRow"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_STUDENT_LANGUAGE_CODE,
  DEFAULT_STUDENT_LANGUAGE_PROFICIENCY,
  LANGUAGE_CATALOG,
  type LanguageCode,
  type SupportedLocale,
} from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"

interface LanguageEntry {
  languageCode: LanguageCode
  proficiency: ProficiencyLevel
}

interface LanguagesManagerListProps {
  languages: LanguageEntry[]
  languageLocale: SupportedLocale
  proficiencyOptions: Array<{ value: string; label: string }>
  languageText: string
  languagePlaceholder: string
  proficiencyText: string
  proficiencyPlaceholder: string
  addLanguageText: string
  removeLanguageAria: (language: string) => string
  saveError: string
  onAddLanguage: (language: {
    languageCode: (typeof LANGUAGE_CATALOG)[number]["code"]
    proficiency: ProficiencyLevel
  }) => void
  onUpdateLanguage: (index: number, patch: Partial<LanguageEntry>) => void
  onRemoveLanguage: (index: number) => void
}

export function LanguagesManagerList({
  languages,
  languageLocale,
  proficiencyOptions,
  languageText,
  languagePlaceholder,
  proficiencyText,
  proficiencyPlaceholder,
  addLanguageText,
  removeLanguageAria,
  saveError,
  onAddLanguage,
  onUpdateLanguage,
  onRemoveLanguage,
}: LanguagesManagerListProps) {
  const selectedLanguageCodes = languages.map((entry) => entry.languageCode)
  const canAddLanguage = languages.length < LANGUAGE_CATALOG.length

  return (
    <div className="space-y-4 border border-border/40 p-5">
      {languages.map((language, index) => {
        const languageLabel =
          LANGUAGE_CATALOG.find((entry) => entry.code === language.languageCode)
            ?.labels[languageLocale] ?? language.languageCode

        return (
          <LanguageRow
            key={`${language.languageCode}-${index}`}
            index={index}
            languageCode={language.languageCode}
            proficiency={language.proficiency}
            selectedLanguageCodes={selectedLanguageCodes}
            languageLocale={languageLocale}
            proficiencyOptions={proficiencyOptions}
            languageText={languageText}
            languagePlaceholder={languagePlaceholder}
            proficiencyText={proficiencyText}
            proficiencyPlaceholder={proficiencyPlaceholder}
            removeLanguageAriaLabel={removeLanguageAria(languageLabel)}
            onUpdateLanguage={onUpdateLanguage}
            onRemoveLanguage={onRemoveLanguage}
          />
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          disabled={!canAddLanguage}
          onClick={() =>
            onAddLanguage({
              languageCode:
                LANGUAGE_CATALOG.find(
                  (entry) => !selectedLanguageCodes.includes(entry.code),
                )?.code ?? DEFAULT_STUDENT_LANGUAGE_CODE,
              proficiency: DEFAULT_STUDENT_LANGUAGE_PROFICIENCY,
            })
          }
        >
          <Plus className="h-4 w-4" />
          {addLanguageText}
        </Button>

        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
