"use client"

import * as motion from "motion/react-client"
import { Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

import type { StudentExperience } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"

interface ExperienceSectionProps {
  labels: {
    experience: string
    emptyMessage: string
    addExperience: string
  }
  canEdit: boolean
  experiences: StudentExperience[]
}

function formatPeriod(startDate: Date, endDate: Date | null, isCurrent: boolean) {
  const start = new Date(startDate).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  })

  if (isCurrent) return `${start} - Present`

  if (!endDate) return `${start} - N/A`

  const end = new Date(endDate).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  })

  return `${start} - ${end}`
}

export function ExperienceSection({ labels, canEdit, experiences }: ExperienceSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease }}
    >
      {/* Section header with accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-0.5 bg-primary" />
        <h2 className="font-serif text-2xl font-bold text-heading tracking-tight">
          {labels.experience}
        </h2>
      </div>

      {experiences.length === 0 ? (
        <div className="border border-dashed border-border/30 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-24 h-24 bg-primary/[0.02] blur-[50px] rounded-full" />
          <div className="relative text-center space-y-3 max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/5">
              <Briefcase className="h-5 w-5 text-primary/30" />
            </div>
            <p className="text-sm text-muted-foreground/50 font-light leading-relaxed">
              {labels.emptyMessage}
            </p>
            {canEdit && (
              <Link href="/dashboard/student/cv" className="inline-block mt-2">
                <Button
                  variant="editorial-outline"
                  size="sm"
                  className="border-border/40 hover:border-primary h-9 px-5"
                >
                  {labels.addExperience}
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <article key={experience.id} className="border border-border/40 p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-heading">{experience.title}</h3>
                  <p className="text-sm text-muted-foreground">{experience.organization}</p>
                </div>
                <span className="text-xs text-muted-foreground/70">
                  {formatPeriod(experience.startDate, experience.endDate, experience.isCurrent)}
                </span>
              </div>
              {experience.description && (
                <p className="text-sm text-foreground/80 leading-relaxed">{experience.description}</p>
              )}
            </article>
          ))}

          {canEdit && (
            <div className="pt-2">
              <Link href="/dashboard/student/cv">
                <Button variant="editorial-outline" size="sm" className="h-9 px-5">
                  Manage CV
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.section>
  )
}
