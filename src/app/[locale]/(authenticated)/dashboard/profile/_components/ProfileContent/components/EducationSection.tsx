"use client"

import { GraduationCap, MapPin } from "lucide-react"
import * as motion from "motion/react-client"
import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface EducationSectionProps {
  profile?: StudentProfile | null
  university?: { name: string; city: string | null } | null
  canEdit: boolean
  labels: {
    education: string
    emptyMessage: string
    addEducation: string
    university: string
  }
}

export function EducationSection({
  profile,
  university,
  canEdit,
  labels,
}: EducationSectionProps) {
  const hasEducation = !!university

  return (
    <motion.section
      {...reveal}
      transition={{ delay: 0.4, duration: 0.6, ease }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-8 bg-primary/60" />
        <h2 className="font-serif text-xl sm:text-2xl text-heading">
          {labels.education}
        </h2>
      </div>

      {hasEducation ? (
        <div className="relative ps-6 sm:ps-8">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 start-[11px] sm:start-[15px] w-px bg-border" />

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute start-0 sm:start-1 top-2 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />

            <div className="border border-border/50 bg-card p-6 sm:p-8 ms-5 sm:ms-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wide">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {labels.university}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-heading leading-tight">
                    {university.name}
                  </h3>

                  {university.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {university.city}
                    </div>
                  )}

                  {profile?.department && (
                    <div className="pt-3 border-t border-border/20">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Department
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {profile.department}
                        {profile.level && ` — ${profile.level}`}
                      </p>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <Link href="/dashboard/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-md text-xs"
                    >
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="border border-dashed border-border/40 bg-card/50 p-10 text-center space-y-4">
          <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {labels.emptyMessage}
          </p>
          {canEdit && (
            <Link href="/dashboard/settings">
              <Button
                size="sm"
                className="rounded-md text-xs font-bold uppercase tracking-[0.15em]"
              >
                {labels.addEducation}
              </Button>
            </Link>
          )}
        </div>
      )}
    </motion.section>
  )
}
