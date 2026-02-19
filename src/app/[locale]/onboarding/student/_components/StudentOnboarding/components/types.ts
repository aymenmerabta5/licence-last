import type { useOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/hooks/useOnboardingForm"

export type OnboardingFormApi = ReturnType<typeof useOnboardingForm>["form"]

export interface StudentDepartmentOption {
  id: string
  name: string
}

export interface StudentSkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

export interface SkillGroupingResult {
  groups: Record<string, StudentSkillTag[]>
  categoryOrder: readonly string[]
  categoryLabels: Record<string, string>
}
