"use client"

import { useTranslations } from "next-intl"
import { MapPin, Clock, Users, Building2 } from "lucide-react"

import { Link } from "@/i18n/routing"

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
  }
}

const MAX_VISIBLE_SKILLS = 5

export function OfferCard({ offer }: OfferCardProps) {
  const t = useTranslations("dashboard.explore")

  const initial = offer.companyName.charAt(0).toUpperCase()
  const hiddenSkillCount = Math.max(0, offer.skills.length - MAX_VISIBLE_SKILLS)

  return (
    <Link
      href={`/dashboard/explore/${offer.id}` as "/dashboard"}
      className="block group"
    >
      <article className="border border-border p-5 space-y-3 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-sm">
        {/* Company row */}
        <div className="flex items-center gap-3">
          {offer.companyLogoUrl ? (
            <img
              src={offer.companyLogoUrl}
              alt={offer.companyName}
              className="h-9 w-9 rounded object-cover border border-border"
            />
          ) : (
            <div className="h-9 w-9 rounded border border-border bg-primary/10 flex items-center justify-center text-sm font-serif text-primary">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-serif text-base text-heading tracking-tight truncate group-hover:text-primary transition-colors">
              {offer.title}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {offer.companyName}
            </p>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border border-primary/20 bg-primary/10 text-primary">
            {t(`type.${offer.internshipType}` as "type.pfe")}
          </span>
          {offer.workMode && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider uppercase border border-border text-muted-foreground">
              {t(`workModeLabel.${offer.workMode}` as "workModeLabel.on_site")}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {offer.wilayaCode && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {String(offer.wilayaCode).padStart(2, "0")}
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
          <div className="flex flex-wrap gap-1">
            {offer.skills.slice(0, MAX_VISIBLE_SKILLS).map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-1.5 py-0.5 text-[10px] bg-secondary/50 border border-border text-muted-foreground"
              >
                {skill.name}
              </span>
            ))}
            {hiddenSkillCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] bg-secondary/50 border border-border text-muted-foreground">
                +{hiddenSkillCount}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
