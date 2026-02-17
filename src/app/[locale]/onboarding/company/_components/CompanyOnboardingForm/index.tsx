"use client"

import * as motion from "motion/react-client"
import { ArrowRight, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ServerError } from "@/components/ServerError"
import { FormHeader } from "@/components/FormHeader"
import { FormSection } from "@/components/form-fields"
import { reveal, ease } from "@/lib/animations"

import { useCompanyOnboarding } from "./hooks/useCompanyOnboarding"
import { CompanyFields } from "./components/CompanyFields"
import { LocationFields } from "./components/LocationFields"

export function CompanyOnboardingForm() {
  const t = useTranslations("onboarding.company")
  const { form, serverError } = useCompanyOnboarding()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <ServerError message={serverError} />

      <FormSection title={`01 — ${t("companySection")}`} delay={0.05}>
        <CompanyFields form={form} />
      </FormSection>

      <FormSection title={`02 — ${t("locationSection")}`} delay={0.1}>
        <LocationFields form={form} />
      </FormSection>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className="pt-2"
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
