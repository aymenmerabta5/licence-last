"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowRight, Loader2 } from "lucide-react"

import { useRouter } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { ServerError } from "@/components/ServerError"

import { useOfferForm } from "./hooks/useOfferForm"
import { useOfferCopilot } from "./hooks/useOfferCopilot"
import { useSkillTags } from "./hooks/useSkillTags"
import { CopilotPanel } from "./components/CopilotPanel"
import { BasicInfoSection } from "./components/BasicInfoSection"
import { DetailsSection } from "./components/DetailsSection"
import { SkillsSection } from "./components/SkillsSection"
import type { OfferFormProps } from "./types"

export function OfferForm({ mode, initialData }: OfferFormProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const router = useRouter()

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
        aiIntent={copilot.aiIntent}
        aiStatus={copilot.aiStatus}
        aiError={copilot.aiError}
        previewOutput={copilot.getPreviewOutput()}
        onSendIntent={copilot.sendIntent}
        onApply={copilot.applyToForm}
      />

      <BasicInfoSection form={form} />
      <DetailsSection form={form} />
      <SkillsSection form={form} skillTags={skillTags} />

      {/* Submit */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="flex items-center gap-3"
      >
        <form.Subscribe
          selector={(state) => [state.isSubmitting] as const}
        >
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
