"use client"

import { FileText, Languages, Wrench } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { ease, reveal } from "@/lib/animations"
import { getLanguageLabel, toSupportedLocale } from "@/lib/constants/languages"

interface OfferBodyProps {
  offer: OfferDetailProps["offer"]
}

export function OfferBody({ offer }: OfferBodyProps) {
  const locale = useLocale()
  const t = useTranslations("dashboard.offerDetail")
  const tProficiency = useTranslations(
    "dashboard.company.offers.form.proficiencyLevels",
  )
  const languageLocale = toSupportedLocale(locale)

  return (
    <div className="space-y-12">
      {/* Description */}
      <motion.section
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 border-b-2 border-border/80 pb-2">
          <FileText className="h-4 w-4 text-foreground shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
            {t("description")}
          </h2>
        </div>
        <div className="text-base text-heading leading-relaxed font-serif max-w-prose whitespace-pre-wrap first-letter:text-[2.8rem] first-letter:font-bold first-letter:leading-[1] first-letter:align-middle">
          {offer.description}
        </div>
      </motion.section>

      {/* Skills */}
      {offer.skills.length > 0 && (
        <motion.section
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.15 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-border/80 pb-2">
            <Wrench className="h-4 w-4 text-foreground shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
              {t("requiredSkills")}
            </h2>
          </div>
          <div className="flex justify-start flex-wrap gap-x-4 gap-y-3">
            {offer.skills.map((skill, i) => (
              <motion.span
                key={skill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.2 + i * 0.04 }}
                className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] bg-transparent border-b border-primary/30 text-primary pb-0.5 hover:border-primary transition-colors cursor-default"
              >
                {skill.name}
              </motion.span>
            ))}
          </div>
        </motion.section>
      )}

      {offer.languageRequirements.length > 0 && (
        <motion.section
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.18 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-border/80 pb-2">
            <Languages className="h-4 w-4 text-foreground shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
              {t("languageRequirements")}
            </h2>
          </div>
          <div className="flex justify-start flex-wrap gap-x-4 gap-y-3">
            {offer.languageRequirements.map((requirement, index) => (
              <motion.span
                key={requirement.languageCode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.22 + index * 0.04 }}
                className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] bg-transparent border-b border-border/60 text-foreground/80 pb-0.5"
              >
                {getLanguageLabel(requirement.languageCode, languageLocale)} ·{" "}
                {tProficiency(requirement.minimumProficiency as "a1")}
              </motion.span>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
