import { MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

import { FormSection, SelectField, TextField } from "@/components/form-fields"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"
import type { OnboardingFormApi } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"

interface StudentLocationSectionProps {
  form: OnboardingFormApi
}

export function StudentLocationSection({ form }: StudentLocationSectionProps) {
  const t = useTranslations("onboarding.student")

  return (
    <FormSection title={`02 - ${t("locationSection")}`} delay={0.05}>
      <form.Field name="wilayaCode">
        {(field) => (
          <SelectField
            id="student-wilaya"
            label={t("wilaya")}
            placeholder={t("wilayaPlaceholder")}
            icon={MapPin}
            options={WILAYAS.map((name, index) => ({
              value: index + 1,
              label: `${String(index + 1).padStart(2, "0")} - ${name}`,
            }))}
            value={field.state.value}
            onChange={(value) => field.handleChange(Number(value))}
            onBlur={field.handleBlur}
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
            id="student-address"
            label={t("address")}
            placeholder={t("addressPlaceholder")}
            icon={MapPin}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
    </FormSection>
  )
}
