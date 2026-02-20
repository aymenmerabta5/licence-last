"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ease } from "@/lib/animations"

interface UniversityValidationHeaderProps {
  total: number
}

export function UniversityValidationHeader({
  total,
}: UniversityValidationHeaderProps) {
  const t = useTranslations("dashboard.admin.universities")

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="border-b border-border pb-6"
    >
      <header className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          {t("kicker")}
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
              {t("description")}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-4 border-l border-border/40 pl-6">
            <div className="text-right">
              <p className="font-serif text-3xl font-medium text-heading tracking-tight">
                {total}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                Total
              </p>
            </div>
          </div>
        </div>
      </header>
    </motion.div>
  )
}
