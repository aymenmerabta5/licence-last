import type { ExperienceDraft } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/experience/types"

export const EMPTY_EXPERIENCE_DRAFT: ExperienceDraft = {
  title: "",
  organization: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
}

export function toInputDate(value: Date | string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}
