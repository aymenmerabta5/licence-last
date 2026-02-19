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
      className="pb-8 mb-8 border-b border-border"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
              {t("kicker")}
            </span>
          </div>

          <h1 className="font-serif text-4xl leading-tight tracking-tight text-heading sm:text-5xl">
            {t("title")}
          </h1>

          <p className="text-base font-light leading-relaxed text-muted-foreground max-w-lg">
            {t("description")}
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center p-6 border border-border/40 rounded-sm bg-muted/10">
          <div className="text-center">
            <p className="font-serif text-3xl font-medium text-heading tracking-tight">
              {total}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {t("title").toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
