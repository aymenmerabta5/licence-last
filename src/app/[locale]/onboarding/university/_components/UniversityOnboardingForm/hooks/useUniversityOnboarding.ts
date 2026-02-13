"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/routing"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { createUniversityOnboardingSchema } from "@/lib/schemas/university"
import { orpcClient } from "@/server/orpc/client"

export type UniversityOnboardingFormApi = ReturnType<typeof useUniversityOnboarding>["form"]

export function useUniversityOnboarding() {
  const t = useTranslations("onboarding.university")
  const tv = useTranslations("auth.validation")
  const router = useRouter()
  const [serverError, setServerError] = useState("")

  const schema = useMemo(() => createUniversityOnboardingSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      name: "",
      abbreviation: "",
      departmentName: "",
      deanName: "",
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
        const departments = value.departments.filter((d) => d.name.trim().length > 0)

        await orpcClient.universities.create({
          name: value.name,
          abbreviation: value.abbreviation || undefined,
          departmentName: value.departmentName || undefined,
          deanName: value.deanName || undefined,
          phone: value.phone || undefined,
          wilayaCode: value.wilayaCode || undefined,
          city: value.city || undefined,
          address: value.address || undefined,
          domains,
          departments: departments.length > 0 ? departments : undefined,
        })

        router.push("/dashboard/admin/pending")
      } catch (err) {
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  return { form, serverError }
}
