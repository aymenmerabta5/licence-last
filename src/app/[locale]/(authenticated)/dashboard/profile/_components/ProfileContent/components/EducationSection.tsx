"use client"

import * as motion from "motion/react-client"
import { BookOpen, MapPin, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

import type { StudentProfile, StudentUniversity } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"

interface EducationSectionProps {
  profile?: StudentProfile | null
  university?: StudentUniversity | null
  canEdit: boolean
  labels: {
    education: string
    emptyMessage: string
    addEducation: string
    university: string
  }
}

export function EducationSection({ profile, university, canEdit, labels }: EducationSectionProps) {
  const hasEducation = !!university

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease }}
    >
      {/* Section header with accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-0.5 bg-primary" />
        <h2 className="font-serif text-2xl font-bold text-heading tracking-tight">
          {labels.education}
        </h2>
      </div>

      {hasEducation ? (
        <div className="relative ps-8">
          {/* Timeline line */}
          <div className="absolute start-0 top-0 bottom-0 w-px bg-border/40" />

          {/* Timeline dot */}
          <div className="absolute start-0 top-3 -translate-x-1/2 h-3 w-3 rounded-full border-2 border-primary bg-background" />

          <div className="border border-border/40 p-6 relative group transition-all hover:border-primary/20">
            {/* Hover accent */}
            <div className="absolute top-0 start-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500" />

            <div className="flex items-start gap-5">
              <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-1 [[dir=rtl]_&]:tracking-normal">
                    {labels.university}
                  </p>
                  <h3 className="text-base font-bold text-heading leading-tight">
                    {university.name}
                    {university.abbreviation && (
                      <span className="text-muted-foreground/50 font-normal ms-2 text-sm">
                        ({university.abbreviation})
                      </span>
                    )}
                  </h3>
                </div>

                {(profile?.department || profile?.level) && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {[profile.department, profile.level].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                )}

                {university.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground/60 font-medium">
                      {university.city}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border/30 p-8 sm:p-10">
          <div className="text-center space-y-3 max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/5">
              <BookOpen className="h-5 w-5 text-primary/30" />
            </div>
            <p className="text-sm text-muted-foreground/50 font-light leading-relaxed">
              {labels.emptyMessage}
            </p>
            {canEdit && (
              <Link href="/dashboard/settings" className="inline-block mt-2">
                <Button
                  variant="editorial-outline"
                  size="sm"
                  className="border-border/40 hover:border-primary h-9 px-5"
                >
                  {labels.addEducation}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.section>
  )
}
