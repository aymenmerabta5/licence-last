import { Github, Globe } from "lucide-react"
import { useTranslations } from "next-intl"

import { FormSection, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import type { OnboardingFormApi } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"

interface StudentLinksSectionProps {
  form: OnboardingFormApi
}

export function StudentLinksSection({ form }: StudentLinksSectionProps) {
  const t = useTranslations("onboarding.student")

  return (
    <FormSection title={`03 - ${t("linksSection")}`} delay={0.1}>
      <form.Field name="githubUrl">
        {(field) => (
          <TextField
            id="student-github"
            type="url"
            label={t("githubUrl")}
            placeholder={t("githubUrlPlaceholder")}
            icon={Github}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>

      <form.Field name="portfolioUrl">
        {(field) => (
          <TextField
            id="student-portfolio"
            type="url"
            label={t("portfolioUrl")}
            placeholder={t("portfolioUrlPlaceholder")}
            icon={Globe}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={
              field.state.meta.errors.length > 0
                ? errorMessage(field.state.meta.errors[0])
                : undefined
            }
          />
        )}
      </form.Field>
    </FormSection>
  )
}
