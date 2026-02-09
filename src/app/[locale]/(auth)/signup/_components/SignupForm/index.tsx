"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"

import { ServerError } from "@/components/ServerError"
import { FormHeader } from "@/components/FormHeader"
import { SubmitButton } from "@/components/SubmitButton"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"

import type { SignupFormProps } from "./types"
import { useSignupForm } from "./hooks/useSignupForm"
import { SignupFields } from "./components/SignupFields"
import { SignupSuccess } from "./components/SignupSuccess"

const ease = [0.4, 0, 0.2, 1] as const

export function SignupForm({ role, onBack }: SignupFormProps) {
  const t = useTranslations("auth.signup")
  const tc = useTranslations("auth.signup.companySignup")
  const { form, serverError, success } = useSignupForm(role)

  const isCompany = role === "company_admin"
  const title = isCompany ? tc("title") : t("title")
  const subtitle = isCompany ? tc("subtitle") : t("subtitle")
  const emailPlaceholder = isCompany ? tc("emailPlaceholder") : t("emailPlaceholder")

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
        description={isCompany ? tc("verifyDescription") : t("verifyDescription")}
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

      <form.Subscribe
        selector={(state) => [state.isSubmitting] as const}
      >
        {([isSubmitting]) => (
          <SubmitButton isSubmitting={isSubmitting} delay={0.2}>
            {t("submit")}
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        )}
      </form.Subscribe>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="relative"
      >
        <Separator />
        <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">
          {t("or")}
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide text-xs [[dir=rtl]_&]:tracking-normal"
        >
          {t("signIn")}
        </Link>
      </motion.p>
    </form>
  )
}
