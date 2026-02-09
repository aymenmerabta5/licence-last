"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import {
  Mail,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { createResetPasswordSchema, errorMessage } from "@/lib/schemas/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

/* ── Shared reveal transition ── */
const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword")
  const tv = useTranslations("auth.validation")

  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  const resetSchema = useMemo(() => createResetPasswordSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: resetSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: "/reset-password/verify",
        })

        /* Always show success regardless of whether the email exists (security best practice) */
        setSuccess(true)
      } catch {
        setSuccess(true)
      }
    },
  })

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* ── Success State ── */}
      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="space-y-8"
        >
          {/* Success message */}
          <div className="flex items-start gap-3 p-4 text-sm bg-primary/5 border border-primary/15">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="font-medium text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                {t("success")}
              </p>
            </div>
          </div>

          {/* Back to login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide group [[dir=rtl]_&]:tracking-normal"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("backToLogin")}
          </Link>
        </motion.div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-8"
        >
          {/* ── Description ── */}
          <motion.p
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="text-sm text-muted-foreground leading-relaxed font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            {t("description")}
          </motion.p>

          {/* ── Server Error Alert ── */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2.5 p-3.5 text-sm text-destructive bg-destructive/5 border border-destructive/15"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </motion.div>
          )}

          {/* ── Email Field ── */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor="reset-email"
                    className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
                  >
                    {t("email")}
                  </Label>
                  <InputGroup className="rounded-none h-11">
                    <InputGroupAddon align="inline-start">
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="reset-email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={t("emailPlaceholder")}
                      autoComplete="email"
                    />
                  </InputGroup>
                  {field.state.meta.errors.length > 0 && (
                    <p
                      className="text-destructive text-[11px] tracking-wide"
                      role="alert"
                    >
                      {errorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </motion.div>

          {/* ── Submit Button ── */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.15 }}
          >
            <form.Subscribe
              selector={(state) => [state.isSubmitting] as const}
            >
              {([isSubmitting]) => (
                <Button
                  type="submit"
                  variant="editorial"
                  size="editorial"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {t("submit")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </motion.div>

          {/* ── Back to Login ── */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide group [[dir=rtl]_&]:tracking-normal"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("backToLogin")}
            </Link>
          </motion.div>
        </form>
      )}
    </div>
  )
}
