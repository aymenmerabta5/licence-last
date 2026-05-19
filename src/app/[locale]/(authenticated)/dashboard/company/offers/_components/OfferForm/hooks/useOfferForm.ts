"use client"

import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { OfferFormProps } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/types"
import { useRouter } from "@/i18n/routing"
import {
  DEFAULT_OFFER_LANGUAGE_CODE,
  DEFAULT_OFFER_LANGUAGE_REQUIRED,
  DEFAULT_OFFER_LANGUAGE_WEIGHT,
  DEFAULT_OFFER_MINIMUM_PROFICIENCY,
} from "@/lib/constants/languages"
import { isLanguageRequirementsEnabledOnClient } from "@/lib/feature-flags-client"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { createOfferSchema } from "@/lib/schemas/offer"
import { orpc, orpcClient } from "@/server/orpc/client"

function formatDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return ""

  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export type OfferFormApi = ReturnType<typeof useOfferForm>["form"]

export function useOfferForm(
  mode: OfferFormProps["mode"],
  initialData: OfferFormProps["initialData"],
) {
  const tv = useTranslations("auth.validation")
  const t = useTranslations("dashboard.company.offers.form")
  const router = useRouter()
  const queryClient = useQueryClient()
  const isLanguageRequirementsEnabled = isLanguageRequirementsEnabledOnClient()

  const [serverError, setServerError] = useState("")

  const schema = useMemo(
    () =>
      createOfferSchema(tv, {
        requireLanguageRequirements: isLanguageRequirementsEnabled,
      }),
    [isLanguageRequirementsEnabled, tv],
  )
  const offersQueryKey = useMemo(
    () => orpc.offers.listByCompany.queryOptions().queryKey,
    [],
  )

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      internshipType: (initialData?.internshipType ?? "") as
        | ""
        | "pfe"
        | "immersion"
        | "summer"
        | "practical",
      workMode: (initialData?.workMode ?? "") as
        | ""
        | "on_site"
        | "hybrid"
        | "remote",
      wilayaCode: initialData?.wilayaCode ?? 0,
      durationWeeks: initialData?.durationWeeks ?? 0,
      maxPositions: initialData?.maxPositions ?? 1,
      applicationDeadlineAt: formatDateInputValue(
        initialData?.applicationDeadlineAt,
      ),
      expectedStartDate: formatDateInputValue(initialData?.expectedStartDate),
      expectedEndDate: formatDateInputValue(initialData?.expectedEndDate),
      skillTagIds: initialData?.skillTagIds ?? ([] as string[]),
      languageRequirements:
        initialData?.languageRequirements ??
        (isLanguageRequirementsEnabled
          ? [
              {
                languageCode: DEFAULT_OFFER_LANGUAGE_CODE,
                minimumProficiency: DEFAULT_OFFER_MINIMUM_PROFICIENCY,
                isRequired: DEFAULT_OFFER_LANGUAGE_REQUIRED,
                weight: DEFAULT_OFFER_LANGUAGE_WEIGHT,
              },
            ]
          : []),
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        if (mode === "create") {
          await orpcClient.offers.create({
            title: value.title,
            description: value.description,
            internshipType: value.internshipType as
              | "pfe"
              | "immersion"
              | "summer"
              | "practical",
            workMode: value.workMode as "on_site" | "hybrid" | "remote",
            wilayaCode: value.wilayaCode,
            durationWeeks: value.durationWeeks,
            maxPositions: value.maxPositions,
            applicationDeadlineAt: value.applicationDeadlineAt,
            expectedStartDate: value.expectedStartDate,
            expectedEndDate: value.expectedEndDate,
            skillTagIds: value.skillTagIds,
            ...(isLanguageRequirementsEnabled
              ? { languageRequirements: value.languageRequirements }
              : {}),
          })
        } else {
          if (!initialData?.offerId) {
            throw new Error("Offer ID is required to update an offer")
          }

          await orpcClient.offers.update({
            offerId: initialData.offerId,
            title: value.title,
            description: value.description,
            internshipType: value.internshipType as
              | "pfe"
              | "immersion"
              | "summer"
              | "practical",
            workMode: value.workMode
              ? (value.workMode as "on_site" | "hybrid" | "remote")
              : null,
            wilayaCode: value.wilayaCode || null,
            durationWeeks: value.durationWeeks || null,
            maxPositions: value.maxPositions || undefined,
            applicationDeadlineAt: value.applicationDeadlineAt || null,
            expectedStartDate: value.expectedStartDate || null,
            expectedEndDate: value.expectedEndDate || null,
            skillTagIds: value.skillTagIds,
            ...(isLanguageRequirementsEnabled
              ? { languageRequirements: value.languageRequirements }
              : {}),
          })
        }

        await queryClient.invalidateQueries({ queryKey: offersQueryKey })
        toast.success(mode === "create" ? t("success") : t("successEdit"))
        router.push("/dashboard/company/offers" as "/dashboard")
      } catch {
        const message = t("error")
        setServerError(message)
        toast.error(message)
      }
    },
  })

  return { form, serverError }
}
