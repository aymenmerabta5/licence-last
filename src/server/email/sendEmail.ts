/*
 *   Copyright (c) 2025 Aimen Merabta
 *   All rights reserved.
 *   Strict Notice: Unauthorized copying, use, or distribution of this code is strictly prohibited. Violators may be prosecuted and reported to law enforcement.
 */
import "server-only"

import { render } from "@react-email/render"
import React from "react"
import { Resend } from "resend"
import { env } from "@/env"
import { logger } from "@/server/logging"

export const sendEmail = async <T>(
  to: string | string[],
  subject: string,
  EmailComponent: React.ComponentType<T>,
  componentProps: T,
  options?: {
    from?: string
    replyTo?: string
    cc?: string | string[]
    bcc?: string | string[]
  },
) => {
  try {
    if (!env.RESEND_API_KEY) {
      logger.warn(
        { event: "email_config_missing", provider: "resend" },
        "RESEND_API_KEY not configured — skipping email delivery",
      )
      return { success: false, error: "Email not configured" }
    }
    const resend = new Resend(env.RESEND_API_KEY)

    const emailJSX = React.createElement(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      EmailComponent as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      componentProps as any,
    )

    const html = await render(emailJSX)

    const from = options?.from ?? env.EMAIL_FROM
    if (!from) {
      throw new Error("EMAIL_FROM environment variable is not configured")
    }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: options?.replyTo,
      cc: options?.cc,
      bcc: options?.bcc,
    })

    if (error) {
      logger.error(
        {
          err: error,
          event: "email_send_failed",
          provider: "resend",
          to,
          subject,
        },
        "Resend API error",
      )
      throw new Error(`Email sending failed: ${error.message}`)
    }

    if (!data) {
      throw new Error("Email sending failed: No response data")
    }

    logger.info(
      {
        event: "email_sent",
        provider: "resend",
        to,
        subject,
        messageId: data?.id,
      },
      "Email sent successfully",
    )
    return {
      success: true,
      code: "EMAIL_SENT",
      message: "Email sent successfully.",
    }
  } catch (error) {
    logger.error(
      {
        err: error,
        event: "email_send_error",
        provider: "resend",
        to,
        subject,
      },
      "Error sending email",
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
