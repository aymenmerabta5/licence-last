import { STAGE_COLUMNS } from "@/lib/constants/pipeline"

interface NotificationInput {
  type: string
  payload: unknown
}

interface NotificationPayloadRecord {
  [key: string]: unknown
}

interface NotificationSummaryItem {
  type: string
  readAt: string | Date | null
}

export interface FormattedNotification {
  title: string
  message: string | null
}

export interface NotificationsSummary {
  summaryBullets: string[]
  suggestedNextActions: string[]
}

export type NotificationTranslationFn = (
  key: string,
  values?: Record<string, string | number>,
) => string

const TITLE_BY_TYPE: Record<string, string> = {
  new_application: "New application",
  application_stage_changed: "Application stage updated",
  application_refused: "Application declined",
  placement_pending_validation: "Placement pending validation",
  placement_validated: "Placement validated",
  placement_rejected: "Placement rejected",
  new_message: "New message",
  interview_proposed: "Interview proposed",
  interview_confirmed: "Interview confirmed",
  interview_cancelled: "Interview cancelled",
  interview_completed: "Interview completed",
  agreement_generated: "Agreement generated",
  certificate_generated: "Certificate generated",
  company_approved: "Company approved",
  company_rejected: "Company rejected",
  company_suspended: "Company suspended",
  company_reactivated: "Company reactivated",
  university_approved: "University approved",
}

