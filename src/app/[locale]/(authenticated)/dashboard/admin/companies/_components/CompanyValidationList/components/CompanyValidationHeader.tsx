"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease } from "@/lib/animations"

interface CompanyValidationHeaderProps {
  total: number
}

export function CompanyValidationHeader({ total }: CompanyValidationHeaderProps) {
  const t = useTranslations("dashboard.admin.companies")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="relative"
    >
      <div className="h-0.5 bg-primary" />
      <div className="border border-t-0 border-border/50 p-8 md:p-10">
        <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />

        <div className="mb-6 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
            {t("kicker")}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            {total} {t("title").toLowerCase()}
          </span>
        </div>

        <h1 className="max-w-xl font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>
    </motion.div>
  )
}
