import type {
  InterviewSlotView,
  InterviewStatus,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatDateTime } from "@/lib/date"
import { getErrorDetails } from "@/lib/error-message"

const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  pending_confirmation: "Pending confirmation",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
}

export function getInterviewStatusLabel(status: InterviewStatus): string {
  return INTERVIEW_STATUS_LABELS[status]
}

export function isInterviewsFeatureDisabledError(error: unknown): boolean {
  const details = getErrorDetails(error)
  if (details.code === "INTERVIEWS_FEATURE_DISABLED") {
    return true
  }

  const message = (details.message ?? "").toLowerCase()
  return (
    message.includes("interviews feature is disabled") ||
    (message.includes("interviews") && message.includes("disabled"))
  )
}

export function formatInterviewSlot(slot: InterviewSlotView): string {
  return `${formatDateTime(slot.startsAt)} to ${formatDateTime(slot.endsAt)}`
}

export function formatPipelineStage(value: string): string {
  if (!value) return "Unknown stage"
  const sentence = value.replaceAll("_", " ")
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}
