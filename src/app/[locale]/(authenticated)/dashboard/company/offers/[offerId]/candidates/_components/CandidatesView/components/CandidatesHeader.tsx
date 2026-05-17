import { ArrowLeft, Users } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface CandidatesHeaderProps {
  offerTitle?: string
  totalCandidates?: number
}

export function CandidatesHeader({
  offerTitle,
  totalCandidates,
}: CandidatesHeaderProps) {
  const t = useTranslations("dashboard.company.candidates")

  return (
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      <Link
        href={"/dashboard/company/offers" as "/dashboard"}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-5 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform [[dir=rtl]_&]:rotate-180 [[dir=rtl]_&]:group-hover:translate-x-0.5" />
        {t("backToOffers")}
      </Link>

      <div className="h-0.5 bg-primary" />
      <div className="border border-t-0 border-border/50 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge variant="editorial-muted">{t("kicker")}</Badge>
            <h1 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.08] tracking-tight text-heading">
              {t("pipelineHeading")}
            </h1>
            {offerTitle && (
              <p className="text-sm text-muted-foreground font-light max-w-lg">
                {offerTitle}
              </p>
            )}
          </div>

          {totalCandidates !== undefined && totalCandidates > 0 && (
            <div className="flex items-center gap-3 border-s-2 border-primary/20 ps-4 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center border border-border/50 bg-primary/5">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                  {t("candidateCountLabel")}
                </span>
                <p className="font-serif text-3xl font-bold text-heading leading-none tabular-nums mt-0.5">
                  {totalCandidates}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
