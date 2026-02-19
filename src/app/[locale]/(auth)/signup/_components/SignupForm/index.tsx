"use client"

import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { SignupFields } from "@/app/[locale]/(auth)/signup/_components/SignupForm/components/SignupFields"
import { SignupFooter } from "@/app/[locale]/(auth)/signup/_components/SignupForm/components/SignupFooter"
import { SignupSuccess } from "@/app/[locale]/(auth)/signup/_components/SignupForm/components/SignupSuccess"
import { useSignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/hooks/useSignupForm"
import type { SignupFormProps } from "@/app/[locale]/(auth)/signup/_components/SignupForm/types"
import { FormHeader } from "@/components/FormHeader"
import { ServerError } from "@/components/ServerError"
import { SubmitButton } from "@/components/SubmitButton"
import { TurnstileWidget } from "@/components/TurnstileWidget"
import { ease } from "@/lib/animations"

export function SignupForm({ role, onBack }: SignupFormProps) {
  const t = useTranslations("auth.signup")
  const tc = useTranslations("auth.signup.companySignup")
  const { form, serverError, success, setTurnstileToken, turnstileRef } =
    useSignupForm(role)

  const tu = useTranslations("auth.signup.universitySignup")

  const isCompany = role === "company_admin"
  const isUniversity = role === "university_admin"
  const title = isUniversity
    ? tu("title")
    : isCompany
      ? tc("title")
      : t("title")
  const subtitle = isUniversity
    ? tu("subtitle")
    : isCompany
      ? tc("subtitle")
      : t("subtitle")
  const emailPlaceholder = isUniversity
    ? tu("emailPlaceholder")
    : isCompany
      ? tc("emailPlaceholder")
      : t("emailPlaceholder")

  const labels = {
    name: t("name"),
    namePlaceholder: t("namePlaceholder"),
    email: t("email"),
    emailPlaceholder,
    password: t("password"),
    passwordPlaceholder: t("passwordPlaceholder"),
    passwordHint: t("passwordHint"),
    confirmPassword: t("confirmPassword"),
    confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
    agreeToTerms: (
      <>
        {t("agreeToTerms")}{" "}
        <span className="font-medium text-heading underline underline-offset-4 decoration-border hover:decoration-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer">
          {t("terms")}
        </span>{" "}
        {t("and")}{" "}
        <span className="font-medium text-heading underline underline-offset-4 decoration-border hover:decoration-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer">
          {t("privacy")}
        </span>
      </>
    ),
  }

  if (success) {
    return (
      <SignupSuccess
        title={t("verifyTitle")}
        description={
          isUniversity
            ? tu("verifyDescription")
            : isCompany
              ? tc("verifyDescription")
              : t("verifyDescription")
        }
        backToLogin={t("backToLogin")}
      />
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      <FormHeader
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        backLabel={t("back")}
      />

      <ServerError message={serverError} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
      >
        <SignupFields form={form} labels={labels} />
      </motion.div>

      <TurnstileWidget
        ref={turnstileRef}
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
      />

      <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
        {([isSubmitting]) => (
          <SubmitButton isSubmitting={isSubmitting} delay={0.2}>
            {t("submit")}
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        )}
      </form.Subscribe>

      <SignupFooter
        orLabel={t("or")}
        hasAccountLabel={t("hasAccount")}
        signInLabel={t("signIn")}
      />
    </form>
  )
}
