"use client"

import { GraduationCap, Languages, Plus, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { useLanguagesManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/LanguagesManager/hooks/useLanguagesManager"
import { SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_STUDENT_LANGUAGE_CODE,
  DEFAULT_STUDENT_LANGUAGE_PROFICIENCY,
  isLanguageCode,
  LANGUAGE_CATALOG,
  toSupportedLocale,
} from "@/lib/constants/languages"

export function LanguagesManager() {
  const locale = useLocale()
  const tSettings = useTranslations("dashboard.settings.languageManager")
  const tOnboarding = useTranslations("onboarding.student")
  const languageLocale = toSupportedLocale(locale)
  const proficiencyOptions = useMemo(
    () => [
      { value: "a1", label: tOnboarding("proficiencyLevels.a1") },
      { value: "a2", label: tOnboarding("proficiencyLevels.a2") },
      { value: "b1", label: tOnboarding("proficiencyLevels.b1") },
      { value: "b2", label: tOnboarding("proficiencyLevels.b2") },
      { value: "c1", label: tOnboarding("proficiencyLevels.c1") },
      { value: "c2", label: tOnboarding("proficiencyLevels.c2") },
      { value: "native", label: tOnboarding("proficiencyLevels.native") },
    ],
    [tOnboarding],
  )
  const {
    languages,
    isSaving,
    isDirty,
    isBusy,
    saveError,
    addLanguage,
    updateLanguage,
    removeLanguage,
    save,
  } = useLanguagesManager()

  const selectedLanguageCodes = languages.map((entry) => entry.languageCode)
  const canAddLanguage = languages.length < LANGUAGE_CATALOG.length

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-serif text-lg text-heading">{tSettings("title")}</h3>
          <p className="text-sm text-muted-foreground">
            {tSettings("description")}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          disabled={!isDirty || isBusy}
          onClick={save}
        >
          {isSaving ? tSettings("saving") : tSettings("save")}
        </Button>
      </div>

      <div className="space-y-4 border border-border/40 p-5">
        {languages.map((language, index) => {
          const languageLabel =
            LANGUAGE_CATALOG.find((entry) => entry.code === language.languageCode)
              ?.labels[languageLocale] ?? language.languageCode

          return (
            <div
              key={`${language.languageCode}-${index}`}
              className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <SelectField
                id={`settings-language-code-${index}`}
                label={tOnboarding("language")}
                placeholder={tOnboarding("languagePlaceholder")}
                icon={Languages}
                options={LANGUAGE_CATALOG.map((entry) => ({
                  value: entry.code,
                  label: entry.labels[languageLocale],
                  disabled:
                    selectedLanguageCodes.includes(entry.code) &&
                    entry.code !== language.languageCode,
                }))}
                value={language.languageCode}
                onChange={(value) =>
                  isLanguageCode(value)
                    ? updateLanguage(index, {
                        languageCode: value,
                      })
                    : undefined
                }
              />

              <SelectField
                id={`settings-language-proficiency-${index}`}
                label={tOnboarding("proficiency")}
                placeholder={tOnboarding("proficiencyPlaceholder")}
                icon={GraduationCap}
                options={proficiencyOptions}
                value={language.proficiency}
                onChange={(value) =>
                  updateLanguage(index, {
                    proficiency: value as (typeof languages)[number]["proficiency"],
                  })
                }
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-none"
                onClick={() => removeLanguage(index)}
                aria-label={tOnboarding("removeLanguageAria", {
                  language: languageLabel,
                })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            disabled={!canAddLanguage}
            onClick={() =>
              addLanguage({
                languageCode:
                  LANGUAGE_CATALOG.find(
                    (entry) => !selectedLanguageCodes.includes(entry.code),
                  )?.code ?? DEFAULT_STUDENT_LANGUAGE_CODE,
                proficiency: DEFAULT_STUDENT_LANGUAGE_PROFICIENCY,
              })
            }
          >
            <Plus className="h-4 w-4" />
            {tOnboarding("addLanguage")}
          </Button>

          {saveError ? (
            <p className="text-sm text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
