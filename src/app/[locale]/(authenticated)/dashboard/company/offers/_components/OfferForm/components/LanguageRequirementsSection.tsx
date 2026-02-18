"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Languages, Plus, Trash2 } from "lucide-react"

import { FormSection } from "@/components/form-fields"
import { CheckboxField } from "@/components/form-fields"
import { SelectField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_OFFER_LANGUAGE_CODE,
  DEFAULT_OFFER_LANGUAGE_REQUIRED,
  DEFAULT_OFFER_LANGUAGE_WEIGHT,
  DEFAULT_OFFER_MINIMUM_PROFICIENCY,
  LANGUAGE_CATALOG,
} from "@/lib/constants/languages"
import { errorMessage } from "@/lib/schemas/auth"

interface LanguageRequirementsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function LanguageRequirementsSection({
  form,
}: LanguageRequirementsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const locale = useLocale()
  const languageLocale =
    locale === "fr" || locale === "ar" ? locale : "en"

  const proficiencyOptions = useMemo(
    () => [
      { value: "a1", label: t("proficiencyLevels.a1") },
      { value: "a2", label: t("proficiencyLevels.a2") },
      { value: "b1", label: t("proficiencyLevels.b1") },
      { value: "b2", label: t("proficiencyLevels.b2") },
      { value: "c1", label: t("proficiencyLevels.c1") },
      { value: "c2", label: t("proficiencyLevels.c2") },
      { value: "native", label: t("proficiencyLevels.native") },
    ],
    [t],
  )

  const weightOptions = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((weight) => ({
        value: String(weight),
        label: t("weightOption", { weight }),
      })),
    [t],
  )

  return (
    <FormSection title={t("languageRequirementsSection")} delay={0.22}>
      <p className="text-xs text-muted-foreground">{t("languageRequirementsHint")}</p>

      <form.Field name="languageRequirements">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const selectedLanguageCodes: string[] = field.state.value.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (requirement: any) => requirement.languageCode,
          )
          const canAddLanguage = field.state.value.length < LANGUAGE_CATALOG.length

          const addLanguageRequirement = () => {
            if (!canAddLanguage) return

            const nextLanguageCode =
              LANGUAGE_CATALOG.find(
                (entry) => !selectedLanguageCodes.includes(entry.code),
              )?.code ?? DEFAULT_OFFER_LANGUAGE_CODE

            field.handleChange([
              ...field.state.value,
              {
                languageCode: nextLanguageCode,
                minimumProficiency: DEFAULT_OFFER_MINIMUM_PROFICIENCY,
                isRequired: DEFAULT_OFFER_LANGUAGE_REQUIRED,
                weight: DEFAULT_OFFER_LANGUAGE_WEIGHT,
              },
            ])
          }

          const removeLanguageRequirement = (index: number) => {
            field.handleChange(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              field.state.value.filter((_: any, currentIndex: number) => currentIndex !== index),
            )
          }

          const updateLanguageCode = (index: number, languageCode: string) => {
            field.handleChange(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              field.state.value.map((entry: any, currentIndex: number) =>
                currentIndex === index
                  ? {
                      ...entry,
                      languageCode,
                    }
                  : entry,
              ),
            )
          }

          const updateMinimumProficiency = (index: number, minimumProficiency: string) => {
            field.handleChange(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              field.state.value.map((entry: any, currentIndex: number) =>
                currentIndex === index
                  ? {
                      ...entry,
                      minimumProficiency,
                    }
                  : entry,
              ),
            )
          }

          return (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {field.state.value.map((requirement: any, index: number) => {
                const languageLabel =
                  LANGUAGE_CATALOG.find((entry) => entry.code === requirement.languageCode)
                    ?.labels[languageLocale] ?? requirement.languageCode

                return (
                    <div
                      key={`${requirement.languageCode}-${index}`}
                      className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
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
                      onChange={(value) => updateLanguageCode(index, value)}
                    />

                    <SelectField
                      id={`offer-language-minimum-proficiency-${index}`}
                      label={t("minimumProficiency")}
                      placeholder={t("minimumProficiencyPlaceholder")}
                      icon={Languages}
                      options={proficiencyOptions}
                      value={requirement.minimumProficiency}
                      onChange={(value) => updateMinimumProficiency(index, value)}
                    />

                    <SelectField
                      id={`offer-language-weight-${index}`}
                      label={t("weight")}
                      placeholder={t("weightPlaceholder")}
                      icon={Languages}
                      options={weightOptions}
                      value={String(requirement.weight)}
                      onChange={(value) => {
                        field.handleChange(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          field.state.value.map((entry: any, currentIndex: number) =>
                            currentIndex === index
                              ? {
                                  ...entry,
                                  weight: Number(value),
                                }
                              : entry,
                          ),
                        )
                      }}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-none"
                      onClick={() => removeLanguageRequirement(index)}
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
                        onChange={(checked) => {
                          field.handleChange(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            field.state.value.map((entry: any, currentIndex: number) =>
                              currentIndex === index
                                ? {
                                    ...entry,
                                    isRequired: checked,
                                  }
                                : entry,
                            ),
                          )
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-none"
                onClick={addLanguageRequirement}
                disabled={!canAddLanguage}
              >
                <Plus className="h-4 w-4" />
                {t("addLanguageRequirement")}
              </Button>

              {field.state.meta.errors.length > 0 && (
                <p
                  className="text-destructive text-[11px] tracking-wide"
                  role="alert"
                >
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )
        }}
      </form.Field>
    </FormSection>
  )
}
