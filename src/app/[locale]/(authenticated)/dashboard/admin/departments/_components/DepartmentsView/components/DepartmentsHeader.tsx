"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, revealWithDelay } from "@/lib/animations"

export function DepartmentsHeader() {
  const t = useTranslations("dashboard.admin.departments")

  return (
    <motion.div {...reveal} transition={revealWithDelay(0)}>
      <Link
        href={"/dashboard/admin" as "/dashboard"}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("backToDashboard")}
      </Link>

      <div className="space-y-2 border border-border/50 bg-background px-6 py-7">
        <h1 className="font-serif text-[clamp(1.9rem,4vw,2.7rem)] leading-none tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
      </div>
    </motion.div>
  )
}
