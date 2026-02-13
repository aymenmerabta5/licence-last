"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ServerError } from "@/components/ServerError"
import { reveal, ease } from "@/lib/animations"

import { useLoginForm } from "./hooks/useLoginForm"
import { VerificationAlert } from "./components/VerificationAlert"
import { LoginFields } from "./components/LoginFields"
import { FormFooter } from "./components/FormFooter"

export function LoginForm() {
  const t = useTranslations("auth.login")
  const {
    form,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    serverError,
    needsVerification,
    resendVerificationEmail,
  } = useLoginForm()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      <ServerError message={serverError} />

      {needsVerification && (
        <VerificationAlert onResend={resendVerificationEmail} />
      )}

      {/* Fields */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <LoginFields
          form={form}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
      </motion.div>

      <FormFooter
        form={form}
        rememberMe={rememberMe}
        onRememberChange={setRememberMe}
      />
    </form>
  )
}
