import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface PlacementHeaderProps {
  isLoading: boolean
  hasApplication: boolean
  studentName?: string | null
  companyName?: string | null
}

export function PlacementHeader({
  isLoading,
  hasApplication,
  studentName,
  companyName,
}: PlacementHeaderProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <>
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/admin/validations" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToList")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          {studentName && companyName && (
            <p className="text-sm text-muted-foreground font-light">
              {studentName} → {companyName}
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
          className="border border-dashed border-border p-12 text-center space-y-2"
        >
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
        </motion.div>
      )}
    </>
  )
}
