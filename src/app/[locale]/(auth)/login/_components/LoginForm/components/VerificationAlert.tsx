"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { reveal } from "@/lib/animations"

interface VerificationAlertProps {
  onResend: () => void
}

export function VerificationAlert({ onResend }: VerificationAlertProps) {
  const t = useTranslations("auth.login")

  return (
    <motion.div {...reveal} className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-none"
        onClick={onResend}
      >
        {t("resendVerification")}
      </Button>
    </motion.div>
  )
}
