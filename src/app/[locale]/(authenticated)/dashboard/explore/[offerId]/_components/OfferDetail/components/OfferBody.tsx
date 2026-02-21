"use client"

import { FileText, Wrench } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { ease, reveal } from "@/lib/animations"

interface OfferBodyProps {
  offer: OfferDetailProps["offer"]
}

export function OfferBody({ offer }: OfferBodyProps) {
  const t = useTranslations("dashboard.offerDetail")

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
    </div>
  )
}
