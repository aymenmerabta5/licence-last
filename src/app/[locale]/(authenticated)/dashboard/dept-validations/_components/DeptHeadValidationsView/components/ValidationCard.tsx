import { useTranslations } from "next-intl"
import { GraduationCap, Calendar, ChevronRight } from "lucide-react"

import { Link } from "@/i18n/routing"
import {
  INTERNSHIP_TYPE_LABELS,
  INTERNSHIP_TYPE_COLORS,
} from "@/lib/constants/internship"

function formatDate(date: Date | string | null): string {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface ValidationCardProps {
  app: {
    id: string
    companyActionAt: Date | string | null
    student: { name: string | null }
    company: { name: string }
    university: { name: string; abbreviation: string | null } | null
    profile: { level: string | null } | null
    offer: { title: string; internshipType: string }
    skills: { id: string; name: string }[]
  }
}

export function ValidationCard({ app }: ValidationCardProps) {
  const t = useTranslations("dashboard.deptValidations")

  return (
    <Link
      href={`/dashboard/dept-validations/${app.id}` as "/dashboard"}
      className="block border border-border p-5 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3 flex-1">
          {/* Header: Student & Company */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
              {app.student.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-lg text-heading">
                  {app.student.name || "Anonymous"}
                </span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="font-medium text-sm">
                  {app.company.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {app.university && (
                  <>
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>
                      {app.university.abbreviation || app.university.name}
                    </span>
                    {app.profile?.level && (
                      <span>• {app.profile.level}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 font-semibold tracking-wider uppercase border ${
                INTERNSHIP_TYPE_COLORS[app.offer.internshipType] ?? ""
              }`}
            >
              {INTERNSHIP_TYPE_LABELS[app.offer.internshipType] ??
                app.offer.internshipType}
            </span>

            <span className="text-muted-foreground">
              {app.offer.title}
            </span>

            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {t("companyAcceptedOn")} {formatDate(app.companyActionAt)}
            </span>
          </div>

          {/* Skills */}
          {app.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {app.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
                >
                  {skill.name}
                </span>
              ))}
              {app.skills.length > 5 && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-muted-foreground">
                  +{app.skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}
