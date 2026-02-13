import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { reveal, ease } from "@/lib/animations"

export function ExploreHeader() {
  const t = useTranslations("dashboard.explore")

  return (
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      <h1 className="font-serif text-3xl text-heading tracking-tight">
        {t("title")}
      </h1>
      <p className="text-sm text-muted-foreground font-light mt-1">
        {t("subtitle")}
      </p>
    </motion.div>
  )
}
