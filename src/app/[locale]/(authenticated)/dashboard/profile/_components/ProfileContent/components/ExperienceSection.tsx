"use client"

import { Briefcase, Calendar } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale } from "next-intl"
import type { StudentExperience } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface ExperienceSectionProps {
  experiences: StudentExperience[]
  canEdit: boolean
  labels: {
    experience: string
    emptyMessage: string
    addExperience: string
  }
}

export function ExperienceSection({
  experiences,
  canEdit,
  labels,
}: ExperienceSectionProps) {
  const locale = useLocale()
  const hasExperience = experiences.length > 0
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  })

  return (
    <motion.section
      {...reveal}
      transition={{ delay: 0.5, duration: 0.6, ease }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-8 bg-primary/60" />
        <h2 className="font-serif text-xl sm:text-2xl text-heading">
          {labels.experience}
        </h2>
      </div>

      {hasExperience ? (
        <div className="relative ps-6 sm:ps-8 space-y-6">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 start-[11px] sm:start-[15px] w-px bg-border" />

          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + idx * 0.08 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className="absolute start-0 sm:start-1 top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />

              <div className="border border-border/50 bg-card p-6 sm:p-8 ms-5 sm:ms-6">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wide">
                        <Briefcase className="h-3.5 w-3.5" />
                        {exp.organization}
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl text-heading leading-tight mt-1">
                        {exp.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-muted border border-border/20 text-muted-foreground text-[11px] font-bold uppercase tracking-wider shrink-0">
                      <Calendar className="h-3 w-3" />
                      {dateFormatter.format(exp.startDate)} —{" "}
                      {exp.endDate
                        ? dateFormatter.format(exp.endDate)
                        : "Present"}
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl pt-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {canEdit && (
            <div className="ms-5 sm:ms-6">
              <Link href="/dashboard/settings">
                <button
                  type="button"
                  className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors"
                >
                  + {labels.addExperience}
                </button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-border/40 bg-card/50 p-10 text-center space-y-4">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {labels.emptyMessage}
          </p>
          {canEdit && (
            <Link href="/dashboard/settings">
              <Button
                size="sm"
                className="rounded-md text-xs font-bold uppercase tracking-[0.15em]"
              >
                {labels.addExperience}
              </Button>
            </Link>
          )}
        </div>
      )}
    </motion.section>
  )
}
