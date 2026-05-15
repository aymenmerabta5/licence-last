"use client"

import { ArrowLeft, CheckCircle2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

export function SuccessMessage() {
  const t = useTranslations("auth.resetPassword")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease }}
      className="space-y-8"
    >
      <div className="flex items-start gap-3 p-4 text-sm bg-primary/5 border border-primary/15">
        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
        <div className="space-y-1">
          <p className="font-medium text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
            {t("success")}
          </p>
        </div>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide group [[dir=rtl]_&]:tracking-normal"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        {t("backToLogin")}
      </Link>
    </motion.div>
  )
}
