import type { StudentCvExperience } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"

export interface ExperienceDraft {
  title: string
  organization: string
  description: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface CreateExperienceInput {
  title: string
  organization: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
}

export interface UpdateExperienceInput {
  experienceId: string
  title?: string
  organization?: string
  description?: string
  startDate?: string
  endDate?: string | null
  isCurrent?: boolean
}

export interface ExperienceSectionProps {
  experiences: StudentCvExperience[]
  creating: boolean
  updating: boolean
  deleting: boolean
  onCreate: (input: CreateExperienceInput) => Promise<void>
  onUpdate: (input: UpdateExperienceInput) => Promise<void>
  onDelete: (experienceId: string) => Promise<void>
}
