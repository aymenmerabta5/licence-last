"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { reveal, ease } from "@/lib/animations"

import type { OfferDetailProps } from "../types"

interface OfferBodyProps {
  offer: OfferDetailProps["offer"]
}

export function OfferBody({ offer }: OfferBodyProps) {
  const t = useTranslations("dashboard.offerDetail")

  return (
    <>
      <motion.div
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="font-serif text-lg text-heading">{t("description")}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {offer.description}
        </div>
      </motion.div>

      {offer.skills.length > 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="font-serif text-lg text-heading">
            {t("requiredSkills")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {offer.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-2.5 py-1 text-xs bg-primary/10 border border-primary/20 text-primary"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
