"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { reveal, ease } from "@/lib/animations"

import { useResetPassword } from "./hooks/useResetPassword"
import { SuccessMessage } from "./components/SuccessMessage"
import { EmailForm } from "./components/EmailForm"

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword")
  const { form, serverError, success, setTurnstileToken, turnstileRef } = useResetPassword()

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Conditional render: success or form */}
      {success ? (
        <SuccessMessage />
      ) : (
        <EmailForm
          form={form}
          serverError={serverError}
          setTurnstileToken={setTurnstileToken}
          turnstileRef={turnstileRef}
        />
      )}
    </div>
  )
}