function asPayloadRecord(value: unknown): NotificationPayloadRecord | null {
  if (typeof value !== "object" || value === null) {
    return null
  }
  return value as NotificationPayloadRecord
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getPayloadText(
  payload: NotificationPayloadRecord | null,
  key: string,
): string | null {
  if (!payload) {
    return null
  }
  return asText(payload[key])
}

function humanizeToken(value: string): string {
  return value.replace(/_/g, " ")
}

function formatNotificationTitle(
  type: string,
  t?: NotificationTranslationFn,
): string {
  if (t && type in TITLE_BY_TYPE) {
    return t(`feed.titles.${type}`)
  }

  return TITLE_BY_TYPE[type] ?? humanizeToken(type)
}

function formatStageLabel(
  value: string,
  t?: NotificationTranslationFn,
): string {
  const normalized = value.trim().toLowerCase()

  if (
    t &&
    STAGE_COLUMNS.includes(normalized as (typeof STAGE_COLUMNS)[number])
  ) {
    return t(`feed.stageLabels.${normalized}`)
  }

  return humanizeToken(normalized)
}

function formatByType(
  type: string,
  payload: NotificationPayloadRecord | null,
  t?: NotificationTranslationFn,
): string | null {
  const offerTitle = getPayloadText(payload, "offerTitle")
  const companyName = getPayloadText(payload, "companyName")
  const universityName = getPayloadText(payload, "universityName")
  const stage = getPayloadText(payload, "stage")
  const reason =
    getPayloadText(payload, "reason") ?? getPayloadText(payload, "companyNote")

  if (!t) {
    switch (type) {
      case "new_application":
        return offerTitle
          ? `A student applied for ${offerTitle}.`
          : "A new student application was received."
      case "application_stage_changed":
        if (offerTitle && stage) {
          return `${offerTitle} moved to ${humanizeToken(stage)}.`
        }
        if (stage) {
          return `Pipeline moved to ${humanizeToken(stage)}.`
        }
        if (offerTitle) {
          return `Application status changed for ${offerTitle}.`
        }
        return "Application status changed."
      case "application_refused":
        if (offerTitle && reason) {
          return `${offerTitle} was declined: ${reason}`
        }
        if (offerTitle) {
          return `${offerTitle} was declined.`
        }
        return reason ?? "An application was declined."
      case "placement_pending_validation":
        if (offerTitle && companyName) {
          return `${offerTitle} at ${companyName} is waiting for validation.`
        }
        return "A placement is waiting for validation."
      case "placement_validated":
        if (offerTitle) {
          return `${offerTitle} placement is now validated.`
        }
        return "A placement was validated."
      case "placement_rejected":
        if (offerTitle && reason) {
          return `${offerTitle} was rejected: ${reason}`
        }
        if (offerTitle) {
          return `${offerTitle} was rejected.`
        }
        return reason ?? "A placement was rejected."
      case "new_message":
        if (offerTitle) {
          return `You received a new message about ${offerTitle}.`
        }
        return "You received a new message."
      case "interview_proposed":
        if (offerTitle) {
          return `You have been invited to an interview for ${offerTitle}.`
        }
        return "You have been invited to an interview."
      case "interview_confirmed":
        if (offerTitle) {
          return `An interview slot was confirmed for ${offerTitle}.`
        }
        return "A student confirmed an interview slot."
      case "interview_cancelled":
        if (offerTitle) {
          return `Your interview for ${offerTitle} has been cancelled.`
        }
        return "An interview has been cancelled."
      case "interview_completed":
        if (offerTitle) {
          return `Your interview for ${offerTitle} has been marked as completed.`
        }
        return "An interview has been marked as completed."
      case "agreement_generated":
        if (offerTitle && companyName) {
          return `${offerTitle} agreement is ready from ${companyName}.`
        }
        if (offerTitle) {
          return `${offerTitle} agreement is ready.`
        }
        return "An internship agreement is ready."
      case "certificate_generated":
        if (offerTitle && companyName) {
          return `${offerTitle} certificate is ready from ${companyName}.`
        }
        if (offerTitle) {
          return `${offerTitle} certificate is ready.`
        }
        return "A certificate is ready."
      case "company_approved":
        return companyName
          ? `${companyName} has been approved.`
          : "Company approved."
      case "company_rejected":
        return companyName
          ? `${companyName} was not approved.`
          : "Company was not approved."
      case "company_suspended":
        return companyName
          ? `${companyName} has been suspended.`
          : "Company suspended."
      case "company_reactivated":
        return companyName
          ? `${companyName} has been reactivated.`
          : "Company reactivated."
      case "university_approved":
        return universityName
          ? `${universityName} has been approved.`
          : "University approved."
      default:
        return offerTitle ?? companyName ?? universityName ?? reason ?? null
    }
  }

  switch (type) {
    case "new_application":
      return offerTitle
        ? t("feed.messages.new_application.withOfferTitle", { offerTitle })
        : t("feed.messages.new_application.default")
    case "application_stage_changed":
      if (offerTitle && stage) {
        return t("feed.messages.application_stage_changed.withOfferAndStage", {
          offerTitle,
          stage: formatStageLabel(stage, t),
        })
      }
      if (stage) {
        return t("feed.messages.application_stage_changed.withStage", {
          stage: formatStageLabel(stage, t),
        })
      }
      if (offerTitle) {
        return t("feed.messages.application_stage_changed.withOfferTitle", {
          offerTitle,
        })
      }
      return t("feed.messages.application_stage_changed.default")
    case "application_refused":
      if (offerTitle && reason) {
        return t("feed.messages.application_refused.withOfferAndReason", {
          offerTitle,
          reason,
        })
      }
      if (offerTitle) {
        return t("feed.messages.application_refused.withOfferTitle", {
          offerTitle,
        })
      }
      if (reason) {
        return t("feed.messages.application_refused.withReason", { reason })
      }
      return t("feed.messages.application_refused.default")
    case "placement_pending_validation":
      if (offerTitle && companyName) {
        return t(
          "feed.messages.placement_pending_validation.withOfferAndCompany",
          {
            offerTitle,
            companyName,
          },
        )
      }
      return t("feed.messages.placement_pending_validation.default")
    case "placement_validated":
      return offerTitle
        ? t("feed.messages.placement_validated.withOfferTitle", { offerTitle })
        : t("feed.messages.placement_validated.default")
    case "placement_rejected":
      if (offerTitle && reason) {
        return t("feed.messages.placement_rejected.withOfferAndReason", {
          offerTitle,
          reason,
        })
      }
      if (offerTitle) {
        return t("feed.messages.placement_rejected.withOfferTitle", {
          offerTitle,
        })
      }
      if (reason) {
        return t("feed.messages.placement_rejected.withReason", { reason })
      }
      return t("feed.messages.placement_rejected.default")
    case "new_message":
      return offerTitle
        ? t("feed.messages.new_message.withOfferTitle", { offerTitle })
        : t("feed.messages.new_message.default")
    case "interview_proposed":
      return offerTitle
        ? t("feed.messages.interview_proposed.withOfferTitle", { offerTitle })
        : t("feed.messages.interview_proposed.default")
    case "interview_confirmed":
      return offerTitle
        ? t("feed.messages.interview_confirmed.withOfferTitle", { offerTitle })
        : t("feed.messages.interview_confirmed.default")
    case "interview_cancelled":
      return offerTitle
        ? t("feed.messages.interview_cancelled.withOfferTitle", { offerTitle })
        : t("feed.messages.interview_cancelled.default")
    case "interview_completed":
      return offerTitle
        ? t("feed.messages.interview_completed.withOfferTitle", { offerTitle })
        : t("feed.messages.interview_completed.default")
    case "agreement_generated":
      if (offerTitle && companyName) {
        return t("feed.messages.agreement_generated.withOfferAndCompany", {
          offerTitle,
          companyName,
        })
      }
      if (offerTitle) {
        return t("feed.messages.agreement_generated.withOfferTitle", {
          offerTitle,
        })
      }
      return t("feed.messages.agreement_generated.default")
    case "certificate_generated":
      if (offerTitle && companyName) {
        return t("feed.messages.certificate_generated.withOfferAndCompany", {
          offerTitle,
          companyName,
        })
      }
      if (offerTitle) {
        return t("feed.messages.certificate_generated.withOfferTitle", {
          offerTitle,
        })
      }
      return t("feed.messages.certificate_generated.default")
    case "company_approved":
      return companyName
        ? t("feed.messages.company_approved.withCompanyName", { companyName })
        : t("feed.messages.company_approved.default")
    case "company_rejected":
      return companyName
        ? t("feed.messages.company_rejected.withCompanyName", { companyName })
        : t("feed.messages.company_rejected.default")
    case "company_suspended":
      return companyName
        ? t("feed.messages.company_suspended.withCompanyName", { companyName })
        : t("feed.messages.company_suspended.default")
    case "company_reactivated":
      return companyName
        ? t("feed.messages.company_reactivated.withCompanyName", {
            companyName,
          })
        : t("feed.messages.company_reactivated.default")
    case "university_approved":
      return universityName
        ? t("feed.messages.university_approved.withUniversityName", {
            universityName,
          })
        : t("feed.messages.university_approved.default")
    default:
      return offerTitle ?? companyName ?? universityName ?? reason ?? null
  }
}

export function formatNotification(
  input: NotificationInput,
  t?: NotificationTranslationFn,
): FormattedNotification {
  const payload = asPayloadRecord(input.payload)

  return {
    title: formatNotificationTitle(input.type, t),
    message: formatByType(input.type, payload, t),
  }
}

export function buildNotificationsFallbackSummary(
  notifications: NotificationSummaryItem[],
  t?: NotificationTranslationFn,
): NotificationsSummary {
  const total = notifications.length
  const unread = notifications.filter((item) => item.readAt === null).length

  const typeCounts = notifications.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1
      return acc
    },
    {},
  )

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) =>
      t
        ? t("fallbackSummary.typeCount", {
            type: formatNotificationTitle(type, t),
            count,
          })
        : `${humanizeToken(type)}: ${count}`,
    )

  if (!t) {
    return {
      summaryBullets: [
        `${unread} unread out of ${total} notifications.`,
        ...topTypes,
      ],
      suggestedNextActions:
        unread > 0
          ? [
              "Review unread notifications and mark handled items as read.",
              "Prioritize messages and interview updates first.",
            ]
          : ["You are up to date. Keep monitoring new activity."],
    }
  }

  return {
    summaryBullets: [
      t("fallbackSummary.unreadStatus", { unread, total }),
      ...topTypes,
    ],
    suggestedNextActions:
      unread > 0
        ? [
            t("fallbackSummary.actions.reviewUnread"),
            t("fallbackSummary.actions.prioritizeMessages"),
          ]
        : [t("fallbackSummary.actions.upToDate")],
  }
}
