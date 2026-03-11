import type {
  CompanyApplicationOption,
  CompanyOfferOption,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { isInterviewsFeatureDisabledError } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import { getErrorMessage } from "@/lib/error-message"

interface CompanyOfferSource {
  id: string
  title: string
}

interface CompanyApplicationSource {
  id: string
  student: {
    name: string | null
  }
  pipelineStage: string
  createdAt: Date | string
}

const INTERVIEW_ELIGIBLE_PIPELINE_STAGES = new Set([
  "applied",
  "screening",
  "interview",
])

export function mapCompanyOffers(
  offers: CompanyOfferSource[] | undefined,
): CompanyOfferOption[] {
  return (offers ?? []).map((offer) => ({
    id: offer.id,
    title: offer.title,
  }))
}

export function mapCompanyApplications(
  applications: CompanyApplicationSource[] | undefined,
): CompanyApplicationOption[] {
  return (applications ?? [])
    .filter((application) =>
      INTERVIEW_ELIGIBLE_PIPELINE_STAGES.has(application.pipelineStage),
    )
    .map((application) => ({
      id: application.id,
      studentName: application.student.name ?? "Unnamed student",
      pipelineStage: application.pipelineStage,
      createdAt: application.createdAt,
    }))
}

export function normalizeLocalDateTimeInput(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

export function getInterviewsErrorMessage(error: unknown): string | null {
  if (!error || isInterviewsFeatureDisabledError(error)) {
    return null
  }

  return getErrorMessage(error, "Could not load interviews.")
}
