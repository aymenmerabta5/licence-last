"use client"

import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { createUniversityUpdateSchema } from "@/lib/schemas/university"
import type { university } from "@/server/db/schema/universities"

type University = typeof university.$inferSelect

export type UniversityProfileFormApi = ReturnType<
  typeof useUniversityProfileForm
>["form"]

interface UseUniversityProfileFormOptions {
  university: University | null
  onSubmit: (values: {
    name?: string
    abbreviation?: string | null
    phone?: string | null
    wilayaCode?: number | null
    city?: string | null
    address?: string | null
  }) => void
}

export function useUniversityProfileForm({
  university,
  onSubmit,
}: UseUniversityProfileFormOptions) {
  const tv = useTranslations("auth.validation")
  const schema = useMemo(() => createUniversityUpdateSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      name: "",
      abbreviation: "",
      phone: "",
      wilayaCode: "",
      city: "",
      address: "",
    },
    validators: {
      onSubmit: ({ value }) =>
        mapZodErrors(
          schema.safeParse({
            name: value.name,
            abbreviation: value.abbreviation || undefined,
            phone: value.phone || undefined,
            wilayaCode:
              value.wilayaCode.trim().length > 0
                ? Number(value.wilayaCode)
                : undefined,
            city: value.city || undefined,
            address: value.address || undefined,
          }),
        ),
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        name: value.name.trim(),
        abbreviation: value.abbreviation.trim() || null,
        phone: value.phone.trim() || null,
        wilayaCode: value.wilayaCode.trim() ? Number(value.wilayaCode) : null,
        city: value.city.trim() || null,
        address: value.address.trim() || null,
      })
    },
  })

  useEffect(() => {
    if (!university) return
    form.setFieldValue("name", university.name)
    form.setFieldValue("abbreviation", university.abbreviation ?? "")
    form.setFieldValue("phone", university.phone ?? "")
    form.setFieldValue(
      "wilayaCode",
      university.wilayaCode !== null ? String(university.wilayaCode) : "",
    )
    form.setFieldValue("city", university.city ?? "")
    form.setFieldValue("address", university.address ?? "")
  }, [form, university])

  return { form }
}
