import { GraduationCap, Languages, Plus, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { OnboardingFormApi } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"
import { FormSection, SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_STUDENT_LANGUAGE_CODE,
  DEFAULT_STUDENT_LANGUAGE_PROFICIENCY,
  LANGUAGE_CATALOG,
} from "@/lib/constants/languages"
import { errorMessage } from "@/lib/schemas/auth"

interface StudentLanguagesSectionProps {
  form: OnboardingFormApi
}

export function StudentLanguagesSection({
  form,
}: StudentLanguagesSectionProps) {
  const locale = useLocale()
  const t = useTranslations("onboarding.student")
  const languageLocale = locale === "fr" || locale === "ar" ? locale : "en"
  const proficiencyOptions = [
    { value: "a1", label: t("proficiencyLevels.a1") },
    { value: "a2", label: t("proficiencyLevels.a2") },
    { value: "b1", label: t("proficiencyLevels.b1") },
    { value: "b2", label: t("proficiencyLevels.b2") },
    { value: "c1", label: t("proficiencyLevels.c1") },
    { value: "c2", label: t("proficiencyLevels.c2") },
    { value: "native", label: t("proficiencyLevels.native") },
  ]

  return (
    <FormSection title={`04 - ${t("languagesSection")}`} delay={0.15}>
      <form.Field name="languages">
        {(field) => {
          const selectedLanguageCodes = field.state.value.map(
            (language) => language.languageCode,
          )
          const canAddLanguage =
            field.state.value.length < LANGUAGE_CATALOG.length

          const addLanguage = () => {
            if (!canAddLanguage) return

            const nextLanguageCode =
              LANGUAGE_CATALOG.find(
                (entry) => !selectedLanguageCodes.includes(entry.code),
              )?.code ?? DEFAULT_STUDENT_LANGUAGE_CODE

            field.handleChange([
              ...field.state.value,
              {
                languageCode: nextLanguageCode,
                proficiency: DEFAULT_STUDENT_LANGUAGE_PROFICIENCY,
              },
            ])
          }

          const removeLanguage = (index: number) => {
            field.handleChange(
              field.state.value.filter(
                (_, currentIndex) => currentIndex !== index,
              ),
            )
          }

          const updateLanguageCode = (index: number, languageCode: string) => {
            field.handleChange(
              field.state.value.map((entry, currentIndex) =>
                currentIndex === index
                  ? {
                      ...entry,
                      languageCode:
                        languageCode as (typeof field.state.value)[number]["languageCode"],
                    }
                  : entry,
              ),
            )
          }

          const updateProficiency = (index: number, proficiency: string) => {
            field.handleChange(
              field.state.value.map((entry, currentIndex) =>
                currentIndex === index
                  ? {
                      ...entry,
                      proficiency:
                        proficiency as (typeof field.state.value)[number]["proficiency"],
                    }
                  : entry,
              ),
            )
          }

          return (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {t("languagesHint")}
              </p>

              {field.state.value.map((language, index) => {
                const languageLabel =
                  LANGUAGE_CATALOG.find(
                    (entry) => entry.code === language.languageCode,
                  )?.labels[languageLocale] ?? language.languageCode

                return (
                  <div
                    key={`${language.languageCode}-${index}`}
                    className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <SelectField
                      id={`student-language-code-${index}`}
                      label={t("language")}
                      placeholder={t("languagePlaceholder")}
                      icon={Languages}
                      options={LANGUAGE_CATALOG.map((entry) => ({
                        value: entry.code,
                        label: entry.labels[languageLocale],
                        disabled:
                          selectedLanguageCodes.includes(entry.code) &&
                          entry.code !== language.languageCode,
                      }))}
                      value={language.languageCode}
                      onChange={(value) => updateLanguageCode(index, value)}
                    />

                    <SelectField
                      id={`student-language-proficiency-${index}`}
                      label={t("proficiency")}
                      placeholder={t("proficiencyPlaceholder")}
                      icon={GraduationCap}
                      options={proficiencyOptions}
                      value={language.proficiency}
                      onChange={(value) => updateProficiency(index, value)}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-none"
                      onClick={() => removeLanguage(index)}
                      aria-label={t("removeLanguageAria", {
                        language: languageLabel,
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-none"
                onClick={addLanguage}
                disabled={!canAddLanguage}
              >
                <Plus className="h-4 w-4" />
                {t("addLanguage")}
              </Button>

              {field.state.meta.errors.length > 0 ? (
                <p
                  className="text-destructive text-[11px] tracking-wide"
                  role="alert"
                >
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          )
        }}
      </form.Field>
    </FormSection>
  )
}
