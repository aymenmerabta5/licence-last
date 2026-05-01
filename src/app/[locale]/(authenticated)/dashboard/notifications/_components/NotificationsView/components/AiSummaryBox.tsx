import { Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease, reveal } from "@/lib/animations"

interface AiSummaryBoxProps {
  summaryBullets: string[]
  suggestedNextActions: string[]
}

export function AiSummaryBox({
  summaryBullets,
  suggestedNextActions,
}: AiSummaryBoxProps) {
  const t = useTranslations("dashboard.notifications")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.06 }}
      className="border border-border/60 bg-primary/[0.03] rounded-sm overflow-hidden"
    >
      <div className="flex items-center gap-2.5 border-b border-border/40 bg-primary/[0.04] px-5 py-3.5">
        <Sparkles className="h-3.5 w-3.5 text-primary/70" />
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/80">
          {t("aiSummary.title")}
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        <ul className="list-disc ps-4 text-sm text-muted-foreground space-y-1">
          {summaryBullets.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        {suggestedNextActions.length > 0 && (
          <div className="pt-3 border-t border-border/40">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">
              {t("aiSummary.suggestedNextActions")}
            </p>
            <ul className="list-disc ps-4 text-sm text-muted-foreground space-y-1">
              {suggestedNextActions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}
