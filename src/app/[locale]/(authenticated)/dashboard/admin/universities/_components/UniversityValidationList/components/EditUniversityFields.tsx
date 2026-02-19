"use client"

import { useTranslations } from "next-intl"
import { Building2, MapPin, Phone } from "lucide-react"

import { TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"

interface EditUniversityFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function EditUniversityFields({ form }: EditUniversityFieldsProps) {
  const t = useTranslations("dashboard.admin.universities.editDialog")

  return (
    <>
      <form.Field name="name">
        {(field: {
          state: { value: string; meta: { errors: unknown[] } }
          handleChange: (value: string) => void
          handleBlur: () => void
        }) => (
          <TextField
            id="edit-university-name"
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
              id="edit-university-abbreviation"
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
              id="edit-university-phone"
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
              id="edit-university-wilaya"
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
              id="edit-university-city"
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
            id="edit-university-address"
            label={t("address")}
            icon={MapPin}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("addressPlaceholder")}
          />
        )}
      </form.Field>
    </>
  )
}
