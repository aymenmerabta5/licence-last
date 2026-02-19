import "server-only"

import { env } from "@/env"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"
import { sendEmail } from "@/server/email/sendEmail"
import { createModuleLogger } from "@/server/logging"
import { getNotificationPreferences } from "@/server/services/notifications/get-preferences"
import CertificateGeneratedEmail from "@/server/email/templates/CertificateGeneratedEmail"

interface SendCertificateEmailInput {
  userId: string
  to: string
  studentName: string
  companyName: string
  offerTitle: string
  internshipType: string
  startDate: Date
  endDate: Date
  verificationCode: string
  locale?: string
}

const log = createModuleLogger("services/documents/send-certificate-email")

function toLocaleTag(locale?: string): string {
  if (locale === "fr") return "fr-FR"
  if (locale === "ar") return "ar-DZ"
  return "en-US"
}

function formatDate(date: Date, locale?: string): string {
  const formatter = new Intl.DateTimeFormat(toLocaleTag(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return formatter.format(date)
}

export async function sendCertificateEmail(input: SendCertificateEmailInput) {
  const preferences = await getNotificationPreferences(input.userId)
  if (!preferences.emailEnabled) {
    log.info(
      {
        userId: input.userId,
        event: "certificate_email_skipped_email_disabled",
      },
      "Skipping certificate email because user disabled email notifications",
    )

    return {
      success: true,
      code: "EMAIL_SKIPPED",
      message: "Email skipped due to user preferences.",
    }
  }

  const documentsUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${input.locale ?? "en"}/dashboard/student/documents`
  const internshipTypeLabel =
    INTERNSHIP_TYPE_LABELS[input.internshipType] ?? input.internshipType

  return sendEmail(
    input.to,
    "Your internship certificate is ready - Internex",
    CertificateGeneratedEmail,
    {
      studentName: input.studentName,
      companyName: input.companyName,
      offerTitle: input.offerTitle,
      internshipType: internshipTypeLabel,
      startDate: formatDate(input.startDate, input.locale),
      endDate: formatDate(input.endDate, input.locale),
      verificationCode: input.verificationCode,
      documentsUrl,
    },
  )
}
