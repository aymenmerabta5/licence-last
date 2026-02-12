"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react"

import { Link, useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { createLoginSchema, errorMessage } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { reveal, ease } from "@/lib/animations"
import { getPostLoginRedirectPath } from "@/lib/post-login-redirect"
import { orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ServerError } from "@/components/ServerError"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function LoginForm() {
  const t = useTranslations("auth.login")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [serverError, setServerError] = useState("")
  const [needsVerification, setNeedsVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  const loginSchema = useMemo(() => createLoginSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(loginSchema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setNeedsVerification(false)
      setPendingEmail(value.email)

      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe,
        })

        if (result.error) {
          if (result.error.status === 403) {
            setNeedsVerification(true)
            setServerError(t("emailNotVerified"))
            return
          }
          setServerError(result.error.message || t("error"))
          return
        }

        const me = await orpcClient.users.getMe()
        const redirectPath = getPostLoginRedirectPath(me)
        router.push(redirectPath)
      } catch (err) {
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  async function resendVerificationEmail() {
    if (!pendingEmail) return
    setServerError("")

    try {
      const result = await authClient.sendVerificationEmail({
        email: pendingEmail,
        callbackURL: "/",
      })

      if (result.error) {
        toast.error(result.error.message || t("error"))
        return
      }

      toast.success(t("verificationSent"))
    } catch (err) {
      toast.error(getErrorMessage(err, t("error")))
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-none"
            onClick={resendVerificationEmail}
          >
            {t("resendVerification")}
          </Button>
        </motion.div>
      )}

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="login-email"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("email")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Mail className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="login-email"
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

        <form.Field name="password">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="login-password"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("password")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Lock className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
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

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="flex items-center justify-between"
      >
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
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
          <span className="text-sm text-muted-foreground">
            {t("rememberMe")}
          </span>
        </label>

        <Link
          href="/reset-password"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t("forgotPassword")}
        </Link>
      </motion.div>

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

      <motion.p
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide text-xs [[dir=rtl]_&]:tracking-normal"
        >
          {t("createOne")}
        </Link>
      </motion.p>
    </form>
  )
}
