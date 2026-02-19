import { Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease, reveal } from "@/lib/animations"

export function AssistantHeader() {
  const t = useTranslations("dashboard.assistant")

  return (
    <motion.header
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="space-y-3 mb-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-none tracking-tight text-heading">
            {t.rich("title", {
              accent: (chunks) => (
                <span key="accent" className="text-primary">
                  {chunks}
                </span>
              ),
            })}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs tracking-wide">{t("badge")}</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
