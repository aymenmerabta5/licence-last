"use client"

import type { TurnstileInstance } from "@marsidev/react-turnstile"
import dynamic from "next/dynamic"
import { useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { type Ref, useImperativeHandle, useRef } from "react"

const Turnstile = dynamic(
  () => import("@marsidev/react-turnstile").then((mod) => mod.Turnstile),
  { ssr: false },
)

export interface CaptchaHandle {
  reset: () => void
}

export function isTurnstileEnabledOnClient() {
  return (
    Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) &&
    process.env.NEXT_PUBLIC_E2E_DISABLE_CAPTCHA !== "true"
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
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
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
