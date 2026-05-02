import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { isSavedOffersEnabledOnClient } from "@/lib/feature-flags-client"

export function ExploreHeader() {
  const t = useTranslations("dashboard.explore")
  const savedOffersEnabled = isSavedOffersEnabledOnClient()

  return (
    <motion.header
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="space-y-4"
    >
      <div className="h-0.5 bg-primary" />
      <div className="space-y-3">
        <div className="space-y-2">
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg">
            {t("subtitle")}
          </p>
        </div>
        {savedOffersEnabled && (
          <p className="text-xs text-muted-foreground">
            {t("savedOffersDescription")}{" "}
            <Link
              href="/dashboard/student/saved-offers"
              className="text-primary hover:underline underline-offset-2 font-medium"
            >
              {t("savedOffersAction")}
            </Link>
          </p>
        )}
      </div>
    </motion.header>
  )
}
