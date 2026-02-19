"use client"

import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface DeptHeadPlacementHeaderProps {
  isLoading: boolean
  hasApplication: boolean
  studentName?: string | null
  companyName?: string | null
}

export function DeptHeadPlacementHeader({
  isLoading,
  hasApplication,
  studentName,
  companyName,
}: DeptHeadPlacementHeaderProps) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const td = useTranslations("dashboard.admin.deptValidations")

  return (
    <>
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/dept-validations" as "/dashboard"}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {td("backToDashboard")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl tracking-tight text-heading">
            {t("title")}
          </h1>
          {studentName && companyName && (
            <p className="text-sm font-light text-muted-foreground">
              {studentName} {"->"} {companyName}
            </p>
          )}
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && !hasApplication && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="space-y-2 border border-dashed border-border p-12 text-center"
        >
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
        </motion.div>
      )}
    </>
  )
}
