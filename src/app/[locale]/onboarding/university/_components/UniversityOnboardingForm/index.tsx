"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DepartmentFields } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/components/DepartmentFields"
import { DomainFields } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/components/DomainFields"
import { LocationFields } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/components/LocationFields"
import { UniversityFields } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/components/UniversityFields"
import { useUniversityOnboarding } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/hooks/useUniversityOnboarding"
import { FormHeader } from "@/components/FormHeader"
import { FormSection } from "@/components/form-fields"
import { ServerError } from "@/components/ServerError"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

export function UniversityOnboardingForm() {
  const t = useTranslations("onboarding.university")
  const { form, serverError } = useUniversityOnboarding()

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

      <FormSection title={`01 — ${t("universitySection")}`} delay={0.05}>
        <UniversityFields form={form} />
      </FormSection>

      <FormSection title={`02 — ${t("locationSection")}`} delay={0.1}>
        <LocationFields form={form} />
      </FormSection>

      <FormSection title={`03 — ${t("domainsSection")}`} delay={0.15}>
        <DomainFields form={form} />
      </FormSection>

      <FormSection title={`04 — ${t("departmentsSection")}`} delay={0.2}>
        <DepartmentFields form={form} />
      </FormSection>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
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
