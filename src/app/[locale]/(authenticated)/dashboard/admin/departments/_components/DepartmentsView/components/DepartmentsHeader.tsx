"use client"

import { ArrowLeft } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function DepartmentsHeader() {
  const t = useTranslations("dashboard.admin.departments")

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <motion.div {...reveal} transition={revealWithDelay(0.05)}>
        <Link
          href={"/dashboard" as "/dashboard"}
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {t("backToDashboard")}
        </Link>
      </motion.div>

      <motion.div
        {...reveal}
        transition={revealWithDelay(0.1)}
        className="space-y-2"
      >
        <Badge variant="editorial-muted">Department Management</Badge>
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-sm font-light text-muted-foreground">
          {t("description")}
        </p>
      </motion.div>
    </header>
  )
}
