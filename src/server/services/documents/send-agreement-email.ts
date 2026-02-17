import "server-only"

import { env } from "@/env"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"
import { sendEmail } from "@/server/email/sendEmail"
import AgreementGeneratedEmail from "@/server/email/templates/AgreementGeneratedEmail"

interface SendAgreementEmailInput {
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

export async function sendAgreementEmail(input: SendAgreementEmailInput) {
  const documentsUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${input.locale ?? "en"}/dashboard/student/documents`
  const internshipTypeLabel =
    INTERNSHIP_TYPE_LABELS[input.internshipType] ?? input.internshipType

  return sendEmail(
    input.to,
    "Your internship agreement is ready - Internex",
    AgreementGeneratedEmail,
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
