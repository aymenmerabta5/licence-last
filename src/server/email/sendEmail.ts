import "server-only"

import type { env as EnvType } from "@/env"

export interface SendEmailArgs {
  to: string
  subject: string
  text: string
  html?: string
}

interface EmailEnv {
  EMAIL_FROM?: string
  RESEND_API_KEY?: string
}

// Lazy load env to avoid issues during testing
let _env: typeof EnvType | undefined
function getEnv(): typeof EnvType {
  if (!_env) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _env = require("@/env").env as typeof EnvType
  }
  return _env!
}

export async function sendEmail(
  { to, subject, text, html }: SendEmailArgs,
  emailEnv?: EmailEnv
) {
  // Use provided env or lazy-load from @/env
  const from = emailEnv?.EMAIL_FROM ?? getEnv().EMAIL_FROM
  const resendKey = emailEnv?.RESEND_API_KEY ?? getEnv().RESEND_API_KEY

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
