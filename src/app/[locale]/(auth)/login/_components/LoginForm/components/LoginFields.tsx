"use client"

import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import type { LoginFormApi } from "@/app/[locale]/(auth)/login/_components/LoginForm/hooks/useLoginForm"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/schemas/auth"

interface LoginFieldsProps {
  form: LoginFormApi
  showPassword: boolean
  onTogglePassword: () => void
}

export function LoginFields({
  form,
  showPassword,
  onTogglePassword,
}: LoginFieldsProps) {
  const t = useTranslations("auth.login")

  return (
    <>
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
                  onClick={onTogglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
    </>
  )
}
