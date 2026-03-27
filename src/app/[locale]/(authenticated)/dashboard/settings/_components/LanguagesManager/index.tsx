"use client"

import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { LanguagesManagerHeader } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/LanguagesManager/components/LanguagesManagerHeader"
import { LanguagesManagerList } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/LanguagesManager/components/LanguagesManagerList"
import { useLanguagesManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/LanguagesManager/hooks/useLanguagesManager"
import { toSupportedLocale } from "@/lib/constants/languages"

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

  return (
    <section className="space-y-5">
      <LanguagesManagerHeader
        title={tSettings("title")}
        description={tSettings("description")}
        saveLabel={isSaving ? tSettings("saving") : tSettings("save")}
        isDisabled={!isDirty || isBusy}
        onSave={save}
      />

      <LanguagesManagerList
        languages={languages}
        languageLocale={languageLocale}
        proficiencyOptions={proficiencyOptions}
        languageText={tOnboarding("language")}
        languagePlaceholder={tOnboarding("languagePlaceholder")}
        proficiencyText={tOnboarding("proficiency")}
        proficiencyPlaceholder={tOnboarding("proficiencyPlaceholder")}
        addLanguageText={tOnboarding("addLanguage")}
        removeLanguageAria={(language) =>
          tOnboarding("removeLanguageAria", { language })
        }
        saveError={saveError}
        onAddLanguage={addLanguage}
        onUpdateLanguage={updateLanguage}
        onRemoveLanguage={removeLanguage}
      />
    </section>
  )
}
