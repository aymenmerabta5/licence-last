"use client"

import { useRef, useImperativeHandle, type Ref } from "react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useLocale } from "next-intl"
import { useTheme } from "next-themes"

import { env } from "@/env"

export interface CaptchaHandle {
  reset: () => void
}

interface TurnstileWidgetProps {
  ref?: Ref<CaptchaHandle | null>
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export function TurnstileWidget({ ref, onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const locale = useLocale()
  const { resolvedTheme } = useTheme()
  const internalRef = useRef<TurnstileInstance>(null)

  useImperativeHandle(ref, () => ({
    reset: () => internalRef.current?.reset(),
  }))

  if (!siteKey) return null

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
