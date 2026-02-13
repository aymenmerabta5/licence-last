"use client"

import * as motion from "motion/react-client"
import { ArrowRight, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ServerError } from "@/components/ServerError"
import { reveal, ease } from "@/lib/animations"

import { useCompanyOnboarding } from "./hooks/useCompanyOnboarding"
import { OnboardingHeader } from "./components/OnboardingHeader"
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
      className="space-y-7"
    >
      <OnboardingHeader />
      <ServerError message={serverError} />

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <CompanyFields form={form} />
        <LocationFields form={form} />
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
