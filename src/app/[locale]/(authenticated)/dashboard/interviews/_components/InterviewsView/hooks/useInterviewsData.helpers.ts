import { getErrorMessage } from "@/lib/error-message"

import type {
  CompanyApplicationOption,
  CompanyOfferOption,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { isInterviewsFeatureDisabledError } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"

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
  return (applications ?? []).map((application) => ({
    id: application.id,
    studentName: application.student.name ?? "Unnamed student",
    pipelineStage: application.pipelineStage,
    createdAt: application.createdAt,
  }))
}

export function getInterviewsErrorMessage(error: unknown): string | null {
  if (!error || isInterviewsFeatureDisabledError(error)) {
    return null
  }

  return getErrorMessage(error, "Could not load interviews.")
}
