"use client"

import { useForm } from "@tanstack/react-form"
import { Building2, Loader2, MapPin, Phone, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { TextField } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { errorMessage } from "@/lib/schemas/auth"
import { createUniversityUpdateSchema } from "@/lib/schemas/university"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { university } from "@/server/db/schema/universities"

type University = typeof university.$inferSelect

interface UniversityProfileFormProps {
  university: University | null
  onSubmit: (values: {
    name?: string
    abbreviation?: string | null
    phone?: string | null
    wilayaCode?: number | null
    city?: string | null
    address?: string | null
  }) => void
  isUpdating: boolean
}

export function UniversityProfileForm({
  university,
  onSubmit,
  isUpdating,
}: UniversityProfileFormProps) {
  const t = useTranslations("dashboard.universityProfile")
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
        wilayaCode: value.wilayaCode.trim()
          ? Number(value.wilayaCode)
          : null,
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <form.Field name="name">
        {(field: {
          state: { value: string; meta: { errors: unknown[] } }
          handleChange: (value: string) => void
          handleBlur: () => void
        }) => (
          <TextField
            id="university-name"
            label={t("name")}
            icon={Building2}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("namePlaceholder")}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field name="abbreviation">
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (value: string) => void
            handleBlur: () => void
          }) => (
            <TextField
              id="university-abbreviation"
              label={t("abbreviation")}
              icon={Building2}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("abbreviationPlaceholder")}
            />
          )}
        </form.Field>

        <form.Field name="phone">
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (value: string) => void
            handleBlur: () => void
          }) => (
            <TextField
              id="university-phone"
              label={t("phone")}
              icon={Phone}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("phonePlaceholder")}
            />
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field name="wilayaCode">
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (value: string) => void
            handleBlur: () => void
          }) => (
            <TextField
              id="university-wilaya"
              label={t("wilayaCode")}
              icon={MapPin}
              type="number"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("wilayaPlaceholder")}
              min="1"
              max="58"
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="city">
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (value: string) => void
            handleBlur: () => void
          }) => (
            <TextField
              id="university-city"
              label={t("city")}
              icon={MapPin}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("cityPlaceholder")}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="address">
        {(field: {
          state: { value: string; meta: { errors: unknown[] } }
          handleChange: (value: string) => void
          handleBlur: () => void
        }) => (
          <TextField
            id="university-address"
            label={t("address")}
            icon={MapPin}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("addressPlaceholder")}
          />
        )}
      </form.Field>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="editorial"
          size="editorial-sm"
          disabled={isUpdating}
          className="gap-2"
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {t("saveProfile")}
        </Button>
      </div>
    </form>
  )
}
