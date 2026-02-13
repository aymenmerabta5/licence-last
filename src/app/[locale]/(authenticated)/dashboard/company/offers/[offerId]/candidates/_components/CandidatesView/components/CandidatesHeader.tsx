import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"

interface CandidatesHeaderProps {
  offerTitle?: string
}

export function CandidatesHeader({ offerTitle }: CandidatesHeaderProps) {
  const t = useTranslations("dashboard.company.candidates")

  return (
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      <Link
        href={"/dashboard/company/offers" as "/dashboard"}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("backToOffers")}
      </Link>
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          {t("title")} - Pipeline
        </h1>
        {offerTitle && (
          <p className="text-sm text-muted-foreground font-light">
            {offerTitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
