"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { createSignupSchema, errorMessage } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

/* ── Shared reveal transition ── */
const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

export function SignupForm() {
  const t = useTranslations("auth.signup")
  const tv = useTranslations("auth.validation")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState("")

  const signupSchema = useMemo(() => createSignupSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validators: {
      onSubmit: ({ value }) => {
        /* ── Run Zod schema validation first ── */
        const result = signupSchema.safeParse(value)
        const fieldErrors: Record<string, string> = {}

        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path[0]
            if (path !== undefined && !fieldErrors[String(path)]) {
              fieldErrors[String(path)] = issue.message
            }
          }
        }

        /* ── Cross-field checks (only when individual fields passed) ── */
        if (!fieldErrors.password && !fieldErrors.confirmPassword) {
          if (value.password !== value.confirmPassword) {
            fieldErrors.confirmPassword = tv("passwordMismatch")
          }
        }

        if (!fieldErrors.agreeToTerms && !value.agreeToTerms) {
          fieldErrors.agreeToTerms = tv("termsRequired")
        }

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/",
        })

        if (result.error) {
          setServerError(t("error"))
        }
      } catch {
        setServerError(t("error"))
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      {/* ── Header ── */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

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

      {/* ── Form Fields ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        {/* Full Name */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="signup-name"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("name")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <User className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
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

        {/* Email */}
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="signup-email"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("email")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Mail className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-email"
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

        {/* Password */}
        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="signup-password"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("password")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Lock className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="new-password"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {field.state.meta.errors.length > 0 ? (
                <p
                  className="text-destructive text-[11px] tracking-wide"
                  role="alert"
                >
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground/60 tracking-wide">
                  {t("passwordHint")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Confirm Password */}
        <form.Field name="confirmPassword">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="signup-confirm-password"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("confirmPassword")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Lock className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("confirmPasswordPlaceholder")}
                  autoComplete="new-password"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
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

      {/* ── Terms Agreement ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
      >
        <form.Field name="agreeToTerms">
          {(field) => (
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    onBlur={field.handleBlur}
                    className="peer h-4 w-4 appearance-none border border-border bg-transparent checked:bg-primary checked:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors cursor-pointer"
                  />
                  <svg
                    className="absolute h-3 w-3 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground leading-snug">
                  {t("agreeToTerms")}{" "}
                  <span className="font-medium text-heading underline underline-offset-4 decoration-border hover:decoration-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer">
                    {t("terms")}
                  </span>{" "}
                  {t("and")}{" "}
                  <span className="font-medium text-heading underline underline-offset-4 decoration-border hover:decoration-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer">
                    {t("privacy")}
                  </span>
                </span>
              </label>
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
        transition={{ duration: 0.6, ease, delay: 0.2 }}
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

      {/* ── Separator ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="relative"
      >
        <Separator />
        <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">
          {t("or")}
        </span>
      </motion.div>

      {/* ── Sign In Link ── */}
      <motion.p
        {...reveal}
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
