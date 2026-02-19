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
      className="border border-border bg-primary/5 p-4 rounded-none space-y-3"
    >
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
        {t("aiSummary.title")}
      </p>
      <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
        {summaryBullets.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>

      {suggestedNextActions.length > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            {t("aiSummary.suggestedNextActions")}
          </p>
          <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
            {suggestedNextActions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
