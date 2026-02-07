import "server-only"

import { env } from "@/env"

interface SendEmailArgs {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailArgs) {
  const from = env.EMAIL_FROM
  const resendKey = env.RESEND_API_KEY

  // If a provider isn't configured, fall back to console output.
  if (!resendKey || !from) {
    // Keep logs clear for local development.
    console.info("[email:dev]", { to, subject })
    console.info(text)
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `Failed to send email (status ${response.status}): ${body || response.statusText}`,
    )
  }
}
