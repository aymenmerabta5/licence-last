"use client"

import { FileText, Languages, Wrench } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
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
    <div className="space-y-8">
      {/* Description */}
      <section className="border border-border/50">
        <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl text-heading">
            {t("description")}
          </h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-heading leading-relaxed whitespace-pre-wrap">
            {offer.description}
          </p>
        </div>
      </section>

      {/* Skills */}
      {offer.skills.length > 0 && (
        <section className="border border-border/50">
          <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
            <Wrench className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-xl text-heading">
              {t("requiredSkills")}
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-wrap gap-2">
              {offer.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-primary/5 border border-primary/10 text-primary/80 [[dir=rtl]_&]:tracking-normal"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Languages */}
      {offer.languageRequirements.length > 0 && (
        <section className="border border-border/50">
          <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
            <Languages className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-xl text-heading">
              {t("languageRequirements")}
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-wrap gap-2">
              {offer.languageRequirements.map((requirement) => (
                <span
                  key={requirement.languageCode}
                  className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-secondary/30 border border-border/40 text-foreground/80 [[dir=rtl]_&]:tracking-normal"
                >
                  {getLanguageLabel(requirement.languageCode, languageLocale)} ·{" "}
                  {tProficiency(requirement.minimumProficiency as "a1")}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
