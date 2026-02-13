import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { FileText, Globe, Mail, MapPin, Phone, User } from "lucide-react"

import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { reveal, ease } from "@/lib/animations"
import { WILAYA_OPTIONS } from "@/lib/wilayas"

interface ProfileFieldsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function ProfileFieldsSection({ form }: ProfileFieldsSectionProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.1 }}
      className="space-y-5"
    >
      <form.Field name="description">
        {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => (
          <TextAreaField
            id="company-description"
            label={t("description")}
            icon={FileText}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("descriptionPlaceholder")}
            rows={4}
          />
        )}
      </form.Field>

      <form.Field name="websiteUrl">
        {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => (
          <TextField
            id="company-website"
            type="url"
            label={t("websiteUrl")}
            icon={Globe}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("websiteUrlPlaceholder")}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="phone">
        {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => (
          <TextField
            id="company-phone"
            type="tel"
            label={t("phone")}
            icon={Phone}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("phonePlaceholder")}
          />
        )}
      </form.Field>

      <form.Field name="contactEmail">
        {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => (
          <TextField
            id="company-contact-email"
            type="email"
            label={t("contactEmail")}
            icon={Mail}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("contactEmailPlaceholder")}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="representativeName">
        {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => (
          <TextField
            id="company-rep-name"
            label={t("representativeName")}
            icon={User}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("representativeNamePlaceholder")}
          />
        )}
      </form.Field>

      <form.Field name="wilayaCode">
        {(field: { state: { value: number; meta: { errors: unknown[] } }; handleChange: (v: number) => void; handleBlur: () => void }) => (
          <SelectField
            id="company-wilaya"
            label={t("wilaya")}
            icon={MapPin}
            value={field.state.value}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
            placeholder={t("wilayaPlaceholder")}
            options={WILAYA_OPTIONS}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="address">
        {(field: { state: { value: string; meta: { errors: unknown[] } }; handleChange: (v: string) => void; handleBlur: () => void }) => (
          <TextField
            id="company-address"
            label={t("address")}
            icon={MapPin}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            placeholder={t("addressPlaceholder")}
          />
        )}
      </form.Field>
    </motion.div>
  )
}
