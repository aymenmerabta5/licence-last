"use client"

import { Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { LanguageRequirementRow } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/LanguageRequirementRow"
import { FormSection } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_OFFER_LANGUAGE_CODE,
  DEFAULT_OFFER_LANGUAGE_REQUIRED,
  DEFAULT_OFFER_LANGUAGE_WEIGHT,
  DEFAULT_OFFER_MINIMUM_PROFICIENCY,
  LANGUAGE_CATALOG,
  type SupportedLocale,
} from "@/lib/constants/languages"
import { errorMessage } from "@/lib/schemas/auth"

interface LanguageRequirementsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

interface LanguageRequirementValue {
  languageCode: string
  minimumProficiency: string
  isRequired: boolean
  weight: number
}

interface LanguageRequirementsField {
  state: {
    value: LanguageRequirementValue[]
    meta: { errors: unknown[] }
  }
  handleChange: (value: LanguageRequirementValue[]) => void
}

const PROFICIENCY_LEVELS = [
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
  "native",
] as const
const WEIGHT_VALUES = [1, 2, 3, 4, 5] as const

function resolveLanguageLocale(locale: string): SupportedLocale {
  if (locale === "fr" || locale === "ar") return locale
  return "en"
}

function updateRequirement(
  values: LanguageRequirementValue[],
  index: number,
  updates: Partial<LanguageRequirementValue>,
) {
  return values.map((entry, currentIndex) =>
    currentIndex === index
      ? {
          ...entry,
          ...updates,
        }
      : entry,
  )
}

export function LanguageRequirementsSection({
  form,
}: LanguageRequirementsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const languageLocale = resolveLanguageLocale(useLocale())

  const proficiencyOptions = useMemo(
    () =>
      PROFICIENCY_LEVELS.map((value) => ({
        value,
        label: t(`proficiencyLevels.${value}`),
      })),
    [t],
  )

  const weightOptions = useMemo(
    () =>
      WEIGHT_VALUES.map((weight) => ({
        value: String(weight),
        label: t("weightOption", { weight }),
      })),
    [t],
  )

  return (
    <FormSection title={t("languageRequirementsSection")} delay={0.22}>
      <p className="text-xs text-muted-foreground">
        {t("languageRequirementsHint")}
      </p>

      <form.Field name="languageRequirements">
        {(field: LanguageRequirementsField) => {
          const selectedLanguageCodes = field.state.value.map(
            (requirement) => requirement.languageCode,
          )
          const canAddLanguage =
            field.state.value.length < LANGUAGE_CATALOG.length

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
              field.state.value.filter(
                (_, currentIndex) => currentIndex !== index,
              ),
            )
          }

          return (
            <div className="space-y-4">
              {field.state.value.map((requirement, index) => (
                <LanguageRequirementRow
                  key={`${requirement.languageCode}-${index}`}
                  index={index}
                  requirement={requirement}
                  selectedLanguageCodes={selectedLanguageCodes}
                  languageLocale={languageLocale}
                  proficiencyOptions={proficiencyOptions}
                  weightOptions={weightOptions}
                  onLanguageCodeChange={(currentIndex, languageCode) => {
                    field.handleChange(
                      updateRequirement(field.state.value, currentIndex, {
                        languageCode,
                      }),
                    )
                  }}
                  onMinimumProficiencyChange={(
                    currentIndex,
                    minimumProficiency,
                  ) => {
                    field.handleChange(
                      updateRequirement(field.state.value, currentIndex, {
                        minimumProficiency,
                      }),
                    )
                  }}
                  onWeightChange={(currentIndex, weight) => {
                    field.handleChange(
                      updateRequirement(field.state.value, currentIndex, {
                        weight,
                      }),
                    )
                  }}
                  onRequiredChange={(currentIndex, isRequired) => {
                    field.handleChange(
                      updateRequirement(field.state.value, currentIndex, {
                        isRequired,
                      }),
                    )
                  }}
                  onRemove={removeLanguageRequirement}
                  t={t}
                />
              ))}

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
