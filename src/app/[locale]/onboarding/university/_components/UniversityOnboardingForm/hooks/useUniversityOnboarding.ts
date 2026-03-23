"use client"

import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { resolveLocalizedError } from "@/lib/error-message"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { createUniversityOnboardingSchema } from "@/lib/schemas/university"
import { orpcClient } from "@/server/orpc/client"

export type UniversityOnboardingFormApi = ReturnType<
  typeof useUniversityOnboarding
>["form"]

export function useUniversityOnboarding() {
  const tr = useTranslations()
  const tv = useTranslations("auth.validation")
  const router = useRouter()
  const [serverError, setServerError] = useState("")

  const schema = useMemo(() => createUniversityOnboardingSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      name: "",
      abbreviation: "",
      phone: "",
      wilayaCode: 0,
      city: "",
      address: "",
      domains: [""],
      departments: [] as { name: string }[],
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        // Filter out empty domain strings
        const domains = value.domains.filter((d) => d.trim().length > 0)
        // Filter out empty department names
        const departments = value.departments.filter(
          (d) => d.name.trim().length > 0,
        )

        await orpcClient.universities.create({
          name: value.name,
          abbreviation: value.abbreviation || undefined,

          phone: value.phone || undefined,
          wilayaCode: value.wilayaCode || undefined,
          city: value.city || undefined,
          address: value.address || undefined,
          domains,
          departments: departments.length > 0 ? departments : undefined,
        })

        // Refresh session cookie cache so downstream pages see onboardingCompleted=true
        await authClient.getSession({ query: { disableCookieCache: true } })

        router.push("/status/university/pending")
      } catch (err) {
        setServerError(
          resolveLocalizedError(err, {
            t: tr,
            fallbackKey: "onboarding.university.error",
          }),
        )
      }
    },
  })

  return { form, serverError }
}
