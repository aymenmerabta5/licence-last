"use client"

import {
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { CompanyProfileFormApi } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/hooks/useCompanyProfileForm"
import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { ease, reveal } from "@/lib/animations"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYA_OPTIONS } from "@/lib/wilayas"

interface ProfileFieldsSectionProps {
  form: CompanyProfileFormApi
}

interface EditorialSectionProps {
  icon: React.ElementType
  title: string
  delay: number
  children: React.ReactNode
}

function EditorialSection({
  icon: Icon,
  title,
  delay,
  children,
}: EditorialSectionProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay }}
      className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-serif text-base text-heading">{title}</h2>
      </div>
      {/* Section body */}
      <div className="p-6 space-y-5">{children}</div>
    </motion.div>
  )
}

export function ProfileFieldsSection({ form }: ProfileFieldsSectionProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <div className="space-y-6">
      {/* ── About ──────────────────────────────────────── */}
      <EditorialSection
        icon={FileText}
        title={t("descriptionLabel") ?? "About"}
        delay={0.1}
      >
        <form.Field name="description">
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (v: string) => void
            handleBlur: () => void
          }) => (
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
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (v: string) => void
            handleBlur: () => void
          }) => (
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
      </EditorialSection>

      {/* ── Contact ────────────────────────────────────── */}
      <EditorialSection
        icon={User}
        title={t("contactLabel") ?? "Contact"}
        delay={0.2}
      >
        <form.Field name="representativeName">
          {(field: {
            state: { value: string; meta: { errors: unknown[] } }
            handleChange: (v: string) => void
            handleBlur: () => void
          }) => (
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
            {(field: {
              state: { value: string; meta: { errors: unknown[] } }
              handleChange: (v: string) => void
              handleBlur: () => void
            }) => (
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
            {(field: {
              state: { value: string; meta: { errors: unknown[] } }
              handleChange: (v: string) => void
              handleBlur: () => void
            }) => (
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
      </EditorialSection>

      {/* ── Location ───────────────────────────────────── */}
      <EditorialSection
        icon={Building2}
        title={t("locationLabel") ?? "Location"}
        delay={0.3}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <form.Field name="wilayaCode">
            {(field: {
              state: { value: number; meta: { errors: unknown[] } }
              handleChange: (v: number) => void
              handleBlur: () => void
            }) => (
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
            {(field: {
              state: { value: string; meta: { errors: unknown[] } }
              handleChange: (v: string) => void
              handleBlur: () => void
            }) => (
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
      </EditorialSection>
    </div>
  )
}
