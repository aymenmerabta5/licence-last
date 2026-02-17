import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { FileText, Globe, Mail, MapPin, Phone, User, Building2 } from "lucide-react"

import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { ease } from "@/lib/animations"
import { WILAYA_OPTIONS } from "@/lib/wilayas"

interface ProfileFieldsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

function SectionDivider({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="h-px flex-1 bg-border/30" />
      <div className="flex items-center gap-1.5 shrink-0">
        <Icon className="h-3 w-3 text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
          {label}
        </span>
      </div>
      <div className="h-px flex-1 bg-border/30" />
    </div>
  )
}

export function ProfileFieldsSection({ form }: ProfileFieldsSectionProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <div className="space-y-8">
      {/* About section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.15 }}
        className="space-y-5"
      >
        <SectionDivider icon={FileText} label={t("descriptionLabel") ?? "About"} />
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
      </motion.div>

      {/* Contact section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.25 }}
        className="space-y-5"
      >
        <SectionDivider icon={User} label={t("contactLabel") ?? "Contact"} />

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>
      </motion.div>

      {/* Location section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.35 }}
        className="space-y-5"
      >
        <SectionDivider icon={Building2} label={t("locationLabel") ?? "Location"} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>
      </motion.div>
    </div>
  )
}
