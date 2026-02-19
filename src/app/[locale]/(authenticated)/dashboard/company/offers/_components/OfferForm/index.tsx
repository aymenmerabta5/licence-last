"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { BasicInfoSection } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/BasicInfoSection"
import { CopilotPanel } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/CopilotPanel"
import { DetailsSection } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/DetailsSection"
import { LanguageRequirementsSection } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/LanguageRequirementsSection"
import { SkillsSection } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/SkillsSection"
import { useOfferCopilot } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useOfferCopilot"
import { useOfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useOfferForm"
import { useSkillTags } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/hooks/useSkillTags"
import type { OfferFormProps } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/types"
import { ServerError } from "@/components/ServerError"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { isLanguageRequirementsEnabledOnClient } from "@/lib/feature-flags-client"

export function OfferForm({ mode, initialData }: OfferFormProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const router = useRouter()
  const isLanguageRequirementsEnabled = isLanguageRequirementsEnabledOnClient()

  const skillTags = useSkillTags()
  const { form, serverError } = useOfferForm(mode, initialData)
  const copilot = useOfferCopilot(form, skillTags)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      {/* Header */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2">
          {mode === "create" ? t("createTitle") : t("editTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          {mode === "create" ? t("createSubtitle") : t("editSubtitle")}
        </p>
      </motion.div>

      <ServerError message={serverError} />

      <CopilotPanel
        aiPrompt={copilot.aiPrompt}
        onAiPromptChange={copilot.setAiPrompt}
        activeIntent={copilot.activeIntent}
        isPending={copilot.isPending}
        error={copilot.error}
        result={copilot.result}
        skillTags={skillTags}
        onSendIntent={copilot.sendIntent}
        onApply={copilot.applyToForm}
      />

      <BasicInfoSection form={form} />
      <DetailsSection form={form} />
      {isLanguageRequirementsEnabled ? (
        <LanguageRequirementsSection form={form} />
      ) : null}
      <SkillsSection form={form} skillTags={skillTags} />

      {/* Submit */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="flex items-center gap-3"
      >
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "create" ? t("submit") : t("submitEdit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
        <Button
          type="button"
          variant="outline"
          className="h-12"
          onClick={() =>
            router.push("/dashboard/company/offers" as "/dashboard")
          }
        >
          {t("cancel")}
        </Button>
      </motion.div>
    </form>
  )
}
