"use client"

import { Calendar, ChevronRight, GraduationCap } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ValidationListItem } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Link } from "@/i18n/routing"
import {
  INTERNSHIP_TYPE_COLORS,
  INTERNSHIP_TYPE_LABELS,
} from "@/lib/constants/internship"

function formatCardDate(date: Date | string | null): string {
  if (!date) return "N/A"
  const parsedDate = typeof date === "string" ? new Date(date) : date

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface ValidationCardProps {
  application: ValidationListItem
  href: string
  namespace: string
}

export function ValidationCard({
  application,
  href,
  namespace,
}: ValidationCardProps) {
  const t = useTranslations(namespace)

  return (
    <Link
      href={href as "/dashboard"}
      className="block border border-border p-5 transition-all duration-200 hover:border-primary/30 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
              {application.student.name?.charAt(0).toUpperCase() ?? "?"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif text-lg text-heading">
                  {application.student.name || "Anonymous"}
                </span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="text-sm font-medium">
                  {application.company.name}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {application.university && (
                  <>
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>
                      {application.university.abbreviation ||
                        application.university.name}
                    </span>
                    {application.profile?.level && (
                      <span>&bull; {application.profile.level}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span
              className={`inline-flex items-center border px-2 py-0.5 font-semibold uppercase tracking-wider ${
                INTERNSHIP_TYPE_COLORS[application.offer.internshipType] ?? ""
              }`}
            >
              {INTERNSHIP_TYPE_LABELS[application.offer.internshipType] ??
                application.offer.internshipType}
            </span>

            <span className="text-muted-foreground">
              {application.offer.title}
            </span>

            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {t("companyAcceptedOn")}{" "}
              {formatCardDate(application.companyActionAt)}
            </span>
          </div>

          {application.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {application.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                >
                  {skill.name}
                </span>
              ))}
              {application.skills.length > 5 && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-muted-foreground">
                  +{application.skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}
