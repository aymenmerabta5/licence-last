"use client"

import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { resolveLocalizedError } from "@/lib/error-message"
import { createCompanyOnboardingSchema } from "@/lib/schemas/company"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { orpcClient } from "@/server/orpc/client"

export type CompanyOnboardingFormApi = ReturnType<
  typeof useCompanyOnboarding
>["form"]

export function useCompanyOnboarding() {
  const tr = useTranslations()
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
      verificationDocument: null as File | null,
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        if (!value.verificationDocument) {
          setServerError(t("verificationDocumentRequired"))
          return
        }

        await orpcClient.companies.create({
          name: value.name,
          description: value.description || undefined,
          websiteUrl: value.websiteUrl || undefined,
          wilayaCode: value.wilayaCode,
          address: value.address || undefined,
          verificationDocument: value.verificationDocument,
        })

        // Refresh session cookie cache so downstream pages see onboardingCompleted=true
        await authClient.getSession({ query: { disableCookieCache: true } })

        router.push("/status/company/pending")
      } catch (err) {
        setServerError(
          resolveLocalizedError(err, {
            t: tr,
            fallbackKey: "onboarding.company.error",
          }),
        )
      }
    },
  })

  return { form, serverError }
}
