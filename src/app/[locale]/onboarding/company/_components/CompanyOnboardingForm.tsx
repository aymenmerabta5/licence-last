"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import {
  Building2,
  Globe,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"

import { useRouter } from "@/i18n/routing"
import { createCompanyOnboardingSchema } from "@/lib/schemas/company"
import { errorMessage } from "@/lib/schemas/auth"
import { orpcClient } from "@/server/orpc/client"
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

/* ── Wilayas of Algeria (1-58) ── */
const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna",
  "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou",
  "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine",
  "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès",
  "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma",
  "Aïn Témouchent", "Ghardaïa", "Relizane",
  "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Badji Mokhtar",
  "Béni Abbès", "Timimoun", "Touggourt", "Djanet",
  "In Salah", "In Guezzam",
] as const

export function CompanyOnboardingForm() {
  const t = useTranslations("onboarding.company")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")

  const schema = useMemo(
    () => createCompanyOnboardingSchema(tv),
    [tv],
  )

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

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined
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
        setServerError(
          err instanceof Error ? err.message : t("error"),
        )
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
      {/* ── Header ── */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

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

      {/* ── Fields ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        {/* Company Name */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="company-name"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("name")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Building2 className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company-name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("namePlaceholder")}
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
                  rows={3}
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
