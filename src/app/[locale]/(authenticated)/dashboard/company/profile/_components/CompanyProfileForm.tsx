"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ImagePlus,
} from "lucide-react"

import { createCompanyProfileSchema } from "@/lib/schemas/offer"
import { errorMessage } from "@/lib/schemas/auth"
import { orpcClient } from "@/server/orpc/client"
import { WILAYAS } from "@/lib/wilayas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

interface CompanyProfileFormProps {
  initialData: {
    description: string
    logoUrl: string
    websiteUrl: string
    phone: string
    contactEmail: string
    representativeName: string
    wilayaCode: number
    address: string
  }
}

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
  const t = useTranslations("dashboard.company.profile")
  const tv = useTranslations("auth.validation")

  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl)
  const [isUploading, setIsUploading] = useState(false)

  const schema = useMemo(() => createCompanyProfileSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      description: initialData.description,
      logoUrl: initialData.logoUrl,
      websiteUrl: initialData.websiteUrl,
      phone: initialData.phone,
      contactEmail: initialData.contactEmail,
      representativeName: initialData.representativeName,
      wilayaCode: initialData.wilayaCode,
      address: initialData.address,
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

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setSuccessMessage("")

      try {
        await orpcClient.companies.update({
          description: value.description || undefined,
          logoUrl: value.logoUrl || undefined,
          websiteUrl: value.websiteUrl || undefined,
          phone: value.phone || undefined,
          contactEmail: value.contactEmail || undefined,
          representativeName: value.representativeName || undefined,
          wilayaCode: value.wilayaCode || undefined,
          address: value.address || undefined,
        })

        setSuccessMessage(t("success"))
      } catch (err) {
        setServerError(err instanceof Error ? err.message : t("error"))
      }
    },
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setServerError("")

    try {
      const result = await orpcClient.companies.uploadLogo({ file })

      setLogoUrl(result.url)
      form.setFieldValue("logoUrl", result.url)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t("error"))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      {/* ── Server Error ── */}
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

      {/* ── Success Message ── */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-2.5 p-3.5 text-sm text-green-700 bg-green-50 border border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* ── Logo Upload ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-3"
      >
        <Label className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
          {t("logo")}
        </Label>
          <div className="flex items-center gap-4">
          {logoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
              src={logoUrl}
              alt="Company logo"
              className="h-16 w-16 rounded-lg object-cover border border-border"
              />
            </>
          ) : (
            <div className="h-16 w-16 rounded-lg border border-dashed border-border flex items-center justify-center">
              <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
            </div>
          )}
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("logoUploading")}
                </>
              ) : (
                <>
                  <ImagePlus className="h-3.5 w-3.5" />
                  {t("logoUpload")}
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-[10px] text-muted-foreground mt-1">
              {t("logoHint")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Fields ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-description"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("description")}
              </Label>
              <div className="relative">
                <FileText className="absolute start-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <textarea
                  id="company-description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("descriptionPlaceholder")}
                  rows={4}
                  className="w-full rounded-none border border-input bg-transparent ps-10 pe-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                />
              </div>
            </div>
          )}
        </form.Field>

        {/* Website */}
        <form.Field name="websiteUrl">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-website"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("websiteUrl")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Globe className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company-website"
                  type="url"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("websiteUrlPlaceholder")}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-[11px] tracking-wide" role="alert">
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Phone */}
        <form.Field name="phone">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-phone"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("phone")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Phone className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company-phone"
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("phonePlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>

        {/* Contact Email */}
        <form.Field name="contactEmail">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-contact-email"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("contactEmail")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Mail className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company-contact-email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("contactEmailPlaceholder")}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-[11px] tracking-wide" role="alert">
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Representative Name */}
        <form.Field name="representativeName">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-rep-name"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("representativeName")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <User className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company-rep-name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("representativeNamePlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>

        {/* Wilaya */}
        <form.Field name="wilayaCode">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-wilaya"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("wilaya")}
              </Label>
              <div className="relative">
                <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                <select
                  id="company-wilaya"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  className="w-full h-11 rounded-none border border-input bg-transparent ps-10 pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value={0} disabled>
                    {t("wilayaPlaceholder")}
                  </option>
                  {WILAYAS.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, "0")} — {name}
                    </option>
                  ))}
                </select>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-[11px] tracking-wide" role="alert">
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Address */}
        <form.Field name="address">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-address"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("address")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <MapPin className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company-address"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("addressPlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>
      </motion.div>

      {/* ── Submit ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
      >
        <form.Subscribe
          selector={(state) => [state.isSubmitting] as const}
        >
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
                t("submit")
              )}
            </Button>
          )}
        </form.Subscribe>
      </motion.div>
    </form>
  )
}
