import type { LanguageCode } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"

export interface StudentOnboardingLanguageValue {
  languageCode: LanguageCode
  proficiency: ProficiencyLevel
}

export interface StudentOnboardingFormValues {
  bio: string
  phone: string
  githubUrl: string
  portfolioUrl: string
  studentNumber: string
  departmentId: string
  level: string
  wilayaCode: number
  address: string
  skillTagIds: string[]
  languages: StudentOnboardingLanguageValue[]
}
