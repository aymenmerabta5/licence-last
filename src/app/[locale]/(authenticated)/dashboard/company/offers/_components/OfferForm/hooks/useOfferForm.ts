"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/routing"
import { createOfferSchema } from "@/lib/schemas/offer"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { orpc, orpcClient } from "@/server/orpc/client"

import type { OfferFormProps } from "../types"

export function useOfferForm(
  mode: OfferFormProps["mode"],
  initialData: OfferFormProps["initialData"],
) {
  const tv = useTranslations("auth.validation")
  const t = useTranslations("dashboard.company.offers.form")
  const router = useRouter()
  const queryClient = useQueryClient()

  const [serverError, setServerError] = useState("")

  const schema = useMemo(() => createOfferSchema(tv), [tv])
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
      skillTagIds: initialData?.skillTagIds ?? ([] as string[]),
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
            workMode: value.workMode
              ? (value.workMode as "on_site" | "hybrid" | "remote")
              : undefined,
            wilayaCode: value.wilayaCode || undefined,
            durationWeeks: value.durationWeeks || undefined,
            maxPositions: value.maxPositions || undefined,
            skillTagIds: value.skillTagIds,
          })
        } else {
          await orpcClient.offers.update({
            offerId: initialData!.offerId,
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
            skillTagIds: value.skillTagIds,
          })
        }

        await queryClient.invalidateQueries({ queryKey: offersQueryKey })
        router.push("/dashboard/company/offers" as "/dashboard")
      } catch (err) {
        setServerError(err instanceof Error ? err.message : t("error"))
      }
    },
  })

  return { form, serverError }
}
