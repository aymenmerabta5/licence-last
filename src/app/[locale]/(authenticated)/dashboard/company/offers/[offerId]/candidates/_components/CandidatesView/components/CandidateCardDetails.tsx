"use client"

import { useLocale, useTranslations } from "next-intl"
import { getLanguageLabel, toSupportedLocale } from "@/lib/constants/languages"
import type { CandidateApp } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"

interface CandidateCardDetailsProps {
  app: CandidateApp
}

export function CandidateCardDetails({ app }: CandidateCardDetailsProps) {
  const locale = useLocale()
  const tExplore = useTranslations("dashboard.explore")
  const t = useTranslations("dashboard.company.candidates")
  const tProficiency = useTranslations("onboarding.student.proficiencyLevels")
  const languageLocale = toSupportedLocale(locale)

  return (
    <>
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="font-bold uppercase tracking-wider text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
          {tExplore("skills")}
        </span>
        <span className="font-serif text-sm text-heading">
          {app.skillMatchPercentage}
          <span className="text-[9px] text-muted-foreground/50">%</span>{" "}
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">
            {t("skillMatch")}
          </span>
        </span>
      </div>

      {app.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {app.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-medium text-primary/80"
            >
              {skill.name}
            </span>
          ))}
          {app.skills.length > 3 ? (
            <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60">
              +{app.skills.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      {app.languages.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
            {tExplore("languages")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {app.languages.slice(0, 3).map((language) => (
              <span
                key={language.languageCode}
                className="inline-flex items-center rounded-full bg-secondary/30 px-2 py-0.5 text-[9px] font-medium text-foreground/80"
              >
                {getLanguageLabel(language.languageCode, languageLocale)} ·{" "}
                {tProficiency(language.proficiency as "a1")}
              </span>
            ))}
            {app.languages.length > 3 ? (
              <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60">
                +{app.languages.length - 3}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
