"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ShieldCheck, Mail, Key, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ServerError } from "@/components/ServerError"
import { reveal, ease } from "@/lib/animations"

import type { TwoFactorMethod } from "../hooks/useLoginForm"

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
    <div className="space-y-7">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      <ServerError message={serverError} />

      {/* Method tabs */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.05 }}
        className="flex gap-1 p-1 border border-border/40 bg-muted/30"
      >
        {methods.map(({ key, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onMethodChange(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              method === key
                ? "bg-background text-heading shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(key)}
          </button>
        ))}
      </motion.div>

      {/* Code input */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label
            htmlFor="two-factor-code"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {t("codeLabel")}
          </Label>
          <Input
            id="two-factor-code"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={t("codePlaceholder")}
            className="h-12 text-center text-lg tracking-[0.3em] font-mono border-border/40"
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
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs border-dashed"
            onClick={onSendOtp}
          >
            <Mail className="h-3.5 w-3.5 me-1.5" />
            {t("sendOtp")}
          </Button>
        )}

        {/* Trust device */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="trust-device"
            checked={trustDevice}
            onCheckedChange={(checked) => onTrustDeviceChange(checked === true)}
          />
          <Label
            htmlFor="trust-device"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {t("trustDevice")}
          </Label>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="space-y-3"
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
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mx-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5 [[dir=rtl]_&]:rotate-180" />
          {t("backToLogin")}
        </button>
      </motion.div>
    </div>
  )
}
