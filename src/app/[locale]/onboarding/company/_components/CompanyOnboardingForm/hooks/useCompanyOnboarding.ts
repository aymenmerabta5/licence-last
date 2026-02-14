"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/routing"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { createCompanyOnboardingSchema } from "@/lib/schemas/company"
import { orpcClient } from "@/server/orpc/client"

export type CompanyOnboardingFormApi = ReturnType<typeof useCompanyOnboarding>["form"]

export function useCompanyOnboarding() {
  const t = useTranslations("onboarding.company")
  const tv = useTranslations("auth.validation")
  const router = useRouter()
  const [serverError, setServerError] = useState("")

  const schema = useMemo(() => createCompanyOnboardingSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      websiteUrl: "",
      wilayaCode: 0,
      address: "",
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        await orpcClient.companies.create({
          name: value.name,
          description: value.description || undefined,
          websiteUrl: value.websiteUrl || undefined,
          wilayaCode: value.wilayaCode,
          address: value.address || undefined,
        })

        router.push("/status/company/pending")
      } catch (err) {
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  return { form, serverError }
}
