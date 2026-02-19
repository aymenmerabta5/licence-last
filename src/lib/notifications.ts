interface NotificationInput {
  type: string
  payload: unknown
}

interface NotificationPayloadRecord {
  [key: string]: unknown
}

export interface FormattedNotification {
  title: string
  message: string | null
}

const TITLE_BY_TYPE: Record<string, string> = {
  new_application: "New application",
  application_stage_changed: "Application stage updated",
  application_refused: "Application declined",
  placement_pending_validation: "Placement pending validation",
  placement_validated: "Placement validated",
  placement_rejected: "Placement rejected",
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

function formatByType(
  type: string,
  payload: NotificationPayloadRecord | null,
): string | null {
  const offerTitle = getPayloadText(payload, "offerTitle")
  const companyName = getPayloadText(payload, "companyName")
  const universityName = getPayloadText(payload, "universityName")
  const stage = getPayloadText(payload, "stage")
  const reason =
    getPayloadText(payload, "reason") ?? getPayloadText(payload, "companyNote")

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
      return companyName ? `${companyName} has been approved.` : "Company approved."
    case "company_rejected":
      return companyName
        ? `${companyName} was not approved.`
        : "Company was not approved."
    case "company_suspended":
      return companyName ? `${companyName} has been suspended.` : "Company suspended."
    case "company_reactivated":
      return companyName
        ? `${companyName} has been reactivated.`
        : "Company reactivated."
    case "university_approved":
      return universityName
        ? `${universityName} has been approved.`
        : "University approved."
    default:
      return (
        offerTitle ??
        companyName ??
        universityName ??
        reason ??
        null
      )
  }
}

export function formatNotification(input: NotificationInput): FormattedNotification {
  const payload = asPayloadRecord(input.payload)
  const title = TITLE_BY_TYPE[input.type] ?? humanizeToken(input.type)

  return {
    title,
    message: formatByType(input.type, payload),
  }
}
