"use client"

import { ArrowLeft, Key, Loader2, Mail, ShieldCheck } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { TwoFactorMethod } from "@/app/[locale]/(auth)/login/_components/LoginForm/hooks/twoFactorUtils"
import { ServerError } from "@/components/ServerError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ease, reveal } from "@/lib/animations"

interface TwoFactorStepProps {
  method: TwoFactorMethod
  onMethodChange: (method: TwoFactorMethod) => void
  code: string
  onCodeChange: (code: string) => void
  trustDevice: boolean
  onTrustDeviceChange: (trust: boolean) => void
  isVerifying: boolean
  onVerify: () => void
  onSendOtp: () => void
  onBack: () => void
  serverError: string
}

const methods: { key: TwoFactorMethod; Icon: typeof ShieldCheck }[] = [
  { key: "totp", Icon: ShieldCheck },
  { key: "otp", Icon: Mail },
  { key: "backup", Icon: Key },
]

export function TwoFactorStep({
  method,
  onMethodChange,
  code,
  onCodeChange,
  trustDevice,
  onTrustDeviceChange,
  isVerifying,
  onVerify,
  onSendOtp,
  onBack,
  serverError,
}: TwoFactorStepProps) {
  const t = useTranslations("auth.login.twoFactor")

  return (
    <div className="space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      <ServerError message={serverError} />

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.05 }}
        className="border-b border-border/60"
      >
        <div className="flex">
          {methods.map(({ key, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onMethodChange(key)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 pb-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
                method === key
                  ? "text-heading"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(key)}</span>
              {method === key && (
                <motion.span
                  layoutId="2fa-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <div className="space-y-2">
          <label
            htmlFor="two-factor-code"
            className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
          >
            {t("codeLabel")}
          </label>
          <Input
            id="two-factor-code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={t("codePlaceholder")}
            className="h-12 rounded-none text-center text-lg tracking-[0.3em] font-mono border-border/60 focus-visible:border-ring"
            maxLength={method === "backup" ? 10 : 6}
            autoFocus
            autoComplete="one-time-code"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                onVerify()
              }
            }}
          />
        </div>

        {method === "otp" && (
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="w-full"
            onClick={onSendOtp}
          >
            <Mail className="h-3.5 w-3.5 me-1.5" />
            {t("sendOtp")}
          </Button>
        )}

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => onTrustDeviceChange(e.target.checked)}
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
            {t("trustDevice")}
          </span>
        </label>
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="space-y-4"
      >
        <Button
          type="button"
          variant="editorial"
          size="editorial"
          className="w-full h-12"
          disabled={isVerifying || !code.trim()}
          onClick={onVerify}
        >
          {isVerifying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("verify")
          )}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide [[dir=rtl]_&]:tracking-normal"
        >
          <ArrowLeft className="h-3.5 w-3.5 [[dir=rtl]_&]:rotate-180" />
          {t("backToLogin")}
        </button>
      </motion.div>
    </div>
  )
}
