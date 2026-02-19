import "server-only"

import type { ComponentType } from "react"

import { sendEmail } from "@/server/email/sendEmail"
import { createModuleLogger } from "@/server/logging"
import { createNotification } from "@/server/services/notifications/create"
import { getNotificationPreferences } from "@/server/services/notifications/get-preferences"

const log = createModuleLogger("services/notifications/emit")

interface EmitNotificationEmailOptions {
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

export interface EmitNotificationEmailInput<TProps> {
  to: string | string[]
  subject: string
  component: ComponentType<TProps>
  props: TProps
  options?: EmitNotificationEmailOptions
}

export interface EmitNotificationInput<TProps> {
  userId: string
  type: string
  payload?: Record<string, unknown>
  email?: EmitNotificationEmailInput<TProps>
}

export interface EmitNotificationResult {
  notificationId: string | null
  inAppSkipped: boolean
  emailAttempted: boolean
  emailSkipped: boolean
  emailSuccess: boolean | null
}

export async function emitNotification<TProps>(
  input: EmitNotificationInput<TProps>,
): Promise<EmitNotificationResult> {
  const preferences = await getNotificationPreferences(input.userId)

  const notificationResult = await createNotification({
    userId: input.userId,
    type: input.type,
    payload: input.payload,
    preferences,
  })

  if (!input.email) {
    return {
      notificationId: notificationResult.id,
      inAppSkipped: notificationResult.skipped,
      emailAttempted: false,
      emailSkipped: false,
      emailSuccess: null,
    }
  }

  if (!preferences.emailEnabled) {
    log.info(
      {
        userId: input.userId,
        type: input.type,
        event: "notification_email_skipped_email_disabled",
      },
      "Skipping notification email because user disabled email notifications",
    )

    return {
      notificationId: notificationResult.id,
      inAppSkipped: notificationResult.skipped,
      emailAttempted: false,
      emailSkipped: true,
      emailSuccess: null,
    }
  }

  const emailResult = await sendEmail(
    input.email.to,
    input.email.subject,
    input.email.component,
    input.email.props,
    input.email.options,
  )

  return {
    notificationId: notificationResult.id,
    inAppSkipped: notificationResult.skipped,
    emailAttempted: true,
    emailSkipped: false,
    emailSuccess: emailResult.success,
  }
}
