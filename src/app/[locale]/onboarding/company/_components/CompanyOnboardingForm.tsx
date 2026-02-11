"use client"

import { useMemo, useState } from "react"
import * as motion from "motion/react-client"
import { useForm } from "@tanstack/react-form"
import { AlertCircle, ArrowRight, Building2, FileText, Globe, Loader2, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { useRouter } from "@/i18n/routing"
import { errorMessage } from "@/lib/schemas/auth"
import { createCompanyOnboardingSchema } from "@/lib/schemas/company"
import { WILAYAS } from "@/lib/wilayas"
import { orpcClient } from "@/server/orpc/client"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

export function CompanyOnboardingForm() {
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
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        const fieldErrors: Record<string, string> = {}

        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path[0]
            if (path !== undefined && !fieldErrors[String(path)]) {
              fieldErrors[String(path)] = issue.message
            }
          }
        }

        return Object.keys(fieldErrors).length > 0 ? { fields: fieldErrors } : undefined
      },
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

        router.push("/dashboard/company/pending")
      } catch (err) {
        setServerError(err instanceof Error ? err.message : t("error"))
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      {serverError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-2.5 p-3.5 text-sm text-destructive bg-destructive/5 border border-destructive/15"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </motion.div>
      )}

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <form.Field name="name">
          {(field) => (
            <TextField
              id="company-name"
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

        <form.Field name="description">
          {(field) => (
            <TextAreaField
              id="company-description"
              label={t("description")}
              icon={FileText}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
            />
          )}
        </form.Field>

        <form.Field name="websiteUrl">
          {(field) => (
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

        <form.Field name="wilayaCode">
          {(field) => (
            <SelectField
              id="company-wilaya"
              label={t("wilaya")}
              icon={MapPin}
              value={field.state.value}
              onChange={(value) => field.handleChange(Number(value))}
              onBlur={field.handleBlur}
              placeholder={t("wilayaPlaceholder")}
              options={WILAYAS.map((name, i) => ({
                value: i + 1,
                label: `${String(i + 1).padStart(2, "0")} - ${name}`,
              }))}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
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

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
      >
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </motion.div>
    </form>
  )
}
