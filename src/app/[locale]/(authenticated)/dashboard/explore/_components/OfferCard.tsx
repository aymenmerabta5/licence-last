"use client"

import { ArrowRight, Building2, Clock, MapPin, Users } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import {
  getLanguageLabel,
  toSupportedLocale,
} from "@/lib/constants/languages"
import { INTERNSHIP_TYPE_COLORS } from "@/lib/constants/internship"
import { cn } from "@/lib/utils"
import { getWilayaName } from "@/lib/wilayas"

interface OfferCardProps {
  offer: {
    id: string
    title: string
    description: string
    internshipType: string
    workMode: string | null
    wilayaCode: number | null
    durationWeeks: number | null
    maxPositions: number
    createdAt: Date
    companyName: string
    companySlug: string
    companyLogoUrl: string | null
    skills: { id: string; name: string }[]
    languageRequirements: {
      languageCode: string
      minimumProficiency: string
      isRequired: boolean
    }[]
  }
}

const MAX_VISIBLE_SKILLS = 4
const MAX_VISIBLE_LANGUAGES = 2

/** Top accent color per internship type */
const TYPE_ACCENT: Record<string, string> = {
  pfe: "bg-purple-500",
  immersion: "bg-blue-500",
  summer: "bg-amber-500",
  practical: "bg-emerald-500",
}

export function OfferCard({ offer }: OfferCardProps) {
  const locale = useLocale()
  const t = useTranslations("dashboard.explore")
  const tProficiency = useTranslations("dashboard.company.offers.form.proficiencyLevels")

  const initial = offer.companyName.charAt(0).toUpperCase()
  const hiddenSkillCount = Math.max(0, offer.skills.length - MAX_VISIBLE_SKILLS)
  const hiddenLanguageCount = Math.max(
    0,
    offer.languageRequirements.length - MAX_VISIBLE_LANGUAGES,
  )
  const wilayaName = getWilayaName(offer.wilayaCode)
  const accentColor = TYPE_ACCENT[offer.internshipType] ?? "bg-primary"
  const typeColorClasses = INTERNSHIP_TYPE_COLORS[offer.internshipType] ?? ""
  const languageLocale = toSupportedLocale(locale)

  return (
    <Link
      href={`/dashboard/explore/${offer.id}` as "/dashboard"}
      className="block group"
    >
      <article className="relative border border-border/60 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-md dark:hover:shadow-primary/5 overflow-hidden">
        {/* Type accent line at top */}
        <div className={cn("h-0.5", accentColor)} />

        <div className="p-5 space-y-4">
          {/* Company row */}
          <div className="flex items-start gap-3">
            {offer.companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.companyLogoUrl}
                alt={offer.companyName}
                className="h-10 w-10 object-cover border border-border/60 shrink-0"
              />
            ) : (
              <div className="h-10 w-10 border border-border/60 bg-primary/5 flex items-center justify-center text-sm font-serif text-primary shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-base leading-tight text-heading tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {offer.title}
              </h3>
              <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{offer.companyName}</span>
              </p>
            </div>
          </div>

          {/* Description excerpt */}
          <p className="text-xs text-muted-foreground/50 font-light leading-relaxed line-clamp-2">
            {offer.description}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border",
                typeColorClasses,
                "[[dir=rtl]_&]:tracking-normal",
              )}
            >
              {t(`type.${offer.internshipType}` as "type.pfe")}
            </span>
            {offer.workMode && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] tracking-wider uppercase border border-border/60 text-muted-foreground/60 font-medium [[dir=rtl]_&]:tracking-normal">
                {t(
                  `workModeLabel.${offer.workMode}` as "workModeLabel.on_site",
                )}
              </span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/50">
            {wilayaName && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {wilayaName}
              </span>
            )}
            {offer.durationWeeks && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {offer.durationWeeks} {t("weeks")}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {offer.maxPositions} {t("positions")}
            </span>
          </div>

          {/* Skills */}
          {offer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
              {offer.skills.slice(0, MAX_VISIBLE_SKILLS).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-primary/5 border border-primary/10 text-primary/70 font-medium"
                >
                  {skill.name}
                </span>
              ))}
              {hiddenSkillCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-muted/50 border border-border/40 text-muted-foreground/40 font-medium">
                  +{hiddenSkillCount}
                </span>
              )}
            </div>
          )}

          {offer.languageRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {offer.languageRequirements
                .slice(0, MAX_VISIBLE_LANGUAGES)
                .map((requirement) => (
                  <span
                    key={requirement.languageCode}
                    className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-secondary/30 border border-border/40 text-foreground/70 font-medium"
                  >
                    {getLanguageLabel(requirement.languageCode, languageLocale)} ·{" "}
                    {tProficiency(requirement.minimumProficiency as "a1")}
                  </span>
                ))}
              {hiddenLanguageCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-muted/50 border border-border/40 text-muted-foreground/40 font-medium">
                  +{hiddenLanguageCount}
                </span>
              )}
            </div>
          )}

          {/* Hover CTA */}
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-primary opacity-0 group-hover:opacity-100 transition-opacity [[dir=rtl]_&]:tracking-normal">
            {t("viewDetails") ?? "View Details"}
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </article>
    </Link>
  )
}
