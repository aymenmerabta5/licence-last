import type { ProjectDraft } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/projects/types"

export const EMPTY_PROJECT_DRAFT: ProjectDraft = {
  name: "",
  summary: "",
  projectUrl: "",
  repositoryUrl: "",
  startDate: "",
  endDate: "",
}

export function toInputDate(value: Date | string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}
