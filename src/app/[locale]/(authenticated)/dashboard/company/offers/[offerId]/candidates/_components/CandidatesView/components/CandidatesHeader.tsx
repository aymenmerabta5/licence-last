import { ArrowLeft, Kanban } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      <Link
        href={"/dashboard/company/offers" as "/dashboard"}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-5 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform [[dir=rtl]_&]:rotate-180 [[dir=rtl]_&]:group-hover:translate-x-0.5" />
        {t("backToOffers")}
      </Link>

      <div className="h-0.5 bg-primary" />
      <div className="border border-t-0 border-border/50 p-6 sm:p-8 relative overflow-hidden">
        {/* Dark mode glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Kanban className="h-3.5 w-3.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
                {t("title")}
              </span>
            </div>
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
            <div className="border-s-2 border-primary/20 ps-4 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                {t("candidateCountLabel")}
              </span>
              <p className="font-serif text-3xl font-bold text-heading leading-none tabular-nums mt-0.5">
                {totalCandidates}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
