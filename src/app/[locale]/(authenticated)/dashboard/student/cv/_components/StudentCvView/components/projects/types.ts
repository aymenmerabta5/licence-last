import type { StudentCvProject } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"

export interface ProjectDraft {
  name: string
  summary: string
  projectUrl: string
  repositoryUrl: string
  startDate: string
  endDate: string
}

export interface CreateProjectInput {
  name: string
  summary: string
  projectUrl?: string
  repositoryUrl?: string
  startDate?: string
  endDate?: string
}

export interface UpdateProjectInput {
  projectId: string
  name?: string
  summary?: string
  projectUrl?: string | null
  repositoryUrl?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface ProjectsSectionProps {
  projects: StudentCvProject[]
  creating: boolean
  updating: boolean
  deleting: boolean
  onCreate: (input: CreateProjectInput) => Promise<void>
  onUpdate: (input: UpdateProjectInput) => Promise<void>
  onDelete: (projectId: string) => Promise<void>
}
