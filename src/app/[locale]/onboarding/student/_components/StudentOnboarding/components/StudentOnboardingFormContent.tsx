"use client"

import { useTranslations } from "next-intl"

import { FormHeader } from "@/components/FormHeader"
import { ServerError } from "@/components/ServerError"
import { useSkillGrouping } from "@/hooks"
import { isLanguageRequirementsEnabledOnClient } from "@/lib/feature-flags-client"
import { StudentLanguagesSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentLanguagesSection"
import { StudentLinksSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentLinksSection"
import { StudentLocationSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentLocationSection"
import { StudentPersonalSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentPersonalSection"
import { StudentSkillsSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentSkillsSection"
import { StudentSubmitSection } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentSubmitSection"
import { useOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/hooks/useOnboardingForm"

export function StudentOnboardingFormContent() {
  const t = useTranslations("onboarding.student")
  const isLanguageRequirementsEnabled = isLanguageRequirementsEnabledOnClient()
  const skillsSectionIndex = isLanguageRequirementsEnabled ? "05" : "04"
  const {
    form,
    serverError,
    departmentSkills,
    otherSkills,
    departments,
    selectedDepartmentId,
    handleDepartmentChange,
  } = useOnboardingForm()
  const departmentGrouping = useSkillGrouping(departmentSkills)
  const otherGrouping = useSkillGrouping(otherSkills)

  return (
    <form
      className="space-y-8"
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

      {isLanguageRequirementsEnabled ? <StudentLanguagesSection form={form} /> : null}

      <StudentSkillsSection
        form={form}
        skillsSectionIndex={skillsSectionIndex}
        selectedDepartmentId={selectedDepartmentId}
        departmentSkills={departmentSkills}
        otherSkills={otherSkills}
        departmentGrouping={departmentGrouping}
        otherGrouping={otherGrouping}
      />

      <StudentSubmitSection form={form} />
    </form>
  )
}
