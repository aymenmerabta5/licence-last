"use client"

import { useTranslations } from "next-intl"
import { StudentLanguagesSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentLanguagesSection"
import { StudentLinksSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentLinksSection"
import { StudentLocationSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentLocationSection"
import { StudentPersonalSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentPersonalSection"
import { StudentSkillsSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentSkillsSection"
import { StudentSubmitSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentSubmitSection"
import { useOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/hooks/useOnboardingForm"
import { FormHeader } from "@/components/FormHeader"
import { ServerError } from "@/components/ServerError"
import { isLanguageRequirementsEnabledOnClient } from "@/lib/feature-flags-client"

export function StudentOnboardingFormContent() {
  const t = useTranslations("onboarding.student")
  const isLanguageRequirementsEnabled = isLanguageRequirementsEnabledOnClient()
  const skillsSectionIndex = isLanguageRequirementsEnabled ? "05" : "04"
  const {
    form,
    serverError,
    departments,
    selectedDepartmentId,
    handleDepartmentChange,
  } = useOnboardingForm()

  return (
    <form
      className="space-y-12 lg:space-y-16"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <ServerError message={serverError} />

      <StudentPersonalSection
        form={form}
        departments={departments}
        onDepartmentChange={handleDepartmentChange}
      />
      <StudentLocationSection form={form} />
      <StudentLinksSection form={form} />

      {isLanguageRequirementsEnabled ? (
        <StudentLanguagesSection form={form} />
      ) : null}

      <StudentSkillsSection
        form={form}
        skillsSectionIndex={skillsSectionIndex}
        selectedDepartmentId={selectedDepartmentId}
      />

      <StudentSubmitSection form={form} />
    </form>
  )
}
