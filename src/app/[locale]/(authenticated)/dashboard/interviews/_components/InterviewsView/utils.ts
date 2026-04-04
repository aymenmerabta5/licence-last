import type {
  InterviewSlotView,
  InterviewStatus,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatDateTime } from "@/lib/date"
import { getErrorDetails } from "@/lib/error-message"

type TranslationFn = (key: string) => string

export function getInterviewStatusLabel(
  status: InterviewStatus,
  t?: TranslationFn,
): string {
  if (t) {
    return t(`status.${status}`)
  }

  return status.replaceAll("_", " ")
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

export function formatPipelineStage(value: string, t?: TranslationFn): string {
  if (!value) {
    return t ? t("unknownStage") : "Unknown stage"
  }

  if (t) {
    return t(`stageLabels.${value}`)
  }

  return value.replaceAll("_", " ")
}
