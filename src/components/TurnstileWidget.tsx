"use client"

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { type Ref, useImperativeHandle, useRef } from "react"

import { env } from "@/env"

export interface CaptchaHandle {
  reset: () => void
}

export function isTurnstileEnabledOnClient() {
  return (
    Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) &&
    env.NEXT_PUBLIC_E2E_DISABLE_CAPTCHA !== "true"
  )
}

interface TurnstileWidgetProps {
  ref?: Ref<CaptchaHandle | null>
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export function TurnstileWidget({
  ref,
  onVerify,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const locale = useLocale()
  const { resolvedTheme } = useTheme()
  const internalRef = useRef<TurnstileInstance>(null)

  useImperativeHandle(ref, () => ({
    reset: () => internalRef.current?.reset(),
  }))

  if (!siteKey || !isTurnstileEnabledOnClient()) return null

  return (
    <Turnstile
      ref={internalRef}
      siteKey={siteKey}
      onSuccess={onVerify}
      onExpire={onExpire}
      onError={onError}
      options={{
        theme: resolvedTheme === "dark" ? "dark" : "light",
        language: locale,
      }}
    />
  )
}
