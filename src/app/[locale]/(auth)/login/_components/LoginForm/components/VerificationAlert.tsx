"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

interface VerificationAlertProps {
  onResend: () => void
}

export function VerificationAlert({ onResend }: VerificationAlertProps) {
  const t = useTranslations("auth.login")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
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
