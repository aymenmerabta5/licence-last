"use client"

import { ArrowLeft, Clock, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ValidationsList } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/_components/AdminValidationsView/components/ValidationsList"
import { useAdminValidations } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/_components/AdminValidationsView/hooks/useAdminValidations"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

export function AdminValidationsView() {
  const t = useTranslations("dashboard.admin.validations")

  const { applications, isLoading, isFetchingNextPage, sentinelRef } =
    useAdminValidations()

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/admin" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToDashboard")}
        </Link>
        <header className="space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            Validation Center
          </p>
          <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
            {t("description")}
          </p>
        </header>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center space-y-2"
        >
          <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {applications.length > 0 && (
        <ValidationsList
          applications={applications}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  )
}
