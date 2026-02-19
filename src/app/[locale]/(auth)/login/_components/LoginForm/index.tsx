"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { FormFooter } from "@/app/[locale]/(auth)/login/_components/LoginForm/components/FormFooter"
import { LoginFields } from "@/app/[locale]/(auth)/login/_components/LoginForm/components/LoginFields"
import { TwoFactorStep } from "@/app/[locale]/(auth)/login/_components/LoginForm/components/TwoFactorStep"
import { VerificationAlert } from "@/app/[locale]/(auth)/login/_components/LoginForm/components/VerificationAlert"
import { useLoginForm } from "@/app/[locale]/(auth)/login/_components/LoginForm/hooks/useLoginForm"
import { ServerError } from "@/components/ServerError"
import { TurnstileWidget } from "@/components/TurnstileWidget"
import { ease, reveal } from "@/lib/animations"

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
    // Turnstile
    setTurnstileToken,
    turnstileRef,
    // 2FA
    twoFactorRequired,
    twoFactorMethod,
    setTwoFactorMethod,
    twoFactorCode,
    setTwoFactorCode,
    trustDevice,
    setTrustDevice,
    isVerifying2FA,
    verify2FA,
    sendOtpCode,
    backToLogin,
  } = useLoginForm()

  if (twoFactorRequired) {
    return (
      <TwoFactorStep
        method={twoFactorMethod}
        onMethodChange={setTwoFactorMethod}
        code={twoFactorCode}
        onCodeChange={setTwoFactorCode}
        trustDevice={trustDevice}
        onTrustDeviceChange={setTrustDevice}
        isVerifying={isVerifying2FA}
        onVerify={verify2FA}
        onSendOtp={sendOtpCode}
        onBack={backToLogin}
        serverError={serverError}
      />
    )
  }

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

      <TurnstileWidget
        ref={turnstileRef}
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
      />

      <FormFooter
        form={form}
        rememberMe={rememberMe}
        onRememberChange={setRememberMe}
      />
    </form>
  )
}
