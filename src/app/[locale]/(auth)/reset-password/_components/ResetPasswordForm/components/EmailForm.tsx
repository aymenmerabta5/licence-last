"use client"

import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"
import type { ResetPasswordFormApi } from "@/app/[locale]/(auth)/reset-password/_components/ResetPasswordForm/hooks/useResetPassword"
import {
  type CaptchaHandle,
  TurnstileWidget,
} from "@/components/TurnstileWidget"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { errorMessage } from "@/lib/schemas/auth"

interface EmailFormProps {
  form: ResetPasswordFormApi
  serverError: string
  setTurnstileToken: (token: string) => void
  turnstileRef: RefObject<CaptchaHandle | null>
}

export function EmailForm({
  form,
  serverError,
  setTurnstileToken,
  turnstileRef,
}: EmailFormProps) {
  const t = useTranslations("auth.resetPassword")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
      {/* Description */}
      <motion.p
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.05 }}
        className="text-sm text-muted-foreground leading-relaxed font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        {t("description")}
      </motion.p>

      {/* Server Error Alert */}
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

      {/* Email Field */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }}>
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

      <TurnstileWidget
        ref={turnstileRef}
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
      />

      {/* Submit Button */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.15 }}>
        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
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

      {/* Back to Login */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.2 }}>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide group [[dir=rtl]_&]:tracking-normal"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("backToLogin")}
        </Link>
      </motion.div>
    </form>
  )
}
